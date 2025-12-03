# Authentication Debugging Guide

## Issue
The React UI login was failing while the same credentials worked on the FastAPI API directly.

## Root Cause
**CORS (Cross-Origin Resource Sharing) was not configured** on the FastAPI backend. When the React app (running on `localhost:3000`) tried to make requests to the FastAPI server (on `localhost:8000`), the browser blocked it due to cross-origin policy.

## Solution Applied

### 1. ✅ Added CORS Middleware to FastAPI (`app/main.py`)

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

This allows the React frontend to make requests to the FastAPI backend.

### 2. ✅ Improved Error Handling in React (`src/app/(auth)/login/page.tsx`)

Enhanced error messages to help debug connection issues:
- Shows "Cannot connect to the server" if API is unreachable
- Shows specific error messages from the API
- Logs detailed error information to the browser console

### 3. ✅ Added Debugging Logs to API Client (`src/services/api.ts`)

The login method now logs:
- API URL being used
- Success/failure of the request
- Detailed error information

## How to Test

### Terminal Test
```bash
# Test that CORS is enabled (should see Access-Control headers)
curl -X OPTIONS http://localhost:8000/api/v1/login/access-token \
  -H "Origin: http://localhost:3000" \
  -v
```

### Browser Console Test
1. Open http://localhost:3000/login
2. Open browser Developer Tools (F12)
3. Go to Console tab
4. Run this test function:

```javascript
async function testLogin() {
  const API_URL = 'http://localhost:8000/api/v1';
  const formData = new FormData();
  formData.append('username', 'test@example.com');
  formData.append('password', 'password123');

  try {
    const response = await fetch(`${API_URL}/login/access-token`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    console.log('✅ Login successful:', data);
  } catch (error) {
    console.error('❌ Login failed:', error);
  }
}

testLogin();
```

### UI Test
1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign In"
4. Should redirect to dashboard on success

## Verification Checklist

- [x] FastAPI is running on `http://localhost:8000`
- [x] CORS middleware is configured in `app/main.py`
- [x] Next.js dev server is running on `http://localhost:3000`
- [x] API endpoint responds to CORS preflight requests
- [x] Login credentials are correct (verified with direct API call)
- [x] React error handling shows connection issues clearly
- [x] Console logs API URL and request details

## Server Status

```
FastAPI Backend:
  URL: http://localhost:8000
  API: http://localhost:8000/api/v1
  Docs: http://localhost:8000/docs
  CORS: ✅ Enabled for localhost:3000

Next.js Frontend:
  URL: http://localhost:3000
  Login: http://localhost:3000/login
  Status: ✅ Running
```

## If You Still Have Issues

### 1. Verify servers are running
```bash
# In separate terminals:
# Terminal 1 - FastAPI
cd mini-openshift-fastapi
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Next.js
cd mini-openshift-react
npm run dev
```

### 2. Check browser console
- Press F12 to open Developer Tools
- Go to Console tab
- Look for error messages when attempting login

### 3. Check Network tab
- Press F12 to open Developer Tools
- Go to Network tab
- Try to login
- Look for the `/login/access-token` request
- Check the request/response headers for CORS issues

### 4. Verify API directly
```bash
curl -X POST http://localhost:8000/api/v1/login/access-token \
  -d "username=test@example.com&password=password123" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

## File Changes Summary

1. **app/main.py** - Added CORS middleware
2. **src/services/api.ts** - Added console logging for debugging
3. **src/app/(auth)/login/page.tsx** - Enhanced error messages

## Next Steps

1. Try logging in with the provided credentials
2. Check browser console for any error messages
3. If still having issues, share the browser console error output
