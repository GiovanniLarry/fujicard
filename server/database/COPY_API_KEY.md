# How to Copy Your Supabase API Keys Correctly

## Step 1: Go to Your Supabase Dashboard
Open: https://supabase.com/dashboard/project/xfnemjjovywyzqeemjmk

## Step 2: Navigate to API Settings
1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the submenu

## Step 3: Find Project URL and Keys

You'll see three sections:

### A. Project URL
```
https://xfnemjjovywyzqeemjmk.supabase.co
```
✅ This one is correct!

### B. Project API Keys

You'll see two keys:

#### ✅ **anon/public** (This is what we need!)
- Label: `anon` `public`
- Starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Description: "Publishable key"
- **COPY THIS ENTIRE KEY** - it should be ~200 characters long

#### ❌ service_role (DO NOT USE THIS)
- Label: `service_role` 
- This is a secret key - don't use it in frontend/client apps

## Step 4: Copy the FULL Key

1. Click the **copy icon** next to the `anon/public` key
2. **IMPORTANT**: Make sure you copy the ENTIRE key
   - It should start with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`
   - It should be about 200-250 characters long
   - If it's short (like 50 chars), you didn't get the full key!

## Step 5: Paste into .env File

Open `server/.env` and update:

```env
SUPABASE_URL=https://xfnemjjovywyzqeemjmk.supabase.co
SUPABASE_ANON_KEY=PASTE_THE_FULL_KEY_HERE
```

⚠️ **Common Mistakes:**
- ❌ Copying only part of the key
- ❌ Using the service_role key instead of anon/public
- ❌ Adding extra spaces before or after the key
- ❌ Not saving the .env file after editing

## Step 6: Verify It Works

Run this command:
```bash
cd server
node scripts/test-supabase.js
```

You should see:
```
✅ Connected to Supabase successfully!
```

If you still see "Invalid API key", the key is wrong or incomplete.

---

## Troubleshooting

### "Key looks too short"
The full anon key should be long (~200+ characters). If yours is short:
- Click directly on the copy icon in Supabase dashboard
- Or click "Reveal" and manually select all text

### "Still getting Invalid API Key"
1. Make sure there are no spaces before or after the key in .env
2. Make sure you're using the `anon/public` key, not `service_role`
3. Try regenerating the key in Supabase dashboard

### "Where do I find the dashboard?"
Direct link: https://supabase.com/dashboard/project/xfnemjjovywyzqeemjmk/settings/api
