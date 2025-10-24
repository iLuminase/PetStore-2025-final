#!/bin/bash
# Script to clean all build artifacts before pushing to GitHub
# Run this from project root: ./clean-before-push.sh

echo "🧹 Cleaning PetStore project before GitHub push..."

# Clean Backend (Maven)
echo ""
echo "📦 Cleaning Backend Maven projects..."
cd be/auth-api && mvn clean && cd ../..
cd be/product-api && mvn clean && cd ../..
cd be/gateway-api && mvn clean && cd ../..
cd be/cart-api && mvn clean && cd ../..

# Clean Frontend (Angular)
echo ""
echo "🅰️  Cleaning Frontend Angular projects..."
cd fe
rm -rf node_modules
rm -rf .angular
rm -rf dist
rm -rf projects/*/dist
rm -rf projects/*/.angular
cd ..

# Clean logs
echo ""
echo "📋 Cleaning logs..."
rm -rf logs/*.log

echo ""
echo "✅ Clean completed!"
echo ""
echo "📊 Checking repository size..."
du -sh .
echo ""
echo "🔍 Files that will be committed:"
git status
echo ""
echo "✨ Ready to commit and push to GitHub!"
