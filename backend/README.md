# RemesaPay Backend

Web3-powered remittance platform backend for Ecuador, built with Node.js, Express, TypeScript, and Blockchain technology.

## 🚀 Features

- **Web3 Integration**: Support for Base and Optimism networks with USDC transactions
- **Real-time Notifications**: SMS, WhatsApp, and Email notifications via Twilio and SendGrid
- **Comprehensive API**: RESTful API with Swagger documentation
- **Database Management**: PostgreSQL with Prisma ORM
- **Caching & Sessions**: Redis for high-performance caching
- **Security**: JWT authentication, rate limiting, input validation
- **Monitoring**: Winston logging with multiple transports
- **Real-time Updates**: Socket.IO for live transaction updates
- **KYC/AML Compliance**: Identity verification and compliance checks
- **Exchange Rates**: Real-time exchange rate fetching from multiple providers

## 🛠 Technology Stack

### Core
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis with ioredis
- **Authentication**: JWT tokens

### Blockchain
- **Networks**: Base (Coinbase L2) and Optimism
- **Library**: Viem v2 for Web3 interactions
- **Currency**: USDC for stable transactions

### External Services
- **SMS/WhatsApp**: Twilio
- **Email**: SendGrid
- **File Storage**: AWS S3
- **Exchange Rates**: CoinGecko, ExchangeRate-API

## 📋 Prerequisites

- Node.js 18.0 or higher
- PostgreSQL 13+
- Redis 6+
- AWS Account (for S3 storage)
- Twilio Account (for SMS/WhatsApp)
- SendGrid Account (for email)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/remesapay/remesapay-backend.git
   cd remesapay-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration values
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Or run migrations
   npm run db:migrate
   
   # Seed database with initial data
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🚀 Running the Application

### Development
```bash
npm run dev
```
Server runs on `http://localhost:3001`

### Production
```bash
npm run build
npm start
```

### Database Operations
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create migration
npm run db:migrate

# Reset database
npm run db:reset

# View data in Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3001/api/docs`
- **Health Check**: `http://localhost:3001/api/health`
- **System Status**: `http://localhost:3001/api/status`

### Main Endpoints

#### Remittances
- `POST /api/remittances/send` - Send money transfer
- `POST /api/remittances/confirm` - Confirm pending transfer
- `POST /api/remittances/claim` - Claim money transfer
- `GET /api/remittances/:id` - Get transfer details
- `GET /api/remittances/phone/:phone` - Get transfers by phone
- `POST /api/remittances/calculate-fee` - Calculate transfer fee

#### Merchants
- `POST /api/merchants/register` - Register new merchant
- `GET /api/merchants/nearest` - Find nearest merchants
- `GET /api/merchants/:id` - Get merchant details
- `PUT /api/merchants/:id/verify` - Verify merchant (admin)
- `GET /api/merchants/:id/balance` - Get merchant balance
- `GET /api/merchants/:id/transactions` - Get merchant transactions

## 🏗 Project Structure

```
src/
├── app.ts                 # Main application entry point
├── config/
│   ├── config.ts         # Application configuration
│   └── database.ts       # Database connection
├── controllers/
│   ├── remittance.controller.ts
│   └── merchant.controller.ts
├── services/
│   ├── redis.ts          # Redis service
│   ├── notification.service.ts
│   ├── exchangeRate.service.ts
│   └── web3/
│       ├── wallet.service.ts
│       └── remittance.service.ts
├── routes/
│   ├── index.ts          # Main router
│   ├── remittance.ts     # Remittance routes
│   └── merchants.ts      # Merchant routes
├── utils/
│   └── logger.ts         # Winston logger
└── types/
    └── index.ts          # TypeScript type definitions

prisma/
├── schema.prisma         # Database schema
└── seed.ts              # Database seeding script
```

## 🔒 Security Features

- **Authentication**: JWT-based authentication system
- **Rate Limiting**: API rate limiting with Redis
- **Input Validation**: Express-validator for request validation
- **CORS**: Configurable CORS settings
- **Helmet**: Security headers
- **Encryption**: Sensitive data encryption
- **Audit Logging**: Comprehensive audit trails

## 🌐 Web3 Integration

### Supported Networks
- **Base (Coinbase L2)**: Primary network for low-cost transactions
- **Optimism**: Alternative L2 network for redundancy

### Smart Contract Features
- USDC transfers with phone number mapping
- Withdrawal codes for recipient verification
- Gas-optimized operations
- Multi-chain support

### Wallet Management
- Server-side wallet operations
- Private key security
- Gas estimation and optimization
- Transaction monitoring

## 📊 Monitoring & Logging

### Winston Logging
- Multiple log levels (error, warn, info, debug)
- File and console transports
- Structured logging with metadata
- Audit trail logging

### Health Checks
- Database connectivity
- Redis connectivity
- Blockchain network status
- External service availability

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3004

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/remesapay"

# Redis
REDIS_URL=redis://localhost:6379

# Blockchain
BASE_RPC_URL=https://mainnet.base.org
OPTIMISM_RPC_URL=https://mainnet.optimism.io

# External Services
TWILIO_ACCOUNT_SID=your-twilio-sid
SENDGRID_API_KEY=your-sendgrid-key
```

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t remesapay-backend .

# Run container
docker run -p 3001:3001 --env-file .env remesapay-backend
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure database connection
- [ ] Set up Redis cluster
- [ ] Configure AWS S3 for file storage
- [ ] Set up monitoring and logging
- [ ] Configure CORS for production domains
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@remesapay.com
- Documentation: https://docs.remesapay.com
- Issues: https://github.com/remesapay/remesapay-backend/issues

## 🙏 Acknowledgments

- Base Network for low-cost blockchain infrastructure
- Optimism for L2 scaling solutions
- Twilio for reliable communication services
- The open-source community for amazing tools and libraries
