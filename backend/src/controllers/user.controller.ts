import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import logger from '../utils/logger';

// Validation middleware for user registration
export const validateUserRegistration = [
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('phoneNumber')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits'),
  body('countryCode')
    .matches(/^\+\d{1,3}$/)
    .withMessage('Country code must be in format +XX or +XXX'),
  body('country')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  body('walletAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum wallet address'),
];

// Register a new user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { 
      firstName, 
      lastName, 
      phoneNumber, 
      countryCode, 
      country, 
      email, 
      walletAddress 
    } = req.body;

    // Create full international phone number
    const fullPhone = `${countryCode}${phoneNumber}`;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: fullPhone }
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this phone number already exists'
      });
      return;
    }

    // Check if wallet address is already registered
    const existingWallet = await prisma.user.findFirst({
      where: { walletAddress }
    });

    if (existingWallet) {
      res.status(409).json({
        success: false,
        message: 'This wallet address is already registered'
      });
      return;
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phoneNumber: fullPhone,
        countryCode,
        country,
        email,
        walletAddress,
        isActive: true
      }
    });

    logger.info(`New user registered: ${user.firstName} ${user.lastName} (${user.phoneNumber})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        phoneNumber: user.phoneNumber,
        country: user.country,
        isActive: user.isActive
      }
    });
  } catch (error: any) {
    logger.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

// Find user by phone number
export const findUserByPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { 
        phoneNumber: phone,
        isActive: true 
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        country: true,
        walletAddress: true
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'No user found with this phone number'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        phoneNumber: user.phoneNumber,
        country: user.country,
        walletAddress: user.walletAddress
      }
    });
  } catch (error: any) {
    logger.error('Error finding user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find user',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

// Get all users (for admin purposes)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        email: true,
        country: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: users.map((user: any) => ({
        ...user,
        name: `${user.firstName} ${user.lastName || ''}`.trim()
      })),
      count: users.length
    });
  } catch (error: any) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

// Update user wallet address
export const updateUserWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { walletAddress } = req.body;

    // Validate wallet address
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      res.status(400).json({
        success: false,
        message: 'Invalid Ethereum wallet address'
      });
      return;
    }

    // Check if wallet address is already used by another user
    const existingWallet = await prisma.user.findFirst({
      where: { 
        walletAddress,
        id: { not: id }
      }
    });

    if (existingWallet) {
      res.status(409).json({
        success: false,
        message: 'This wallet address is already registered to another user'
      });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { walletAddress },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        walletAddress: true
      }
    });

    logger.info(`User wallet updated: ${user.firstName} ${user.lastName} (${user.walletAddress})`);

    res.json({
      success: true,
      message: 'User wallet address updated successfully',
      data: {
        ...user,
        name: `${user.firstName} ${user.lastName || ''}`.trim()
      }
    });
  } catch (error: any) {
    logger.error('Error updating user wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user wallet',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};
