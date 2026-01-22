# Recipe App - Technical Specification

## Project Overview

A Next.js-based recipe management application with Supabase backend, featuring Hebrew UI, magic link authentication, and recipe sharing capabilities.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Authentication**: Supabase Auth (Magic Link with Implicit Flow)
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **UI Direction**: RTL (Hebrew)

## Architecture

### Frontend Structure

```
recipe-app/
├── app/
│   ├── layout.tsx              # Root layout (Hebrew/RTL config)
│   ├── page.tsx                # Home (redirects to /login)
│   ├── globals.css             # Global styles + RTL
│   ├── login/
│   │   └── page.tsx            # Magic link login (Hebrew UI)
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx        # Auth callback handler
│   └── app/
│       ├── layout.tsx          # Protected layout (auth gate)
│       └── page.tsx            # Main app page
├── lib/
│   ├── supabaseClient.ts       # Browser Supabase client
│   └── supabaseServer.ts       # Server Supabase client
└── middleware.ts               # Session refresh middleware
```

### Database Schema

#### Tables

**recipes**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| title | TEXT | Recipe title |
| description | TEXT | Recipe description (optional) |
| ingredients | JSONB | Array of ingredient objects |
| instructions | JSONB | Array of instruction steps |
| prep_time | INTEGER | Preparation time in minutes |
| cook_time | INTEGER | Cooking time in minutes |
| servings | INTEGER | Number of servings |
| tags | TEXT[] | Array of tags for categorization |
| image_url | TEXT | Path to recipe image in storage |
| is_public | BOOLEAN | Whether recipe is publicly shareable |
| public_share_token | UUID | Unique token for public sharing |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp (auto-updated) |

#### Indexes

- `recipes_user_id_idx` - For efficient user recipe queries
- `recipes_public_share_token_idx` - For public share lookups (partial: WHERE is_public = true)
- `recipes_created_at_idx` - For sorting by creation date (DESC)

### Row Level Security (RLS)

**Enabled**: Yes

**Policies**:

1. **Users can view own recipes**
   - SELECT on recipes WHERE auth.uid() = user_id

2. **Users can insert own recipes**
   - INSERT on recipes WITH CHECK auth.uid() = user_id

3. **Users can update own recipes**
   - UPDATE on recipes WHERE auth.uid() = user_id

4. **Users can delete own recipes**
   - DELETE on recipes WHERE auth.uid() = user_id

5. **Anyone can view public recipes**
   - SELECT on recipes WHERE is_public = true

### Storage

**Bucket**: `recipe_images` (private)

**Structure**:
```
recipe_images/
  └── {user_id}/
      ├── {timestamp_1}.jpg
      ├── {timestamp_2}.png
      └── {timestamp_3}.webp
```

**Policies**:
- Users can upload to their own folder
- Users can view their own images
- Public can view images from public recipes
- Users can update/delete their own images

## Authentication Flow

### Magic Link Authentication (Implicit Flow)

1. **Login Request**
   - User enters email at `/login`
   - Client calls `supabase.auth.signInWithOtp()`
   - Supabase sends magic link to email

2. **Magic Link Click**
   - Link redirects to `/auth/callback` with auth token in URL fragment
   - Callback page calls `supabase.auth.getSession()`
   - Session is automatically stored in browser

3. **Session Verification**
   - Protected routes check `supabase.auth.getUser()`
   - Middleware refreshes session on each request
   - Invalid sessions redirect to `/login`

### Configuration

**Flow Type**: Implicit (no PKCE)
- Reason: Avoids cross-tab PKCE verifier issues
- Token delivered in URL fragment
- Works with email client redirects

**Session Management**:
- `persistSession`: true (localStorage)
- `autoRefreshToken`: true
- `detectSessionInUrl`: true

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xjunwndzmgqrsosxygxw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## UI/UX Specifications

### Hebrew Localization

**Login Page**:
- Title: "התחברות"
- Button: "שליחת קישור למייל"
- Success message: "נשלח לך קישור למייל. אחרי הלחיצה תחזרי לאפליקציה."
- Error message: "שגיאה בשליחת הקישור. נסי שוב."

**Auth Callback**:
- Loading message: "מתחבר..."
- Helper text: "אנא המתן"

**App Layout**:
- App title: "אפליקציית מתכונים"
- Displays user email in header

### RTL Support

- Global `direction: rtl` in CSS
- HTML lang="he" dir="rtl"
- Tailwind configured for RTL layouts

## API Routes

### Future Endpoints (to be implemented)

- `GET /api/recipes` - List user's recipes
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/:id` - Get recipe details
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `GET /api/recipes/public/:token` - Get public recipe by share token
- `POST /api/recipes/:id/image` - Upload recipe image

## Security Considerations

### Authentication
- Magic link OTP with email verification
- Email confirmation disabled (for development)
- Session tokens stored in httpOnly cookies (via middleware)
- Auto-refresh prevents session expiration

### Database
- RLS enforced on all tables
- Users can only access their own data
- Public sharing via unique UUID tokens only
- Foreign key cascade deletes ensure data integrity

### Storage
- Private bucket (not publicly accessible)
- User-scoped folders prevent unauthorized access
- Public images only accessible via RLS-validated recipes
- MIME type restrictions (images only)

## Deployment Checklist

### Supabase Setup
- [x] Create Supabase project
- [x] Apply database migration
- [x] Enable RLS policies
- [x] Create storage bucket
- [x] Apply storage policies
- [x] Configure redirect URLs
- [x] Disable email confirmation (dev) or configure email templates (prod)

### Application Setup
- [x] Install dependencies
- [x] Configure environment variables
- [x] Set up Tailwind CSS
- [x] Configure TypeScript
- [x] Set up Next.js App Router
- [x] Implement authentication flow
- [x] Create protected routes

### Testing Checklist
- [x] Magic link email delivery
- [x] Login flow completion
- [x] Session persistence
- [x] Protected route access control
- [x] RLS policy enforcement
- [ ] Recipe CRUD operations (pending)
- [ ] Image upload/download (pending)
- [ ] Public sharing (pending)

## Known Issues & Solutions

### Issue: PKCE Code Verifier Not Found
**Solution**: Switch to implicit flow (`flowType: 'implicit'`)

### Issue: Session Not Persisting After Callback
**Solution**: Use client-side callback page instead of server route handler

### Issue: Email Confirmation Blocking Login
**Solution**: Disable "Confirm email" in Supabase Auth settings for development

### Issue: Magic Link Opens in Different Browser Context
**Solution**: Implicit flow doesn't require PKCE, works cross-context

## Future Enhancements

### Phase 1 - Recipe CRUD
- Create recipe form
- Recipe list view
- Recipe detail view
- Edit recipe functionality
- Delete recipe with confirmation

### Phase 2 - Image Management
- Image upload component
- Image preview
- Image compression
- Multiple images per recipe

### Phase 3 - Sharing & Discovery
- Public recipe gallery
- Share link generation
- Recipe collections/categories
- Search and filter

### Phase 4 - Advanced Features
- Recipe ratings
- Comments
- Recipe variations
- Meal planning
- Shopping list generation

## Performance Considerations

- Database indexes on frequently queried columns
- Image optimization (Next.js Image component)
- Lazy loading for recipe lists
- Server-side rendering for public recipes (SEO)
- Edge caching for static content

## Monitoring & Analytics

### To Implement
- Error tracking (Sentry)
- Performance monitoring
- User analytics
- Database query performance
- Storage usage metrics

## Support & Maintenance

### Logs
- Server logs: Check dev server console
- Database logs: Supabase dashboard
- Auth logs: Supabase Auth logs

### Backup Strategy
- Database: Supabase automatic backups
- Storage: Regular bucket snapshots
- Code: Git version control

## Contributing Guidelines

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component-based architecture

### Git Workflow
- Feature branches
- Pull request reviews
- Semantic versioning
- Changelog maintenance
