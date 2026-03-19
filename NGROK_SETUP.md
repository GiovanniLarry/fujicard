# Ngrok Hosting Setup for Fuji Card Market

## Current Ngrok URLs

### Frontend (Main Site)
**URL**: https://9fbf-102-132-24-8.ngrok-free.app

This exposes the React frontend on port 5173. The API calls are configured to use the ngrok URL.

## How to Run

### Option 1: Quick Start (Frontend Only)
```powershell
# Terminal 1 - Start Backend
cd server
node index.js

# Terminal 2 - Start Frontend  
cd client
npm run dev

# Terminal 3 - Start Ngrok (after both servers are running)
ngrok http 5173 --host-header="localhost:5173"
```

### Option 2: With Backend Tunnel (Advanced)
If you need direct backend access:

```powershell
# Terminal 1 - Start Backend
cd server
node index.js

# Terminal 2 - Start Frontend
cd client
npm run dev

# Terminal 3 - Frontend Ngrok
ngrok http 5173 --host-header="localhost:5173"

# Terminal 4 - Backend Ngrok (optional, for direct API access)
ngrok http 5000
```

Then update `.env` file with the backend ngrok URL:
```
VITE_API_URL=https://YOUR-BACKEND-URL.ngrok-free.app/api
```

## Important Notes

1. **Ngrok Free Tier Limitations**:
   - URLs change every time you restart ngrok
   - Session timeout after limited period
   - Bandwidth limits apply
   - One tunnel at a time on free plan

2. **Current Configuration**:
   - Frontend is exposed via ngrok
   - API calls from frontend go to the same ngrok URL
   - Backend runs locally on port 5000
   - Frontend proxies API requests through the ngrok tunnel

3. **To Update Ngrok URL**:
   When you restart ngrok, you'll get a new URL. Update it in:
   - `client/.env` file: `VITE_API_URL=https://NEW-URL.ngrok-free.app/api`
   - Then restart the frontend dev server

4. **Testing the Site**:
   - Share the ngrok URL with anyone
   - They can access the full site
   - Authentication, cart, and all features work normally
   - Data is stored in browser localStorage

## Stopping Ngrok
Press `Ctrl+C` in the terminal where ngrok is running.

## Viewing Traffic
Open your browser to see request logs:
- Frontend tunnel: http://127.0.0.1:4040
- Backend tunnel (if running): http://127.0.0.1:4041

## Troubleshooting

### API Calls Failing
- Check that backend server is running on port 5000
- Verify `.env` file has correct ngrok URL
- Restart frontend dev server after changing `.env`

### Ngrok Connection Issues
- Check internet connection
- Ngrok may reconnect automatically
- Try restarting ngrok if connection drops

### CORS Errors
- Make sure backend CORS configuration allows the ngrok origin
- Backend should accept requests from your ngrok URL
