# Setup Checklist for Recipe App

## Phase 0 - Scaffold + Supabase Plumbing

### ✅ Local Setup

- [ ] **Install Node.js**
  ```bash
  # Install Homebrew first (if not installed)
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Install Node.js
  brew install node

  # Verify installation
  node --version
  npm --version
  ```

- [ ] **Install Project Dependencies**
  ```bash
  cd recipe-app
  npm install
  ```

- [ ] **Configure Environment Variables**
  - Copy `.env.local.example` to `.env.local`
  - Get your Supabase credentials from https://app.supabase.com
  - Update `.env.local` with your credentials

### ✅ Supabase Dashboard Setup

- [ ] **Create Supabase Project**
  - Go to https://app.supabase.com
  - Click "New Project"
  - Choose organization and fill in project details
  - Wait for project to be provisioned

- [ ] **Get API Credentials**
  - Go to Project Settings → API
  - Copy `URL` → Paste into `NEXT_PUBLIC_SUPABASE_URL`
  - Copy `anon public` key → Paste into `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- [ ] **Run Database Migration**
  - Go to SQL Editor in Supabase dashboard
  - Click "New Query"
  - Copy contents from `supabase/migrations/20240101000000_initial_schema.sql`
  - Paste and click "Run"
  - Verify no errors in output

- [ ] **Verify Database Schema**
  - Go to Table Editor
  - Check that `recipes` table exists
  - Verify columns: id, user_id, title, description, ingredients, etc.

- [ ] **Verify RLS Policies**
  - In Table Editor, click on `recipes` table
  - Click "RLS" tab
  - Should see 5 policies:
    1. Users can view own recipes
    2. Users can insert own recipes
    3. Users can update own recipes
    4. Users can delete own recipes
    5. Anyone can view public recipes

- [ ] **Create Storage Bucket**
  - Go to Storage in Supabase dashboard
  - Click "Create a new bucket"
  - Name: `recipe_images`
  - Make it private (uncheck "Public bucket")
  - Click "Create bucket"

- [ ] **Apply Storage Policies**
  - Follow instructions in `supabase/STORAGE_SETUP.md`
  - Apply all 5 storage policies using SQL Editor
  - Verify policies in Storage → Policies tab

- [ ] **Configure Email Auth**
  - Go to Authentication → Providers
  - Enable "Email" provider
  - Configure email templates (optional, or use defaults)
  - For development: Enable "Confirm email" = OFF for faster testing

### ✅ Test the Application

- [ ] **Start Development Server**
  ```bash
  npm run dev
  ```

- [ ] **Test Login Flow**
  - Open http://localhost:3000
  - Should redirect to `/login`
  - Hebrew text should display correctly:
    - Title: "התחברות"
    - Button: "שליחת קישור למייל"
  - Enter your email
  - Click button
  - Should see: "נשלח לך קישור למייל. אחרי הלחיצה תחזרי לאפליקציה."

- [ ] **Check Email**
  - Open your email inbox
  - Look for email from Supabase
  - Click the magic link

- [ ] **Verify Authentication**
  - Should redirect to `/app`
  - Should see: "אפליקציית מתכונים" in header
  - Should see your email in top right
  - Should see: "המתכונים שלי" heading

- [ ] **Test Auth Protection**
  - Sign out or clear cookies
  - Try to access http://localhost:3000/app
  - Should redirect to `/login`

### ✅ Verify RLS in Practice

- [ ] **Test Database Access**
  - Open Supabase Table Editor
  - Try to insert a recipe directly (should fail without proper user_id)
  - Use the app to verify RLS is working

### 📝 Status Report Template

Once complete, verify:

**✅ Created Files:**
- [x] app/layout.tsx (Root layout with Hebrew/RTL)
- [x] app/page.tsx (Redirect to login)
- [x] app/login/page.tsx (Magic link UI with Hebrew copy)
- [x] app/app/layout.tsx (Auth gate)
- [x] app/app/page.tsx (Protected app page)
- [x] lib/supabaseClient.ts (Browser client)
- [x] lib/supabaseServer.ts (Server client)
- [x] middleware.ts (Session refresh)
- [x] package.json (Dependencies)
- [x] tsconfig.json (TypeScript config)
- [x] next.config.js (Next.js config)
- [x] tailwind.config.ts (Tailwind config)
- [x] .env.local.example (Environment template)
- [x] supabase/migrations/20240101000000_initial_schema.sql
- [x] supabase/STORAGE_SETUP.md
- [x] README.md (Full documentation)

**✅ Working Login Flow:**
- [ ] Magic link email sent successfully
- [ ] Email link redirects to /app
- [ ] User authenticated and session persisted
- [ ] Protected routes require authentication

**✅ Migration Applied:**
- [ ] recipes table created
- [ ] All columns present and correct types
- [ ] Indexes created
- [ ] Triggers working (updated_at)

**✅ RLS Verified:**
- [ ] 5 policies active on recipes table
- [ ] Users can only see own recipes
- [ ] Public recipes viewable by anyone
- [ ] Insert/Update/Delete restricted to owners

**✅ Storage Configured:**
- [ ] recipe_images bucket created (private)
- [ ] Storage policies applied
- [ ] File organization structure ready

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution:** Run `npm install` again

### Issue: Magic link not received
**Solution:**
- Check spam folder
- Verify email provider settings in Supabase
- For dev: Disable email confirmation in Auth settings

### Issue: RLS policy errors
**Solution:**
- Verify all policies copied correctly
- Check policy names don't conflict
- Review Supabase logs for details

### Issue: Redirect loops
**Solution:**
- Clear browser cookies
- Check middleware.ts is running
- Verify environment variables are set

### Issue: TypeScript errors
**Solution:**
- Run `npm install` to get type definitions
- Restart TypeScript server in VS Code
