# 🚀 Resume.AI - MVP Deployment Guide

A comprehensive deployment plan for the Resume.AI optimization & career assistant platform.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Stack](#frontend-stack)
3. [Backend Stack](#backend-stack)
4. [API Architecture](#api-architecture)
5. [Database Schema](#database-schema)
6. [Hosting & Deployment](#hosting--deployment)
7. [Security Best Practices](#security-best-practices)
8. [Cost-Efficient Setup](#cost-efficient-setup)
9. [Scaling Considerations](#scaling-considerations)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              React + Vite + TypeScript                   │    │
│  │         Tailwind CSS + shadcn/ui Components              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Supabase Edge Functions (Deno)              │    │
│  │    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │    │analyze-  │ │analyze-  │ │analyze-  │ │match-    │  │    │
│  │    │job       │ │github    │ │linkedin  │ │skills    │  │    │
│  │    └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  │    ┌──────────┐ ┌──────────┐ ┌──────────┐               │    │
│  │    │generate- │ │calculate-│ │suggest-  │               │    │
│  │    │resume    │ │ats-score │ │learning  │               │    │
│  │    └──────────┘ └──────────┘ └──────────┘               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │   Supabase Postgres  │    │   Supabase Auth      │          │
│  │   (Database)         │    │   (Authentication)   │          │
│  └──────────────────────┘    └──────────────────────┘          │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │   Supabase Storage   │    │   AI Gateway         │          │
│  │   (File Storage)     │    │   (AI Processing)    │          │
│  └──────────────────────┘    └──────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚛️ Frontend Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.x | UI Framework |
| **Vite** | Latest | Build Tool & Dev Server |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 3.x | Utility-First Styling |
| **shadcn/ui** | Latest | Component Library |

### Key Libraries

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x",    // Server state management
    "react-router-dom": "^6.x",          // Client-side routing
    "react-hook-form": "^7.x",           // Form handling
    "zod": "^3.x",                       // Schema validation
    "lucide-react": "^0.x",              // Icon library
    "sonner": "^1.x",                    // Toast notifications
    "recharts": "^2.x"                   // Data visualization
  }
}
```

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false, // Disable in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs']
        }
      }
    }
  }
});
```

---

## 🔧 Backend Stack

### Supabase Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **PostgreSQL** | Primary Database | Row Level Security enabled |
| **Auth** | User Authentication | Email/Password, OAuth ready |
| **Edge Functions** | Serverless API | Deno runtime |
| **Storage** | File Storage | Resume PDFs, avatars |
| **Realtime** | Live Updates | Optional for collaboration |

### Edge Functions Architecture

```
supabase/functions/
├── analyze-job/          # Job description analysis
│   └── index.ts
├── analyze-github/       # GitHub profile analysis
│   └── index.ts
├── analyze-linkedin/     # LinkedIn data analysis
│   └── index.ts
├── match-skills/         # Skills comparison engine
│   └── index.ts
├── generate-resume/      # AI resume generation
│   └── index.ts
├── calculate-ats-score/  # ATS compatibility scoring
│   └── index.ts
└── suggest-learning/     # Learning recommendations
    └── index.ts
```

### AI Integration

All AI processing uses a secure **AI Gateway** with supported models (OpenRouter or direct):

```typescript
// Recommended models by use case
const AI_MODELS = {
  analysis: "google/gemini-2.5-flash",      // Fast analysis
  generation: "google/gemini-3-flash-preview", // Content generation
  complex: "google/gemini-2.5-pro"          // Complex reasoning
};

// AI Gateway endpoints (example OpenRouter or custom)
const AI_GATEWAY = "https://openrouter.ai/api/v1/chat/completions";
```

---

## 🔌 API Architecture

### RESTful Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/analyze-job` | POST | Analyze job description | No |
| `/analyze-github` | POST | Analyze GitHub profile | No |
| `/analyze-linkedin` | POST | Analyze LinkedIn data | No |
| `/match-skills` | POST | Compare skills | No |
| `/generate-resume` | POST | Generate ATS resume | No |
| `/calculate-ats-score` | POST | Calculate ATS score | No |
| `/suggest-learning` | POST | Get learning suggestions | No |

### Request/Response Format

```typescript
// Standard Request
interface APIRequest {
  // Varies by endpoint
  data: Record<string, unknown>;
}

// Standard Response
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Error Response
interface ErrorResponse {
  error: string;
  status: number;
}
```

### CORS Configuration

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   profiles   │     │    jobs      │     │   resumes    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │     │ id (PK)      │     │ id (PK)      │
│ user_id (FK) │     │ user_id (FK) │     │ user_id (FK) │
│ full_name    │     │ job_title    │     │ title        │
│ email        │     │ company_name │     │ content      │
│ location     │     │ description  │     │ template     │
│ skills[]     │     │ keywords[]   │     │ ats_score    │
│ education    │     │ required_    │     │ job_id (FK)  │
│ work_exp     │     │   skills[]   │     │ matched_     │
│ github_user  │     │ analysis_    │     │   keywords[] │
│ linkedin_*   │     │   data       │     │ missing_     │
│ created_at   │     │ created_at   │     │   keywords[] │
│ updated_at   │     │ updated_at   │     │ created_at   │
└──────────────┘     └──────────────┘     └──────────────┘
        │                   │                    │
        │                   │                    │
        ▼                   ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ github_data  │     │ applications │◄────│   resumes    │
├──────────────┤     ├──────────────┤     └──────────────┘
│ id (PK)      │     │ id (PK)      │
│ user_id (FK) │     │ user_id (FK) │
│ username     │     │ job_id (FK)  │
│ repositories │     │ resume_id(FK)│
│ top_languages│     │ status       │
│ extracted_   │     │ applied_date │
│   skills[]   │     │ notes        │
│ last_synced  │     │ created_at   │
└──────────────┘     └──────────────┘
```

### Tables SQL

```sql
-- Profiles (auto-created on user signup)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  location TEXT,
  professional_summary TEXT,
  skills TEXT[],
  education JSONB,
  work_experience JSONB,
  certifications JSONB,
  github_username TEXT,
  linkedin_headline TEXT,
  linkedin_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs (analyzed job descriptions)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT,
  job_description TEXT NOT NULL,
  experience_level TEXT,
  required_skills TEXT[],
  preferred_skills TEXT[],
  soft_skills TEXT[],
  tools TEXT[],
  keywords TEXT[],
  responsibilities TEXT[],
  analysis_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Resumes (generated resumes)
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID REFERENCES jobs(id),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  template TEXT DEFAULT 'professional',
  ats_score INTEGER,
  matched_keywords TEXT[],
  missing_keywords TEXT[],
  is_draft BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Applications (job application tracking)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES jobs(id),
  resume_id UUID REFERENCES resumes(id),
  status TEXT DEFAULT 'saved',
  applied_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- GitHub Data (cached GitHub analysis)
CREATE TABLE github_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  repositories JSONB,
  top_languages TEXT[],
  extracted_skills TEXT[],
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_data ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Jobs: Users can CRUD their own jobs
CREATE POLICY "Users can manage own jobs"
  ON jobs FOR ALL
  USING (auth.uid() = user_id);

-- Resumes: Users can CRUD their own resumes
CREATE POLICY "Users can manage own resumes"
  ON resumes FOR ALL
  USING (auth.uid() = user_id);

-- Applications: Users can CRUD their own applications
CREATE POLICY "Users can manage own applications"
  ON applications FOR ALL
  USING (auth.uid() = user_id);

-- GitHub Data: Users can CRUD their own data
CREATE POLICY "Users can manage own github data"
  ON github_data FOR ALL
  USING (auth.uid() = user_id);
```

---

## 🌐 Hosting & Deployment

### Recommended: Cloud Hosting

| Component | Hosting | Cost |
|-----------|---------|------|
| Frontend | Vercel / Netlify / Cloudflare | $0+ |
| Backend | Supabase Edge Functions | Usage-based |
| Database | Supabase PostgreSQL | Free tier available |
| AI Processing | AI Gateway (OpenRouter) | Usage-based |

### Deployment Workflow

```bash
# Deployment via Supabase CLI
1. supabase functions deploy
2. push frontend code to Git
3. Automatic CI/CD pipeline triggers (Vercel/Netlify)
```

### Alternative Hosting Options

| Platform | Frontend | Backend | Database | Monthly Cost |
|----------|----------|---------|----------|--------------|
| **Vercel + Supabase** | ✅ | Serverless | ✅ | $0-20 |
| **Netlify + Supabase** | ✅ | Functions | ✅ | $0-19 |
| **Railway** | ✅ | ✅ | ✅ | $5-20 |

### Environment Variables

```env
# Required Frontend Vars
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...

# Edge Function Secrets
AI_API_KEY=xxx  # AI API Key (OpenRouter or OpenAI)
SUPABASE_SERVICE_ROLE_KEY=xxx  # For admin operations
```

---

## 🔒 Security Best Practices

### Authentication

```typescript
// Secure session management
const supabase = createClient(URL, KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Protected routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/auth" />;
  
  return children;
};
```

### Data Protection

| Layer | Protection |
|-------|------------|
| **Transport** | HTTPS enforced |
| **Database** | Row Level Security |
| **API Keys** | Server-side only |
| **User Data** | Encrypted at rest |
| **Sessions** | JWT with refresh tokens |

### Input Validation

```typescript
// Zod schema validation
const jobDescriptionSchema = z.object({
  jobDescription: z.string()
    .min(50, "Job description too short")
    .max(10000, "Job description too long"),
});

// Sanitize user input
const sanitizeInput = (input: string) => {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
};
```

### Rate Limiting

```typescript
// Edge function rate limiting
const RATE_LIMIT = {
  analyze: 10,      // 10 per minute
  generate: 5,      // 5 per minute
  calculate: 20,    // 20 per minute
};

// Implement with Supabase or external service
```

### Security Checklist

- [x] HTTPS enforced on all endpoints
- [x] Row Level Security on all tables
- [x] API keys stored as secrets (not in code)
- [x] Input validation on all user inputs
- [x] CORS properly configured
- [x] No sensitive data in client-side code
- [x] JWT tokens with expiration
- [x] SQL injection prevention via parameterized queries

---

## 💰 Cost-Efficient Setup

### Free Tier Optimization

| Service | Free Tier Limits | Optimization |
|---------|------------------|--------------|
| **Supabase Database** | 500MB storage | Index optimization |
| **Supabase Auth** | 50,000 MAU | Email auth only |
| **Edge Functions** | 500K invocations | Cache responses |
| **AI Processing** | Usage-based | Use flash models |

### Estimated Monthly Costs

#### Scenario 1: MVP Launch (0-100 users)
```
Supabase Free Tier:     $0
AI Usage:               $0-5
----------------------------
Total:                  $0-5/month
```

#### Scenario 2: Growth (100-1000 users)
```
Supabase Pro:           $25
AI Usage:               $10-30
----------------------------
Total:                  $35-55/month
```

#### Scenario 3: Scale (1000-10000 users)
```
Supabase Pro:           $25
Compute Add-on:         $50
AI Usage:               $50-100
----------------------------
Total:                  $125-175/month
```

### Cost Optimization Strategies

1. **Caching**
   - Cache job analysis results
   - Cache GitHub data (refresh daily)
   - Use React Query for client-side caching

2. **AI Optimization**
   - Use `gemini-2.0-flash-lite` for simple tasks
   - Use `gemini-2.0-flash` for analysis
   - Reserve `gemini-2.0-pro` for complex generation

3. **Database Optimization**
   - Index frequently queried columns
   - Archive old data after 6 months
   - Use JSONB for flexible data

---

## 📈 Scaling Considerations

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Page Load | < 2s | ✅ |
| API Response | < 3s | ✅ |
| AI Analysis | < 10s | ✅ |
| Uptime | 99.9% | ✅ |

### Horizontal Scaling

```
Phase 1 (MVP):
├── Single region deployment
├── Supabase free/pro tier
└── Basic caching

Phase 2 (Growth):
├── CDN for static assets
├── Database connection pooling
└── Response caching layer

Phase 3 (Scale):
├── Multi-region deployment
├── Read replicas
├── Queue for AI processing
└── Redis caching layer
```

### Monitoring & Observability

```typescript
// Error tracking
import * as Sentry from "@sentry/react";

// Analytics
import { Analytics } from "@vercel/analytics/react";

// Performance monitoring
import { SpeedInsights } from "@vercel/speed-insights/react";
```

---

## 🎯 Target User Optimization

### Students & Entry-Level Focus

| Feature | Implementation |
|---------|----------------|
| **Free Access** | Core features on free tier |
| **Simple Onboarding** | 3-step setup wizard |
| **Beginner Content** | Tooltips and guides |
| **Free Resources** | Only free learning links |
| **Mobile Friendly** | Responsive design |

### User Journey

```
1. Land on homepage → See value proposition
2. Sign up (free) → Create account
3. Paste job description → Get analysis
4. Connect GitHub → Import projects
5. Add LinkedIn data → Extract skills
6. View skill match → See gaps
7. Generate resume → ATS-optimized
8. Check ATS score → Improve
9. Get learning path → Grow skills
10. Track applications → Stay organized
```

---

## 📝 Deployment Checklist

### Pre-Launch
- [ ] All edge functions tested
- [ ] RLS policies verified
- [ ] Error handling complete
- [ ] Loading states implemented
- [ ] Mobile responsiveness checked
- [ ] Performance optimized

### Launch
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics enabled
- [ ] Error tracking setup
- [ ] Backup strategy defined

### Post-Launch
- [ ] Monitor error rates
- [ ] Track usage patterns
- [ ] Gather user feedback
- [ ] Plan feature iterations
- [ ] Review cost optimization

---

## 🔗 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

*Last Updated: February 2026*
*Version: 1.1.0 (White-labeled)*
