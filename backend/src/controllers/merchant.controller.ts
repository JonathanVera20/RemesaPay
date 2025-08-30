import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../../config/database';
import logger, { logAudit } from '../../utils/logger';
import redisService from '../../services/redis';
import { Address } from 'viem';

// Validation middleware
export const validateMerchantRegistration = [
  body('businessName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('businessType')
    .isIn(['PHARMACY', 'CONVENIENCE_STORE', 'BANK_AGENT', 'EXCHANGE_HOUSE', 'OTHER'])
    .withMessage('Invalid business type'),
  body('contactName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Contact name must be between 2 and 50 characters'),
  body('phone')
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  body('address')
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  body('city')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('province')
    .isLength({ min: 2, max: 50 })
    .withMessage('Province must be between 2 and 50 characters'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('licenseNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('License number too long'),
  body('taxId')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Tax ID too long'),
  body('walletAddress')
    .optional()
    .isEthereumAddress()
    .withMessage('Invalid wallet address'),
];

// POST /api/merchants/register
export const registerMerchant = async (req: Request, res: Response) => {
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
      businessName,
      businessType,
      contactName,
      phone,
      email,
      address,
      city,
      province,
      postalCode,
      latitude,
      longitude,
      licenseNumber,
      taxId,
      walletAddress,
      operatingHours
    } = req.body;

    // Check if merchant already exists with this phone
    const existingMerchant = await prisma.merchant.findUnique({
      where: { phone }
    });

    if (existingMerchant) {
      return res.status(409).json({
        success: false,
        message: 'Merchant with this phone number already exists'
      });
    }

    // Check if email is already used
    if (email) {
      const existingEmail = await prisma.merchant.findUnique({
        where: { email }
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email address already in use'
        });
      }
    }

    // Create merchant
    const merchant = await prisma.merchant.create({
      data: {
        businessName,
        businessType,
        contactName,
        phone,
        email,
        address,
        city,
        province,
        postalCode,
        latitude,
        longitude,
        licenseNumber,
        taxId,
        walletAddress,
        operatingHours,
        verified: false, // Requires manual verification
        isActive: true,
      }
    });

    // Create initial balance record
    await prisma.merchantBalance.create({
      data: {
        merchantId: merchant.id,
        currency: 'USDC'
      }
    });

    // Log the registration
    logAudit('MERCHANT_REGISTERED', undefined, 'Merchant', {
      merchantId: merchant.id,
      businessName,
      phone,
      city,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Cache merchant data
    await redisService.set(
      `merchant:${merchant.id}`,
      JSON.stringify(merchant),
      3600 // 1 hour
    );

    res.status(201).json({
      success: true,
      message: 'Merchant registered successfully. Verification pending.',
      data: {
        merchantId: merchant.id,
        businessName: merchant.businessName,
        phone: merchant.phone,
        verified: merchant.verified,
        createdAt: merchant.createdAt
      }
    });

  } catch (error) {
    logger.error('Error in registerMerchant:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET /api/merchants/nearest
export const getNearestMerchants = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 10, limit = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radiusKm = parseFloat(radius as string);
    const limitNum = parseInt(limit as string, 10);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // Use raw SQL for spatial query (PostGIS would be ideal for production)
    const merchants = await prisma.$queryRaw`
      SELECT 
        id,
        "business_name" as "businessName",
        "business_type" as "businessType",
        "contact_name" as "contactName",
        phone,
        address,
        city,
        province,
        latitude,
        longitude,
        "operating_hours" as "operatingHours",
        verified,
        "is_active" as "isActive",
        "commission_rate" as "commissionRate",
        "cash_limit" as "cashLimit",
        (
          6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(latitude))
          )
        ) as distance
      FROM merchants 
      WHERE 
        verified = true 
        AND "is_active" = true
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND (
          6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(latitude))
          )
        ) <= ${radiusKm}
      ORDER BY distance ASC
      LIMIT ${limitNum}
    `;

    // Format the results
    const formattedMerchants = merchants.map((merchant: any) => ({
      id: merchant.id,
      businessName: merchant.businessName,
      businessType: merchant.businessType,
      contactName: merchant.contactName,
      phone: merchant.phone,
      address: merchant.address,
      city: merchant.city,
      province: merchant.province,
      location: {
        latitude: parseFloat(merchant.latitude),
        longitude: parseFloat(merchant.longitude)
      },
      distance: parseFloat(merchant.distance).toFixed(2),
      operatingHours: merchant.operatingHours,
      commissionRate: parseFloat(merchant.commissionRate),
      cashLimit: parseFloat(merchant.cashLimit)
    }));

    // Cache results for 10 minutes
    const cacheKey = `nearest_merchants:${lat}:${lng}:${radiusKm}:${limitNum}`;
    await redisService.set(cacheKey, JSON.stringify(formattedMerchants), 600);

    res.json({
      success: true,
      data: formattedMerchants,
      count: formattedMerchants.length,
      searchCriteria: {
        latitude: lat,
        longitude: lng,
        radius: radiusKm,
        limit: limitNum
      }
    });

  } catch (error) {
    logger.error('Error in getNearestMerchants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/merchants/:id
export const getMerchant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Merchant ID is required'
      });
    }

    // Try cache first
    const cached = await redisService.get(`merchant:${id}`);
    if (cached) {
      const merchant = JSON.parse(cached);
      return res.json({
        success: true,
        data: merchant
      });
    }

    // Get from database
    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: {
        merchantBalances: true,
        _count: {
          select: { remittances: true, cashOuts: true }
        }
      }
    });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    // Cache for 1 hour
    await redisService.set(`merchant:${id}`, JSON.stringify(merchant), 3600);

    res.json({
      success: true,
      data: merchant
    });

  } catch (error) {
    logger.error('Error in getMerchant:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PUT /api/merchants/:id/verify
export const verifyMerchant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verified, ensSubdomain } = req.body;

    if (!id || typeof verified !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }

    // Update merchant verification status
    const merchant = await prisma.merchant.update({
      where: { id },
      data: {
        verified,
        ensSubdomain,
        onboardedAt: verified ? new Date() : null
      }
    });

    // Clear cache
    await redisService.del(`merchant:${id}`);

    // Log the verification
    logAudit('MERCHANT_VERIFIED', undefined, 'Merchant', {
      merchantId: id,
      verified,
      ensSubdomain,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: `Merchant ${verified ? 'verified' : 'unverified'} successfully`,
      data: {
        merchantId: merchant.id,
        verified: merchant.verified,
        ensSubdomain: merchant.ensSubdomain,
        onboardedAt: merchant.onboardedAt
      }
    });

  } catch (error) {
    logger.error('Error in verifyMerchant:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/merchants/:id/balance
export const getMerchantBalance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Merchant ID is required'
      });
    }

    const balances = await prisma.merchantBalance.findMany({
      where: { merchantId: id }
    });

    if (!balances.length) {
      return res.status(404).json({
        success: false,
        message: 'Merchant balances not found'
      });
    }

    res.json({
      success: true,
      data: balances
    });

  } catch (error) {
    logger.error('Error in getMerchantBalance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/merchants/:id/transactions
export const getMerchantTransactions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Merchant ID is required'
      });
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      prisma.remittance.findMany({
        where: { merchantId: id },
        include: {
          sender: {
            select: { id: true, phoneNumber: true }
          },
          cashOuts: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.remittance.count({
        where: { merchantId: id }
      })
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    logger.error('Error in getMerchantTransactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
