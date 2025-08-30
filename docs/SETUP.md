# 🏗️ RemesaPay Project Setup Guide

This document provides a comprehensive guide for setting up and understanding the RemesaPay blockchain remittance platform.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Setup](#quick-setup)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Smart Contracts](#smart-contracts)
6. [Frontend Development](#frontend-development)
7. [Backend Development](#backend-development)
8. [Deployment](#deployment)
9. [Team Collaboration](#team-collaboration)

## 🌟 Project Overview

RemesaPay is a blockchain-based remittance platform that enables instant, low-cost money transfers to Ecuador using USDC/USDT on Base and Optimism networks.

### Key Features
- **0.5% fees** vs 15% traditional remittance services
- **Instant transfers** using blockchain technology
- **Phone-based recipient identification**
- **Merchant cash-out network** in Ecuador
- **ENS subdomain integration** (user.remesa.eth)
- **Multi-signature security**

### Tech Stack
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Wagmi
- **Backend**: Node.js, Express, PostgreSQL, Prisma, Redis
- **Infrastructure**: Docker, Vercel, Base/Optimism

## 🚀 Quick Setup

### Prerequisites
```bash
# Required software
node >= 18.0.0
npm >= 9.0.0
git
docker
```

### Installation Steps

1. **Clone and setup the repository**:
```bash
git clone https://github.com/your-org/remesapay.git
cd remesapay
npm install
```

2. **Environment configuration**:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Start development environment**:
```bash
# Option 1: Using Docker (Recommended)
docker-compose up -d

# Option 2: Manual setup
npm run setup  # Install all dependencies
npm run dev    # Start all services
```

4. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api-docs
- Local Blockchain: http://localhost:8545

## 📁 Project Structure

```
remesapay/
├── 📄 README.md                    # Main project documentation
├── 📄 package.json                 # Root package.json for workspaces
├── 📄 docker-compose.yml          # Development environment
├── 📄 .env.example                 # Environment variables template
├── 📁 .github/
│   └── 📁 workflows/
│       └── 📄 ci-cd.yml            # CI/CD pipeline
├── 📁 frontend/                    # Next.js frontend application
│   ├── 📄 package.json
│   ├── 📄 next.config.js
│   ├── 📄 tailwind.config.ts
│   ├── 📁 src/
│   │   ├── 📁 app/                 # Next.js 14 app directory
│   │   ├── 📁 components/          # React components
│   │   ├── 📁 hooks/               # Custom React hooks
│   │   ├── 📁 lib/                 # Utility libraries
│   │   ├── 📁 store/               # State management (Zustand)
│   │   └── 📁 types/               # TypeScript type definitions
│   └── 📁 public/                  # Static assets
├── 📁 backend/                     # Node.js backend API
│   ├── 📄 package.json
│   ├── 📁 src/
│   │   ├── 📄 server.ts            # Main server file
│   │   ├── 📁 routes/              # API routes
│   │   ├── 📁 controllers/         # Route controllers
│   │   ├── 📁 services/            # Business logic
│   │   ├── 📁 middleware/          # Express middleware
│   │   ├── 📁 utils/               # Utility functions
│   │   └── 📁 config/              # Configuration files
│   └── 📁 prisma/                  # Database schema and migrations
│       ├── 📄 schema.prisma        # Database schema
│       └── 📁 migrations/          # Database migrations
├── 📁 contracts/                   # Smart contracts
│   ├── 📄 package.json
│   ├── 📄 hardhat.config.ts        # Hardhat configuration
│   ├── 📁 contracts/               # Solidity contracts
│   │   ├── 📄 RemesaPay.sol        # Main remittance contract
│   │   └── 📄 MockERC20.sol        # Mock tokens for testing
│   ├── 📁 scripts/                 # Deployment scripts
│   ├── 📁 test/                    # Contract tests
│   └── 📁 deployments/             # Deployment artifacts
└── 📁 docs/                        # Additional documentation
    ├── 📄 SETUP.md                 # This file
    ├── 📄 API.md                   # API documentation
    ├── 📄 CONTRACTS.md             # Smart contract documentation
    └── 📄 DEPLOYMENT.md            # Deployment guide
```

## 🔄 Development Workflow

### 1. Smart Contract Development

```bash
cd contracts
npm install

# Compile contracts
npm run compile

# Run tests
npm run test
npm run test:coverage
npm run test:gas

# Deploy to local network
npm run node            # Start local Hardhat node
npm run deploy:local    # Deploy contracts

# Deploy to testnets
npm run deploy:base-testnet
npm run deploy:optimism-testnet
```

### 2. Frontend Development

```bash
cd frontend
npm install

# Development
npm run dev
npm run build
npm run start

# Testing
npm run test
npm run test:watch
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### 3. Backend Development

```bash
cd backend
npm install

# Database setup
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio

# Development
npm run dev
npm run build
npm run start

# Testing
npm run test
npm run test:watch
npm run test:coverage
```

## 📱 Smart Contracts

### Core Contracts

1. **RemesaPay.sol** - Main remittance contract
   - Send remittances with phone number mapping
   - Merchant verification and claiming
   - Fee collection and distribution
   - Security features (pause, blacklist, time locks)
   - Upgradeable using OpenZeppelin proxy pattern

2. **MockERC20.sol** - Test token contract
   - Used for local development and testing
   - Implements faucet functionality

### Key Features

- **Security**: Reentrancy protection, access control, emergency pause
- **Gas Optimization**: Batch operations, efficient storage patterns
- **Upgradeability**: UUPS proxy pattern for future improvements
- **Multi-chain**: Deployable on Base and Optimism

### Deployment Addresses

#### Mainnet
- **Base**: TBD
- **Optimism**: TBD

#### Testnet
- **Base Sepolia**: TBD
- **Optimism Sepolia**: TBD

## 🎨 Frontend Development

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom Ecuador-themed colors
- **Web3**: Wagmi v2, Viem for blockchain interactions
- **State Management**: Zustand
- **UI Components**: Radix UI + Custom components
- **Forms**: React Hook Form + Zod validation

### Key Components

1. **Wallet Connection**: Multi-wallet support (MetaMask, Coinbase, WalletConnect)
2. **Send Flow**: Amount input, recipient selection, transaction confirmation
3. **Recipient Management**: Phone number registration, ENS subdomains
4. **Merchant Dashboard**: Transaction history, cash management
5. **Admin Panel**: User management, analytics, system controls

### Development Guidelines

- Use TypeScript strictly
- Follow component composition patterns
- Implement responsive design (mobile-first)
- Use Web3 hooks for blockchain interactions
- Handle loading and error states gracefully

## 🔧 Backend Development

### Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT + Web3 signature verification
- **File Storage**: AWS S3 (or local for development)
- **Real-time**: Socket.io for notifications

### API Structure

```
/api/
├── /auth/              # Authentication endpoints
├── /users/             # User management
├── /remittances/       # Remittance operations
├── /merchants/         # Merchant management
├── /webhooks/          # Blockchain event webhooks
└── /admin/             # Admin operations
```

### Database Models

- **Users**: Authentication and profile data
- **Merchants**: Business information and verification
- **Remittances**: Transaction records and status
- **Transactions**: Blockchain transaction history
- **Notifications**: User notifications
- **Analytics**: Business metrics and reporting

## 🚀 Deployment

### Development Environment

```bash
# Using Docker Compose
docker-compose up -d

# Services available:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:3001
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - Hardhat: localhost:8545
```

### Staging Deployment

- **Frontend**: Vercel preview deployments
- **Backend**: Railway/Render staging environment
- **Contracts**: Base/Optimism testnets
- **Database**: Staging PostgreSQL instance

### Production Deployment

- **Frontend**: Vercel production (remesapay.com)
- **Backend**: Railway/Render production
- **Contracts**: Base/Optimism mainnets
- **Database**: Production PostgreSQL with backups
- **Monitoring**: Sentry, Datadog, or similar

### CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Code Quality**: Linting, type checking, security audits
2. **Testing**: Unit tests, integration tests, contract tests
3. **Building**: Docker images, contract compilation
4. **Deployment**: Automatic deployment to staging/production
5. **Notifications**: Discord/Slack notifications

## 🤝 Team Collaboration

### Git Workflow

1. **Main Branch**: Production-ready code
2. **Develop Branch**: Integration branch for features
3. **Feature Branches**: `feature/description`
4. **Hotfix Branches**: `hotfix/description`

### Development Process

1. Create feature branch from `develop`
2. Implement feature with tests
3. Create pull request to `develop`
4. Code review and testing
5. Merge to `develop`
6. Deploy to staging for testing
7. Merge to `main` for production

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Consistent code formatting
- **Prettier**: Automated code formatting
- **Husky**: Pre-commit hooks for quality checks
- **Conventional Commits**: Structured commit messages

### Communication

- **Daily Standups**: Progress updates and blockers
- **Weekly Reviews**: Feature demos and planning
- **Documentation**: Keep README and docs updated
- **Issues**: Use GitHub Issues for bug tracking
- **Discussions**: Use GitHub Discussions for design decisions

## 📚 Additional Resources

### Documentation
- [API Documentation](./API.md)
- [Smart Contract Documentation](./CONTRACTS.md)
- [Deployment Guide](./DEPLOYMENT.md)

### External Links
- [Base Network Documentation](https://docs.base.org/)
- [Optimism Documentation](https://docs.optimism.io/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Hardhat Documentation](https://hardhat.org/docs)

### Community
- **Discord**: [Join our community](https://discord.gg/remesapay)
- **Twitter**: [@RemesaPay](https://twitter.com/RemesaPay)
- **GitHub**: [Repository](https://github.com/your-org/remesapay)

---

**Questions?** Create an issue or reach out to the team on Discord!
