import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerMerchant,
  validateMerchantRegistration,
  getNearestMerchants,
  getMerchant,
  verifyMerchant,
  getMerchantBalance,
  getMerchantTransactions
} from '../controllers/merchant.controller';

const router = express.Router();

// Rate limiting
const merchantRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for merchant operations
  message: {
    success: false,
    message: 'Too many merchant requests from this IP, please try again later.'
  }
});

const searchRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 search requests per minute
  message: {
    success: false,
    message: 'Too many search requests from this IP, please try again later.'
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     MerchantRegistration:
 *       type: object
 *       required:
 *         - businessName
 *         - businessType
 *         - contactName
 *         - phone
 *         - address
 *         - city
 *         - province
 *       properties:
 *         businessName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Name of the business
 *         businessType:
 *           type: string
 *           enum: [PHARMACY, CONVENIENCE_STORE, BANK_AGENT, EXCHANGE_HOUSE, OTHER]
 *           description: Type of business
 *         contactName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Name of the contact person
 *         phone:
 *           type: string
 *           description: Phone number (mobile)
 *         email:
 *           type: string
 *           format: email
 *           description: Email address (optional)
 *         address:
 *           type: string
 *           minLength: 10
 *           maxLength: 200
 *           description: Physical address
 *         city:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: City name
 *         province:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Province name
 *         postalCode:
 *           type: string
 *           description: Postal code (optional)
 *         latitude:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *           description: GPS latitude (optional)
 *         longitude:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *           description: GPS longitude (optional)
 *         licenseNumber:
 *           type: string
 *           maxLength: 50
 *           description: Business license number (optional)
 *         taxId:
 *           type: string
 *           maxLength: 20
 *           description: Tax identification number (optional)
 *         walletAddress:
 *           type: string
 *           pattern: ^0x[a-fA-F0-9]{40}$
 *           description: Ethereum wallet address (optional)
 *         operatingHours:
 *           type: object
 *           description: Operating hours by day (optional)
 *     
 *     Merchant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique merchant ID
 *         businessName:
 *           type: string
 *           description: Name of the business
 *         businessType:
 *           type: string
 *           enum: [PHARMACY, CONVENIENCE_STORE, BANK_AGENT, EXCHANGE_HOUSE, OTHER]
 *         contactName:
 *           type: string
 *           description: Contact person name
 *         phone:
 *           type: string
 *           description: Phone number
 *         email:
 *           type: string
 *           description: Email address
 *         address:
 *           type: string
 *           description: Physical address
 *         city:
 *           type: string
 *           description: City
 *         province:
 *           type: string
 *           description: Province
 *         location:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *         verified:
 *           type: boolean
 *           description: Verification status
 *         isActive:
 *           type: boolean
 *           description: Active status
 *         commissionRate:
 *           type: number
 *           description: Commission rate percentage
 *         cashLimit:
 *           type: number
 *           description: Daily cash limit
 *         createdAt:
 *           type: string
 *           format: date-time
 *         onboardedAt:
 *           type: string
 *           format: date-time
 *     
 *     MerchantBalance:
 *       type: object
 *       properties:
 *         currency:
 *           type: string
 *           description: Currency code
 *         availableBalance:
 *           type: string
 *           description: Available balance
 *         pendingBalance:
 *           type: string
 *           description: Pending balance
 *         lastUpdated:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/merchants/register:
 *   post:
 *     summary: Register a new merchant
 *     tags: [Merchants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MerchantRegistration'
 *           example:
 *             businessName: "Farmacia San Juan"
 *             businessType: "PHARMACY"
 *             contactName: "Maria Rodriguez"
 *             phone: "+593987654321"
 *             email: "maria@farmaciasanjuan.com"
 *             address: "Av. Amazonas 123, entre Colon y Orellana"
 *             city: "Quito"
 *             province: "Pichincha"
 *             postalCode: "170150"
 *             latitude: -0.2135
 *             longitude: -78.4951
 *             licenseNumber: "FARM-2024-001"
 *             taxId: "1756789012001"
 *             operatingHours:
 *               monday: "08:00-20:00"
 *               tuesday: "08:00-20:00"
 *               wednesday: "08:00-20:00"
 *               thursday: "08:00-20:00"
 *               friday: "08:00-20:00"
 *               saturday: "08:00-18:00"
 *               sunday: "09:00-15:00"
 *     responses:
 *       201:
 *         description: Merchant registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Merchant registered successfully. Verification pending."
 *                 data:
 *                   type: object
 *                   properties:
 *                     merchantId:
 *                       type: string
 *                     businessName:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     verified:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       409:
 *         description: Merchant already exists
 *       500:
 *         description: Server error
 */
router.post('/register', merchantRateLimit, validateMerchantRegistration, registerMerchant);

/**
 * @swagger
 * /api/merchants/nearest:
 *   get:
 *     summary: Get nearest verified merchants
 *     tags: [Merchants]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: User's latitude
 *         example: -0.2135
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: User's longitude
 *         example: -78.4951
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Search radius in kilometers
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: List of nearest merchants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Merchant'
 *                       - type: object
 *                         properties:
 *                           distance:
 *                             type: string
 *                             description: Distance in kilometers
 *                             example: "1.23"
 *                 count:
 *                   type: integer
 *                   description: Number of merchants found
 *                 searchCriteria:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *                     radius:
 *                       type: number
 *                     limit:
 *                       type: integer
 *       400:
 *         description: Invalid coordinates
 *       500:
 *         description: Server error
 */
router.get('/nearest', searchRateLimit, getNearestMerchants);

/**
 * @swagger
 * /api/merchants/{id}:
 *   get:
 *     summary: Get merchant details by ID
 *     tags: [Merchants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *     responses:
 *       200:
 *         description: Merchant details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Merchant'
 *                     - type: object
 *                       properties:
 *                         merchantBalances:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/MerchantBalance'
 *                         _count:
 *                           type: object
 *                           properties:
 *                             remittances:
 *                               type: integer
 *                             cashOuts:
 *                               type: integer
 *       404:
 *         description: Merchant not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getMerchant);

/**
 * @swagger
 * /api/merchants/{id}/verify:
 *   put:
 *     summary: Verify or unverify a merchant (Admin only)
 *     tags: [Merchants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verified
 *             properties:
 *               verified:
 *                 type: boolean
 *                 description: Verification status
 *               ensSubdomain:
 *                 type: string
 *                 description: ENS subdomain for the merchant (optional)
 *           example:
 *             verified: true
 *             ensSubdomain: "farmacia-san-juan"
 *     responses:
 *       200:
 *         description: Merchant verification updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Merchant verified successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     merchantId:
 *                       type: string
 *                     verified:
 *                       type: boolean
 *                     ensSubdomain:
 *                       type: string
 *                     onboardedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Merchant not found
 *       500:
 *         description: Server error
 */
router.put('/:id/verify', merchantRateLimit, verifyMerchant);

/**
 * @swagger
 * /api/merchants/{id}/balance:
 *   get:
 *     summary: Get merchant balance
 *     tags: [Merchants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *     responses:
 *       200:
 *         description: Merchant balances
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MerchantBalance'
 *       404:
 *         description: Merchant or balances not found
 *       500:
 *         description: Server error
 */
router.get('/:id/balance', getMerchantBalance);

/**
 * @swagger
 * /api/merchants/{id}/transactions:
 *   get:
 *     summary: Get merchant transactions with pagination
 *     tags: [Merchants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of transactions per page
 *     responses:
 *       200:
 *         description: Merchant transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       amount:
 *                         type: string
 *                       currency:
 *                         type: string
 *                       status:
 *                         type: string
 *                       sender:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                       cashOuts:
 *                         type: array
 *                         items:
 *                           type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       400:
 *         description: Invalid merchant ID
 *       404:
 *         description: Merchant not found
 *       500:
 *         description: Server error
 */
router.get('/:id/transactions', getMerchantTransactions);

export default router;
