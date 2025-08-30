import { Router } from 'express';
import {
  sendRemittance,
  confirmRemittance,
  claimRemittance,
  getRemittance,
  getRemittancesByPhone,
  calculateFee,
  checkPendingRemittances,
  validateSendRemittance
} from '../controllers/remittance.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SendRemittanceRequest:
 *       type: object
 *       required:
 *         - senderAddress
 *         - receiverPhone
 *         - amountUsd
 *         - chainId
 *       properties:
 *         senderAddress:
 *           type: string
 *           description: Ethereum address of the sender
 *         receiverPhone:
 *           type: string
 *           description: Phone number of the receiver
 *         amountUsd:
 *           type: number
 *           minimum: 1
 *           maximum: 999
 *           description: Amount in USD
 *         chainId:
 *           type: number
 *           enum: [8453, 10]
 *           description: Blockchain chain ID (Base or Optimism)
 *         ensSubdomain:
 *           type: string
 *           description: Optional ENS subdomain
 *         purpose:
 *           type: string
 *           description: Purpose of the remittance
 *         notes:
 *           type: string
 *           description: Additional notes
 *     
 *     RemittanceResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             remittanceId:
 *               type: string
 *             amount:
 *               type: string
 *             fee:
 *               type: string
 *             total:
 *               type: number
 *             phoneHash:
 *               type: string
 *             unlockTime:
 *               type: string
 *               format: date-time
 */

/**
 * @swagger
 * /api/remittance/send:
 *   post:
 *     summary: Send a remittance
 *     tags: [Remittances]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendRemittanceRequest'
 *     responses:
 *       201:
 *         description: Remittance initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemittanceResponse'
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post('/send', validateSendRemittance, sendRemittance);

/**
 * @swagger
 * /api/remittance/confirm:
 *   post:
 *     summary: Confirm a remittance transaction
 *     tags: [Remittances]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - remittanceId
 *               - txHash
 *               - chainId
 *             properties:
 *               remittanceId:
 *                 type: string
 *               txHash:
 *                 type: string
 *               chainId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Remittance confirmed successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post('/confirm', confirmRemittance);

/**
 * @swagger
 * /api/remittance/claim:
 *   post:
 *     summary: Claim a remittance at a merchant
 *     tags: [Remittances]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - remittanceId
 *               - merchantAddress
 *               - verificationCode
 *               - chainId
 *             properties:
 *               remittanceId:
 *                 type: string
 *               merchantAddress:
 *                 type: string
 *               verificationCode:
 *                 type: string
 *               chainId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Remittance claimed successfully
 *       400:
 *         description: Invalid request
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post('/claim', claimRemittance);

/**
 * @swagger
 * /api/remittance/{id}:
 *   get:
 *     summary: Get remittance details by ID
 *     tags: [Remittances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Remittance ID
 *     responses:
 *       200:
 *         description: Remittance details
 *       404:
 *         description: Remittance not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getRemittance);

/**
 * @swagger
 * /api/remittance/phone/{phoneNumber}:
 *   get:
 *     summary: Get remittances for a phone number
 *     tags: [Remittances]
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number
 *     responses:
 *       200:
 *         description: List of remittances
 *       400:
 *         description: Invalid phone number
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.get('/phone/:phoneNumber', getRemittancesByPhone);

/**
 * @swagger
 * /api/remittance/fee/{amount}:
 *   get:
 *     summary: Calculate fee for a remittance amount
 *     tags: [Remittances]
 *     parameters:
 *       - in: path
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *         description: Amount in USD
 *     responses:
 *       200:
 *         description: Fee calculation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     amount:
 *                       type: number
 *                     fee:
 *                       type: number
 *                     total:
 *                       type: number
 *                     feePercentage:
 *                       type: number
 *       400:
 *         description: Invalid amount
 *       500:
 *         description: Internal server error
 */
router.get('/fee/:amount', calculateFee);

/**
 * @swagger
 * /api/remittance/pending/{phoneNumber}:
 *   get:
 *     summary: Check if phone number has pending remittances
 *     tags: [Remittances]
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number
 *     responses:
 *       200:
 *         description: Pending remittances status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     phoneNumber:
 *                       type: string
 *                     hasPendingRemittances:
 *                       type: boolean
 *       400:
 *         description: Invalid phone number
 *       500:
 *         description: Internal server error
 */
router.get('/pending/:phoneNumber', checkPendingRemittances);

export default router;
