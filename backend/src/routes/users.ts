import express from 'express';
import {
  registerUser,
  validateUserRegistration,
  findUserByPhone,
  getAllUsers,
  updateUserWallet
} from '../controllers/user.controller';

const router = express.Router();

// POST /api/users/register - Register a new user
router.post('/register', validateUserRegistration, registerUser);

// GET /api/users/phone/:phone - Find user by phone number
router.get('/phone/:phone', findUserByPhone);

// GET /api/users - Get all users (admin)
router.get('/', getAllUsers);

// PUT /api/users/:id/wallet - Update user wallet address
router.put('/:id/wallet', updateUserWallet);

export default router;
