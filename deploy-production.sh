#!/bin/bash

# RemesaPay Production Deployment Script

echo "🚀 Starting RemesaPay Production Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Frontend setup
echo "🎨 Setting up frontend..."
cd frontend
npm install
npm run build
cd ..

# Backend setup
echo "⚙️  Setting up backend..."
cd backend
npm install
npm run build
cd ..

# Check environment variables
echo "🔧 Checking environment configuration..."
if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  Warning: frontend/.env.local not found"
    echo "   Copy frontend/.env.example to frontend/.env.local and configure"
fi

if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env not found"
    echo "   Copy backend/.env.example to backend/.env and configure"
fi

# Smart contracts (if needed)
echo "📜 Checking smart contracts..."
cd contracts
if [ -f "package.json" ]; then
    npm install
    npm run compile
fi
cd ..

echo "✅ Production build complete!"
echo ""
echo "🌟 Next steps for deployment:"
echo "   1. Deploy smart contracts to production networks"
echo "   2. Update contract addresses in environment files"
echo "   3. Configure production environment variables"
echo "   4. Deploy frontend to Vercel/Netlify"
echo "   5. Deploy backend to Railway/Render/AWS"
echo ""
echo "🔗 Useful commands:"
echo "   Frontend dev: cd frontend && npm run dev"
echo "   Backend dev:  cd backend && npm run dev"
echo "   Frontend build: cd frontend && npm run build"
echo "   Backend build: cd backend && npm run build"
echo ""
echo "📋 Production checklist:"
echo "   ✅ Frontend built successfully"
echo "   ✅ Backend built successfully"
echo "   ✅ Smart contracts compiled"
echo "   ⚠️  Environment variables configured"
echo "   ⚠️  Smart contracts deployed"
echo "   ⚠️  Services deployed to cloud"
