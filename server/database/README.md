# 🗄️ Supabase Database Integration for Fuji Card Market

## ✅ What's Been Set Up

Your Fuji Card Market app is now ready to use **Supabase** as its database! Here's what I've created:

### Files Created:

1. **`server/.env`** - Environment variables for Supabase credentials
2. **`server/config/supabase.js`** - Supabase client configuration
3. **`server/database/supabase-schema.sql`** - Complete database schema
4. **`server/database/SETUP.md`** - Step-by-step setup guide
5. **`server/scripts/migrate-to-supabase.js`** - Data migration script

---

## 🚀 Quick Start Guide

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up (free) with GitHub, Google, or email
3. Click **"New Project"**

### Step 2: Configure Project
- **Name**: `fuji-card-market`
- **Database Password**: Choose something secure (save it!)
- **Region**: Select closest to you
- Wait 2 minutes for setup

### Step 3: Get Credentials
In Supabase Dashboard:
1. Go to **Settings** ⚙️ → **API**
2. Copy:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 4: Update `.env` File
Open `server/.env` and replace:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Run Database Schema
1. In Supabase, go to **SQL Editor** 
2. Open `server/database/supabase-schema.sql`
3. Copy ALL content
4. Paste into SQL Editor
5. Click **"Run"**

### Step 6: Verify Tables
Go to **Table Editor** in Supabase - you should see:
- ✅ products, categories, users
- ✅ addresses, carts, cart_items
- ✅ orders, order_items
- ✅ wishlists, wishlist_items, reviews

### Step 7: Migrate Your Data
Run the migration script:
```bash
cd server
node scripts/migrate-to-supabase.js
```

This will move all your products from `store.js` to Supabase!

---

## 📊 Database Schema Overview

### Core Tables:

**Products** - All your trading cards and sealed products
- Price, stock, images, rarity, condition
- Supports graded cards (PSA, CGC, etc.)
- Promo discounts and featured items

**Categories** - Product organization
- Pokemon, Yu-Gi-Oh!, One Piece
- Sealed Products, Accessories
- New Arrivals, Special & Rare, Promo

**Users** - Customer accounts
- Linked to Supabase Auth
- Username, email, password hash

**Carts** - Shopping carts
- User-specific or guest session
- Real-time updates

**Orders** - Purchase history
- Order status tracking
- Shipping addresses
- Multiple items per order

**Wishlists** - Saved products
- Users can save favorite cards

**Reviews** - Product ratings
- 5-star rating system
- Verified purchase badges

---

## 🔄 Current Status

**Right now**, your app uses **in-memory storage** (data in `store.js`).

**After setup**, your app will use **Supabase PostgreSQL** database with:
- ✅ Persistent data (survives server restarts)
- ✅ Real-time updates
- ✅ Scalable to millions of products
- ✅ Professional security (Row Level Security)
- ✅ Free tier: 500MB database, unlimited API calls

---

## 🛠️ Next Steps After Setup

Once you have Supabase configured, I can help you:

1. **Update API routes** to read/write from Supabase instead of memory
2. **Add real authentication** with Supabase Auth
3. **Enable real-time features** (live stock levels, order notifications)
4. **Add image upload** to Supabase Storage
5. **Create admin dashboard** to manage products

---

## 📝 Migration Plan

### Phase 1: Database Setup (You do this now)
- [x] SQL schema created
- [x] Migration script ready
- [ ] You create Supabase account
- [ ] You run SQL schema
- [ ] You update `.env` file

### Phase 2: Backend Integration (I'll help next)
- [ ] Update product routes to use Supabase
- [ ] Update auth routes to use Supabase Auth
- [ ] Update cart/order routes
- [ ] Test all functionality

### Phase 3: Features (Optional enhancements)
- [ ] Real-time stock updates
- [ ] Email notifications
- [ ] Image uploads
- [ ] Admin panel

---

## 💡 Why Supabase?

**vs MongoDB:**
- ✅ SQL (better for e-commerce relationships)
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Better for complex queries

**vs Firebase:**
- ✅ PostgreSQL (not NoSQL)
- ✅ No vendor lock-in
- ✅ Cheaper at scale
- ✅ Better for relational data

**vs Traditional SQL:**
- ✅ Auto-generated APIs
- ✅ Built-in auth integration
- ✅ Real-time features included
- ✅ Generous free tier

---

## ⚠️ Important Notes

1. **Don't commit `.env`** - It's in `.gitignore` for security
2. **Backup your data** - Export from Supabase regularly
3. **Test locally first** - Use Supabase Local Tunnel for development
4. **Row Level Security** - Already enabled on all tables
5. **Free tier limits** - 500MB DB, 2GB bandwidth/month

---

## 🆘 Need Help?

**Common Issues:**

**"Invalid API key"**
→ Make sure you're using the **anon/public** key, not service role key

**"Table does not exist"**
→ Re-run the `supabase-schema.sql` in SQL Editor

**Can't connect**
→ Check internet, verify URL in `.env` is correct

**Migration fails**
→ Make sure categories are inserted before products

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Ready to set up?** Follow the steps above, then let me know when you've created your Supabase account and I'll help you integrate it! 🎉
