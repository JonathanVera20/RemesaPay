import { Router } from 'express';
import {
  sendRemittance,
  updateRemittanceTransaction,
  validateSendRemittance
} from '../controllers/remittance.controller';

const router = Router();

// POST /api/remittance/send - Send money to a merchant
router.post('/send', validateSendRemittance, sendRemittance);

// PUT /api/remittance/:remittanceId/transaction - Update with blockchain transaction hash
router.put('/:remittanceId/transaction', updateRemittanceTransaction);

export default router;
