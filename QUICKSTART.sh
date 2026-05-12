#!/bin/bash

# Complete guide to running Smart Mirror

echo "╔════════════════════════════════════════════════════════╗"
echo "║         🪞 Smart Mirror - Quick Start Guide 🪞         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Define colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Prerequisites:${NC}"
echo "  ✓ Node.js v18+"
echo "  ✓ npm or yarn"
echo ""

echo -e "${BLUE}🔧 Installation:${NC}"
echo ""
echo "1. Install Server Dependencies:"
echo "   ${YELLOW}cd server && npm install${NC}"
echo ""
echo "2. Install Client Dependencies:"
echo "   ${YELLOW}cd client && npm install${NC}"
echo ""

echo -e "${BLUE}🚀 Running in Development:${NC}"
echo ""
echo "   ${YELLOW}Terminal 1 (Server):${NC}"
echo "   ${GREEN}cd server && npm run dev${NC}"
echo ""
echo "   ${YELLOW}Terminal 2 (Client):${NC}"
echo "   ${GREEN}cd client && npm run dev${NC}"
echo ""

echo -e "${BLUE}🌐 Access the App:${NC}"
echo "   ${GREEN}http://localhost:5173${NC}"
echo ""

echo -e "${BLUE}📱 Features:${NC}"
echo "  ✓ Real-time Voice Processing"
echo "  ✓ AI Intent Recognition"
echo "  ✓ Arabic Language Support"
echo "  ✓ Live Event Updates"
echo ""

echo -e "${BLUE}🐳 Docker Deployment:${NC}"
echo ""
echo "   Set GEMINI_API_KEY environment variable:"
echo "   ${YELLOW}export GEMINI_API_KEY=your-key${NC}"
echo ""
echo "   Then start:"
echo "   ${YELLOW}docker-compose up --build${NC}"
echo ""

echo -e "${GREEN}✨ That's it! Happy coding!${NC}"

docker run -it --rm -v "$PWD/whisper/models:/models" ghcr.io/ggml-org/whisper.cpp:main "./models/download-ggml-model.sh base /models"

docker run -it --rm -p "8080:8080" -v "$PWD/whisper/models:/models" \
  ghcr.io/ggml-org/whisper.cpp:main \
  "whisper-server --host 0.0.0.0 -m /models/ggml-base.bin"