#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                   CORS & API Connection Diagnostic Test                    ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${BLUE}=== Server Status ===${NC}"
echo ""

# Check FastAPI
echo "1. FastAPI Backend:"
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo -e "${GREEN}   ✓ Running on http://localhost:8000${NC}"
else
    echo -e "${RED}   ✗ NOT running${NC}"
    exit 1
fi

# Check Next.js
echo "2. Next.js Frontend:"
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}   ✓ Running on http://localhost:3000${NC}"
else
    echo -e "${RED}   ✗ NOT running${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}=== CORS Configuration Test ===${NC}"
echo ""

# Test CORS preflight
echo "3. CORS Preflight Request (OPTIONS):"
CORS_RESPONSE=$(curl -s -i -X OPTIONS http://localhost:8000/api/v1/login/access-token \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" 2>&1)

if echo "$CORS_RESPONSE" | grep -q "200 OK"; then
    echo -e "${GREEN}   ✓ Preflight request successful (200 OK)${NC}"
    echo "$CORS_RESPONSE" | grep "access-control" | sed 's/^/   /'
else
    echo -e "${RED}   ✗ Preflight request failed${NC}"
    echo "$CORS_RESPONSE" | head -5
fi

echo ""
echo -e "${BLUE}=== API Login Test ===${NC}"
echo ""

# Test login endpoint with URLencoded form
echo "4. Login with URLencoded Form Data:"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/login/access-token \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}   ✓ Login successful${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4 | cut -c1-20)
    echo "   Token: ${TOKEN}..."
    
    # Extract full token for next test
    FULL_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    # Test authenticated request
    echo ""
    echo "5. Authenticated Request (/users/me):"
    USER_RESPONSE=$(curl -s http://localhost:8000/api/v1/users/me \
      -H "Authorization: Bearer $FULL_TOKEN" \
      -H "Origin: http://localhost:3000")
    
    if echo "$USER_RESPONSE" | grep -q "email"; then
        echo -e "${GREEN}   ✓ Authenticated request successful${NC}"
        EMAIL=$(echo "$USER_RESPONSE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
        echo "   User: $EMAIL"
    else
        echo -e "${RED}   ✗ Authenticated request failed${NC}"
        echo "   Response: $USER_RESPONSE"
    fi
else
    echo -e "${RED}   ✗ Login failed${NC}"
    echo "   Response: $LOGIN_RESPONSE"
fi

echo ""
echo -e "${BLUE}=== Configuration Summary ===${NC}"
echo ""
echo "FastAPI CORS Settings:"
echo "  - Origins: http://localhost:3000, http://127.0.0.1:3000"
echo "  - Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH"
echo "  - Credentials: Allowed"
echo "  - Headers: All (*)"
echo ""
echo "React API Client Settings:"
echo "  - Base URL: http://localhost:8000/api/v1"
echo "  - Credentials: Enabled (withCredentials: true)"
echo "  - Login: URLencoded form data"
echo ""

echo -e "${BLUE}=== Browser Testing ===${NC}"
echo ""
echo "To test from browser console:"
echo ""
echo "1. Open: http://localhost:3000/login"
echo "2. Press F12 to open Developer Tools"
echo "3. Go to Console tab"
echo "4. Run this test:"
echo ""
echo "const testLogin = async () => {"
echo "  try {"
echo "    const params = new URLSearchParams();"
echo "    params.append('username', 'test@example.com');"
echo "    params.append('password', 'password123');"
echo ""
echo "    const response = await fetch('http://localhost:8000/api/v1/login/access-token', {"
echo "      method: 'POST',"
echo "      headers: {'Content-Type': 'application/x-www-form-urlencoded'},"
echo "      body: params,"
echo "      credentials: 'include',"
echo "    });"
echo ""
echo "    const data = await response.json();"
echo "    console.log('✓ Login successful:', data);"
echo "    return data;"
echo "  } catch(e) {"
echo "    console.error('✗ Login failed:', e);"
echo "  }"
echo "};"
echo ""
echo "testLogin();"
echo ""
echo "═════════════════════════════════════════════════════════════════════════════"
echo ""
