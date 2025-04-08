#!/bin/bash
echo "Building production version..."

# Build frontend
cd frontend-web
npm run build:prod
cd ..

# Copy frontend build to backend public folder
echo "Copying frontend build to backend..."
mkdir -p backend/public
cp -r frontend-web/build/* backend/public/

echo "Production build complete!"