#!/bin/bash

# RemesaPay Production Deployment Script for Ecuador
# This script prepares the application for production deployment

echo "🇪🇨 RemesaPay Ecuador - Production Build Script"
echo "=================================================="

# Frontend Build
echo "📦 Building Frontend..."
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
cd ..
mkdir -p deploy
cp -r frontend/out deploy/ 2>/dev/null || cp -r frontend/.next deploy/
cp -r frontend/public deploy/

# Environment setup for Ecuador
echo "🌍 Setting up Ecuador environment..."
cat > deploy/.env.production << EOF
# Ecuador Production Environment
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_CHAIN_NAME=Base
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_EXPLORER_URL=https://basescan.org
NEXT_PUBLIC_APP_NAME=RemesaPay
NEXT_PUBLIC_APP_DESCRIPTION=Envíos de dinero instantáneos a Ecuador
NEXT_PUBLIC_SUPPORT_PHONE=+593-99-999-9999
NEXT_PUBLIC_SUPPORT_EMAIL=soporte@remesapay.com
NEXT_PUBLIC_SUPPORTED_COUNTRIES=EC,US
EOF

# Create Nginx configuration for Ecuador
echo "🌐 Creating Nginx configuration..."
cat > deploy/nginx.conf << EOF
server {
    listen 80;
    server_name remesapay.ec www.remesapay.ec;
    
    # Ecuador-specific security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression for faster loading in Ecuador
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Main application
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header X-Country "EC" always;
    }
    
    # Health check for Ecuador monitoring
    location /health {
        access_log off;
        return 200 "RemesaPay Ecuador OK\\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Create Docker configuration optimized for Ecuador
echo "🐳 Creating Docker configuration..."
cat > deploy/Dockerfile << EOF
FROM node:18-alpine AS builder

# Set timezone to Ecuador
RUN apk add --no-cache tzdata
ENV TZ=America/Guayaquil

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache tzdata
ENV TZ=America/Guayaquil

COPY --from=builder /app/out /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Ecuador-specific health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Create deployment instructions
echo "📋 Creating deployment instructions..."
cat > deploy/DEPLOYMENT.md << EOF
# RemesaPay Ecuador - Deployment Guide

## 🇪🇨 Ecuador-Optimized Deployment

### Prerequisites
- Domain: remesapay.ec (recommended)
- SSL Certificate for HTTPS
- CDN for faster loading in Ecuador
- Monitoring for Ecuador timezone

### Quick Deploy Commands

\`\`\`bash
# Build and deploy with Docker
docker build -t remesapay-ecuador .
docker run -d -p 80:80 --name remesapay-ecuador remesapay-ecuador

# Or deploy to AWS/Vercel with Ecuador region
vercel --regions gru1  # São Paulo (closest to Ecuador)
\`\`\`

### Environment Variables for Production
- Set BASE_URL to your domain
- Configure Ecuador-specific settings
- Enable analytics for Ecuador users
- Set up customer support in Spanish

### Post-Deployment Checklist
- [ ] SSL Certificate configured
- [ ] Domain pointing to correct servers
- [ ] Health checks passing
- [ ] Ecuador user testing completed
- [ ] Support team notified
- [ ] Analytics tracking Ecuador users

### Ecuador-Specific Optimizations
- Timezone: America/Guayaquil
- Currency: USD (Ecuador uses US Dollar)
- Language: Spanish
- Phone format: +593 validation
- Support hours: Ecuador business hours
EOF

echo "✅ Production build completed!"
echo ""
echo "📁 Deployment files created in ./deploy/"
echo "📋 Check DEPLOYMENT.md for next steps"
echo ""
echo "🚀 Ready for Ecuador production deployment!"
echo "🌐 Recommended domain: remesapay.ec"
echo "📞 Ecuador support: +593-99-999-9999"
