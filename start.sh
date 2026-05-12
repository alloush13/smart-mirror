#!/bin/zsh

echo "╔════════════════════════════════════════╗"
echo "║      Smart Mirror - Server & Client    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${BLUE}Node version:${NC} $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
    cd server
    npm install
    cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing client dependencies...${NC}"
    cd client
    npm install
    cd ..
fi

echo ""
echo -e "${GREEN}✓ Ready to start!${NC}"
echo ""
echo -e "${BLUE}Starting servers...${NC}"
echo ""

# Create new tmux session if tmux is available, otherwise use two separate terminals
if command -v tmux &> /dev/null; then
    echo -e "${YELLOW}Opening terminals with tmux...${NC}"
    
    # Kill any existing session
    tmux kill-session -t smart-mirror 2>/dev/null || true
    
    # Create new session with server
    tmux new-session -d -s smart-mirror -n server -c "$PWD/server" 'npm run dev'
    
    # Create client window
    tmux new-window -t smart-mirror -n client -c "$PWD/client" 'npm run dev'
    
    # Attach to the session
    sleep 2
    tmux attach-session -t smart-mirror
else
    echo -e "${YELLOW}⚠️  Please open two terminal windows and run:${NC}"
    echo ""
    echo -e "${BLUE}Terminal 1 (Server):${NC}"
    echo "  cd server && npm run dev"
    echo ""
    echo -e "${BLUE}Terminal 2 (Client):${NC}"
    echo "  cd client && npm run dev"
    echo ""
    echo -e "${GREEN}Then visit: http://localhost:5173${NC}"
fi
