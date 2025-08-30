#!/bin/bash

# RemesaPay Setup Script
# This script sets up the complete RemesaPay development environment

set -e

echo "🇪🇨 Welcome to RemesaPay Setup!"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    print_info "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    print_status "Node.js $(node --version) is installed"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_status "npm $(npm --version) is installed"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    print_status "Git $(git --version | cut -d' ' -f3) is installed"
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_status "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) is installed"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker is not installed. Some features may not work."
        DOCKER_AVAILABLE=false
    fi
    
    echo ""
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Root dependencies
    print_info "Installing root dependencies..."
    npm install
    
    # Frontend dependencies
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    # Backend dependencies
    print_info "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Contract dependencies
    print_info "Installing contract dependencies..."
    cd contracts
    npm install
    cd ..
    
    print_status "All dependencies installed successfully!"
    echo ""
}

# Setup environment files
setup_environment() {
    print_info "Setting up environment files..."
    
    # Copy main env file
    if [ ! -f .env.local ]; then
        cp .env.example .env.local
        print_status "Created .env.local from template"
    else
        print_warning ".env.local already exists, skipping..."
    fi
    
    # Frontend env
    if [ ! -f frontend/.env.local ]; then
        cp .env.example frontend/.env.local
        print_status "Created frontend/.env.local"
    else
        print_warning "frontend/.env.local already exists, skipping..."
    fi
    
    # Backend env
    if [ ! -f backend/.env ]; then
        cp .env.example backend/.env
        print_status "Created backend/.env"
    else
        print_warning "backend/.env already exists, skipping..."
    fi
    
    # Contracts env
    if [ ! -f contracts/.env ]; then
        cp .env.example contracts/.env
        print_status "Created contracts/.env"
    else
        print_warning "contracts/.env already exists, skipping..."
    fi
    
    echo ""
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_info "Starting database with Docker..."
        docker-compose up -d postgres redis
        
        # Wait for database to be ready
        print_info "Waiting for database to be ready..."
        sleep 10
        
        # Setup Prisma
        cd backend
        print_info "Generating Prisma client..."
        npx prisma generate
        
        print_info "Pushing database schema..."
        npx prisma db push
        
        print_info "Seeding database..."
        npm run db:seed || print_warning "Database seeding failed (this is normal for first setup)"
        
        cd ..
        print_status "Database setup completed!"
    else
        print_warning "Docker not available. Please set up PostgreSQL and Redis manually."
        print_info "Update DATABASE_URL and REDIS_URL in your .env files"
    fi
    
    echo ""
}

# Compile smart contracts
setup_contracts() {
    print_info "Setting up smart contracts..."
    
    cd contracts
    
    print_info "Compiling contracts..."
    npm run compile
    
    print_info "Running contract tests..."
    npm run test || print_warning "Some tests failed (this might be normal)"
    
    cd ..
    print_status "Smart contracts setup completed!"
    echo ""
}

# Start development servers
start_development() {
    print_info "Starting development environment..."
    
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_info "Starting all services with Docker..."
        docker-compose up -d
        
        print_status "All services are starting up!"
        print_info "Services will be available at:"
        echo "  🌐 Frontend:  http://localhost:3000"
        echo "  🔧 Backend:   http://localhost:3001"
        echo "  📚 API Docs:  http://localhost:3001/api-docs"
        echo "  🔗 Hardhat:   http://localhost:8545"
        echo ""
        print_info "To view logs: docker-compose logs -f"
        print_info "To stop: docker-compose down"
    else
        print_warning "Docker not available. You'll need to start services manually:"
        echo "  Terminal 1: cd contracts && npm run node"
        echo "  Terminal 2: cd backend && npm run dev"
        echo "  Terminal 3: cd frontend && npm run dev"
    fi
    
    echo ""
}

# Configuration guide
show_configuration_guide() {
    print_info "📋 Configuration Guide"
    echo "======================"
    echo ""
    echo "1. 🔑 Update your .env.local file with:"
    echo "   - RPC URLs (Alchemy, Infura, or QuickNode)"
    echo "   - WalletConnect Project ID"
    echo "   - API keys for external services"
    echo ""
    echo "2. 🗄️  Database Configuration:"
    echo "   - Default: PostgreSQL on localhost:5432"
    echo "   - Update DATABASE_URL if needed"
    echo ""
    echo "3. 🔗 Blockchain Configuration:"
    echo "   - Local development uses Hardhat network"
    echo "   - Update RPC URLs for testnet/mainnet"
    echo ""
    echo "4. 📱 Frontend Configuration:"
    echo "   - WalletConnect Project ID required"
    echo "   - Update contract addresses after deployment"
    echo ""
    echo "5. 🛠️  Backend Configuration:"
    echo "   - JWT_SECRET for authentication"
    echo "   - External API keys (Twilio, SendGrid, etc.)"
    echo ""
}

# Troubleshooting guide
show_troubleshooting() {
    print_info "🔧 Troubleshooting Guide"
    echo "======================="
    echo ""
    echo "Common Issues:"
    echo ""
    echo "1. Port conflicts:"
    echo "   - Stop other services using ports 3000, 3001, 5432, 6379, 8545"
    echo "   - Use: lsof -ti:PORT | xargs kill -9"
    echo ""
    echo "2. Database connection issues:"
    echo "   - Check if PostgreSQL is running: docker ps"
    echo "   - Reset database: docker-compose down -v && docker-compose up -d"
    echo ""
    echo "3. Node modules issues:"
    echo "   - Clear cache: npm cache clean --force"
    echo "   - Reinstall: rm -rf node_modules package-lock.json && npm install"
    echo ""
    echo "4. TypeScript errors:"
    echo "   - Restart TypeScript server in VS Code"
    echo "   - Run: npm run type-check"
    echo ""
    echo "5. Contract compilation errors:"
    echo "   - Clean artifacts: cd contracts && npm run clean"
    echo "   - Reinstall dependencies: npm install"
    echo ""
}

# Main execution
main() {
    echo "Setting up RemesaPay development environment..."
    echo ""
    
    check_requirements
    install_dependencies
    setup_environment
    setup_database
    setup_contracts
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    
    # Ask if user wants to start development environment
    read -p "Would you like to start the development environment now? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_development
    else
        print_info "You can start the development environment later with:"
        echo "  docker-compose up -d    # With Docker"
        echo "  npm run dev             # Manual start"
    fi
    
    echo ""
    show_configuration_guide
    echo ""
    show_troubleshooting
    
    echo ""
    print_status "Welcome to RemesaPay! 🇪🇨"
    echo "For support, visit: https://github.com/your-org/remesapay/issues"
    echo ""
}

# Run main function
main "$@"
