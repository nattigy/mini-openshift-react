#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Mini OpenShift Authentication Verification Script       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Checking FastAPI Backend...${NC}"
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ FastAPI is running on http://localhost:8000${NC}"
else
    echo -e "${RED}✗ FastAPI is NOT running${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}2. Checking Next.js Frontend...${NC}"
if curl -s http://localhost:3000/login > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Next.js is running on http://localhost:3000${NC}"
else
    echo -e "${RED}✗ Next.js is NOT running${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}3. Testing CORS Configuration...${NC}"
CORS_RESPONSE=$(curl -s -X OPTIONS http://localhost:8000/api/v1/login/access-token \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -w "\n%{http_code}\n" 2>&1 | tail -1)

if [ "$CORS_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ CORS is properly configured${NC}"
else
    echo -e "${RED}✗ CORS issue detected (Status: $CORS_RESPONSE)${NC}"
fi

echo ""
echo -e "${BLUE}4. Testing Login Endpoint...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/login/access-token \
  -d "username=test@example.com&password=password123" \
  -H "Content-Type: application/x-www-form-urlencoded")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✓ Login endpoint is working${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | head -1 | cut -d'"' -f4 | cut -c1-20)
    echo "  Token: ${TOKEN}..."
else
    echo -e "${RED}✗ Login endpoint failed${NC}"
    echo "  Response: $LOGIN_RESPONSE"
    exit 1
fi

echo ""
echo -e "${BLUE}5. Testing User Endpoint with Token...${NC}"
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | head -1 | cut -d'"' -f4)
USER_RESPONSE=$(curl -s http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN")

if echo "$USER_RESPONSE" | grep -q "email"; then
    echo -e "${GREEN}✓ User endpoint is working${NC}"
    EMAIL=$(echo "$USER_RESPONSE" | grep -o '"email":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "  User: $EMAIL"
else
    echo -e "${RED}✗ User endpoint failed${NC}"
    echo "  Response: $USER_RESPONSE"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}║              ✓ All checks passed!                           ║${NC}"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:3000/login in your browser"
echo "  2. Enter credentials:"
echo "     Email: test@example.com"
echo "     Password: password123"
echo "  3. Click Sign In"
echo "  4. You should be redirected to the dashboard"
echo ""
