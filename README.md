# Recipe App - אפליקציית מתכונים

A Next.js application for managing recipes with Supabase authentication and storage.

## 📋 Prerequisites

Before you begin, ensure you have installed:
- Node.js 18.x or higher
- npm, yarn, or pnpm package manager
- A Supabase account and project

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings under API.

### 3. Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20240101000000_initial_schema.sql`
4. Paste and run the migration

This will create:
- `recipes` table with all necessary columns
- Row Level Security (RLS) policies
- Indexes for performance
- Public share functionality

### 4. Set Up Storage Bucket

Follow the instructions in `supabase/STORAGE_SETUP.md` to:
1. Create the `recipe_images` bucket
2. Set up storage policies for image uploads
3. Configure public access for shared recipes

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
recipe-app/
├── app/
│   ├── layout.tsx          # Root layout with Hebrew RTL support
│   ├── page.tsx            # Home page (redirects to /login)
│   ├── login/
│   │   └── page.tsx        # Magic link login with Hebrew UI
│   └── app/
│       ├── layout.tsx      # Authenticated layout with auth gate
│       └── page.tsx        # Main app page (recipe list)
├── lib/
│   ├── supabaseClient.ts   # Browser client for client components
│   └── supabaseServer.ts   # Server client for server components
├── supabase/
│   ├── migrations/
│   │   └── 20240101000000_initial_schema.sql
│   └── STORAGE_SETUP.md
└── middleware.ts           # Auth session refresh
```

## 🔐 Authentication Flow

1. User enters email on `/login`
2. Supabase sends magic link to email
3. User clicks link and is redirected to `/app`
4. Authenticated routes are protected by the auth gate in `/app/layout.tsx`
5. Middleware refreshes the session on each request

## 🗄️ Database Schema

### Recipes Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| title | TEXT | Recipe title |
| description | TEXT | Recipe description |
| ingredients | JSONB | Array of ingredients |
| instructions | JSONB | Array of cooking steps |
| prep_time | INTEGER | Preparation time in minutes |
| cook_time | INTEGER | Cooking time in minutes |
| servings | INTEGER | Number of servings |
| tags | TEXT[] | Array of tags |
| image_url | TEXT | Path to recipe image in storage |
| is_public | BOOLEAN | Whether recipe is publicly shareable |
| public_share_token | UUID | Token for public access |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## 🔒 Row Level Security

The following RLS policies are implemented:

1. Users can view their own recipes
2. Users can insert their own recipes
3. Users can update their own recipes
4. Users can delete their own recipes
5. Anyone can view public recipes (when `is_public = true`)

## 📦 Storage

Recipe images are stored in the `recipe_images` bucket with the following policies:

- Users can upload images to their own folder (`{user_id}/`)
- Users can view their own images
- Public can view images from public recipes
- Users can update/delete their own images

## 🧪 Verification Checklist

- [ ] Dependencies installed successfully
- [ ] Environment variables configured
- [ ] Database migration applied
- [ ] RLS policies verified in Supabase dashboard
- [ ] Storage bucket created
- [ ] Storage policies applied
- [ ] Dev server running
- [ ] Login page loads with Hebrew text
- [ ] Magic link email received
- [ ] Authentication redirect works
- [ ] Protected `/app` route requires login

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Authentication**: Supabase Auth (Magic Link)
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **UI Direction**: RTL (Hebrew)

## 📝 Next Steps

After Phase 0 is complete, you can:
- Add recipe CRUD operations
- Implement image upload functionality
- Create recipe sharing features
- Add search and filtering
- Implement recipe categories

## 🐛 Troubleshooting

### Magic Link Not Received
- Check Supabase Auth settings
- Verify email service is configured
- Check spam folder

### RLS Errors
- Verify policies are correctly applied
- Check user authentication status
- Review Supabase logs

### Image Upload Issues
- Verify storage bucket policies
- Check file size limits
- Ensure correct MIME types
