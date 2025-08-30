import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import remittanceService from '../../services/web3/remittance.service';
import walletService from '../../services/web3/wallet.service';
import logger, { logRemittance, logSecurity } from '../../utils/logger';
import redisService from '../../services/redis';
import { Address } from 'viem';

// Validation middleware
export const validateSendRemittance = [
  body('senderAddress')
    .isEthereumAddress()
    .withMessage('Invalid sender address'),
  body('receiverPhone')
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  body('amountUsd')
    .isFloat({ min: 1, max: 999 })
    .withMessage('Amount must be between $1 and $999'),
  body('chainId')
    .isIn([8453, 10])
    .withMessage('Unsupported chain ID'),
  body('ensSubdomain')
    .optional()
    .isLength({ max: 100 })
    .withMessage('ENS subdomain too long'),
  body('purpose')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Purpose too long'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes too long'),
];

// POST /api/remittance/send
export const sendRemittance = async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      senderAddress,
      receiverPhone,
      amountUsd,
      chainId,
      ensSubdomain,
      purpose,
      notes
    } = req.body;

    // Rate limiting per sender
    const rateLimitKey = `send_rate_limit:${senderAddress}`;
    const isRateLimited = await redisService.isRateLimited(rateLimitKey, 5, 3600); // 5 sends per hour
    
    if (isRateLimited) {
      logSecurity('RATE_LIMIT_EXCEEDED', senderAddress, { action: 'send_remittance' });
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    // TODO: KYC verification (if enabled)
    // TODO: Sanctions check
    // TODO: AML compliance check

    // Calculate fees
    const feeInfo = await remittanceService.calculateRemittanceFee(amountUsd);
    
    // Send remittance
    const remittanceInfo = await remittanceService.sendRemittance({
      senderAddress: senderAddress as Address,
      receiverPhone,
      amountUsd,
      chainId,
      ensSubdomain,
      purpose,
      notes
    });

    // Log the transaction
    logRemittance('SEND_INITIATED', remittanceInfo.id, {
      senderAddress,
      amountUsd,
      fee: feeInfo.fee,
      chainId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Remittance initiated successfully',
      data: {
        remittanceId: remittanceInfo.id,
        amount: remittanceInfo.amount,
        fee: remittanceInfo.fee,
        total: feeInfo.total,
        phoneHash: remittanceInfo.phoneHash,
        unlockTime: remittanceInfo.unlockTime,
        estimatedGas: '0.001', // This would be calculated dynamically
      }
    });

  } catch (error) {
    logger.error('Error in sendRemittance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST /api/remittance/confirm
export const confirmRemittance = async (req: Request, res: Response) => {
  try {
    const { remittanceId, txHash, chainId } = req.body;

    if (!remittanceId || !txHash || !chainId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Confirm the remittance
    await remittanceService.confirmRemittance(remittanceId, txHash, chainId);

    res.json({
      success: true,
      message: 'Remittance confirmed successfully'
    });

  } catch (error) {
    logger.error('Error in confirmRemittance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm remittance'
    });
  }
};

// POST /api/remittance/claim
export const claimRemittance = async (req: Request, res: Response) => {
  try {
    const {
      remittanceId,
      merchantAddress,
      verificationCode,
      chainId
    } = req.body;

    // Validation
    if (!remittanceId || !merchantAddress || !verificationCode || !chainId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (!walletService.isValidAddress(merchantAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid merchant address'
      });
    }

    // Rate limiting per merchant
    const rateLimitKey = `claim_rate_limit:${merchantAddress}`;
    const isRateLimited = await redisService.isRateLimited(rateLimitKey, 10, 3600); // 10 claims per hour
    
    if (isRateLimited) {
      logSecurity('RATE_LIMIT_EXCEEDED', merchantAddress, { action: 'claim_remittance' });
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    // Claim the remittance
    const txHash = await remittanceService.claimRemittance({
      remittanceId,
      merchantAddress: merchantAddress as Address,
      verificationCode,
      chainId
    });

    // Log the claim
    logRemittance('CLAIM_INITIATED', remittanceId, {
      merchantAddress,
      txHash,
      chainId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Remittance claimed successfully',
      data: {
        txHash,
        remittanceId
      }
    });

  } catch (error) {
    logger.error('Error in claimRemittance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to claim remittance'
    });
  }
};

// GET /api/remittance/:id
export const getRemittance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Remittance ID is required'
      });
    }

    const remittance = await remittanceService.getRemittance(id);

    if (!remittance) {
      return res.status(404).json({
        success: false,
        message: 'Remittance not found'
      });
    }

    res.json({
      success: true,
      data: remittance
    });

  } catch (error) {
    logger.error('Error in getRemittance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/remittance/phone/:phoneNumber
export const getRemittancesByPhone = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.params;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Rate limiting for phone number queries
    const rateLimitKey = `phone_query_rate_limit:${phoneNumber}`;
    const isRateLimited = await redisService.isRateLimited(rateLimitKey, 20, 3600); // 20 queries per hour
    
    if (isRateLimited) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests for this phone number'
      });
    }

    const remittances = await remittanceService.getRemittancesByPhone(phoneNumber);

    res.json({
      success: true,
      data: remittances,
      count: remittances.length
    });

  } catch (error) {
    logger.error('Error in getRemittancesByPhone:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/remittance/fee/:amount
export const calculateFee = async (req: Request, res: Response) => {
  try {
    const { amount } = req.params;
    const amountUsd = parseFloat(amount);

    if (isNaN(amountUsd) || amountUsd <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const feeInfo = await remittanceService.calculateRemittanceFee(amountUsd);

    res.json({
      success: true,
      data: {
        amount: amountUsd,
        fee: feeInfo.fee,
        total: feeInfo.total,
        feePercentage: 0.5
      }
    });

  } catch (error) {
    logger.error('Error in calculateFee:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/remittance/pending/:phoneNumber
export const checkPendingRemittances = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.params;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const hasPending = await remittanceService.hasPendingRemittances(phoneNumber);

    res.json({
      success: true,
      data: {
        phoneNumber,
        hasPendingRemittances: hasPending
      }
    });

  } catch (error) {
    logger.error('Error in checkPendingRemittances:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
