import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import logger from '../utils/logger';

// Validation middleware for remittance creation
export const validateSendRemittance = [
  body('senderAddress').notEmpty().withMessage('Sender address is required'),
  body('receiverPhone').notEmpty().withMessage('Receiver phone is required'),
  body('amountUsd').isNumeric().withMessage('Amount must be numeric'),
  body('recipientName').notEmpty().withMessage('Recipient name is required')
];

// POST /api/remittance/send - Create a new remittance
export const sendRemittance = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { senderAddress, receiverPhone, amountUsd, recipientName, receiverAddress, isManualEntry } = req.body;

    // Create a mock remittance for now (will be replaced with database logic)
    const remittance = {
      id: Date.now(),
      senderAddress,
      receiverPhone,
      amountUsd: parseFloat(amountUsd),
      recipientName,
      receiverAddress: receiverAddress || null,
      status: 'PENDING',
      createdAt: new Date(),
      isManualEntry: isManualEntry || false
    };

    logger.info('Remittance created successfully', {
      remittanceId: remittance.id,
      senderAddress,
      receiverPhone,
      amountUsd
    });

    res.status(201).json({
      success: true,
      message: 'Remittance created successfully',
      data: {
        remittanceId: remittance.id,
        recipient: {
          name: recipientName,
          phone: receiverPhone,
          walletAddress: receiverAddress || null,
          country: isManualEntry ? 'Manual Entry' : 'Unknown'
        },
        amountUsd: parseFloat(amountUsd),
        status: 'PENDING'
      }
    });

  } catch (error) {
    logger.error('Error creating remittance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PUT /api/remittance/:remittanceId/transaction - Update remittance with transaction hash
export const updateRemittanceTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { remittanceId } = req.params;
    const { transactionHash, status } = req.body;

    if (!transactionHash) {
      res.status(400).json({
        success: false,
        message: 'Transaction hash is required'
      });
      return;
    }

    // Mock update for now
    const updatedRemittance = {
      id: parseInt(remittanceId),
      transactionHash,
      status: status || 'COMPLETED',
      updatedAt: new Date()
    };

    logger.info('Remittance transaction updated', {
      remittanceId: updatedRemittance.id,
      transactionHash,
      status: updatedRemittance.status
    });

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedRemittance
    });

  } catch (error) {
    logger.error('Error updating remittance transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
