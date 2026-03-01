
# Resume.AI - Intelligent Career Compass

<div align="center">
  <img src="public/favicon.svg" alt="Resume.AI Logo" width="100" />
  <br />
  <a href="https://resume-ai.dev">
    <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" alt="Status" />
  </a>
  <a href="https://github.com/kavishka-CodXlab/Resume.AI/issues">
    <img src="https://img.shields.io/github/issues/kavishka-CodXlab/Resume.AI?style=for-the-badge" alt="Issues" />
  </a>
  <a href="https://github.com/kavishka-CodXlab/Resume.AI/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/kavishka-CodXlab/Resume.AI?style=for-the-badge" alt="License" />
  </a>
</div>

<br />

**Resume.AI** is a state-of-the-art career optimization platform engineered to bridge the gap between human talent and algorithmic hiring systems. By leveraging advanced Large Language Models (LLMs) and vector-based analysis, it transforms static resumes into dynamic, ATS-optimized assets tailored to specific job requirements.

---

## 🚀 Key Features

### 🤖 Resume.AI Career Advisor Bot *(New)*
A fully integrated, floating AI chatbot built on the **4-Tier Agentic Memory Architecture** designed to eliminate hallucinations and provide highly accurate, context-aware career guidance.

- **4-Tier Agentic Memory System:**
  - 🧠 **Short-Term Memory** — Keeps the last 10 messages of your conversation for coherent multi-turn dialogue
  - 📚 **Semantic Memory** — Reads your current resume data (job title, skills, summary) from session storage as verified facts
  - 🗂️ **Episodic Memory** — Tracks your past app activity (ATS scores checked, LinkedIn/GitHub analyzed)
  - ⚙️ **Procedural Memory (SOPs)** — Enforces strict workflow rules (skill matching, resume optimization, interview prep) to prevent generic or invented responses

- **ChatGPT-Style Full-Screen Mode** — Click "Ask AI Assistant" in the sidebar to launch an immersive full-screen chat experience
- **Sidebar Integration** — Directly accessible under the **Optimize** section of the sidebar navigation
- **Floating Widget** — A gently animated bot icon floats in the bottom-right corner on every page
- **Custom Animated Bot Icon** — Features a smooth floating bob + indigo pulse ring animation
- **Powered by OpenRouter Free Tier** — Uses the `openrouter/free` model, auto-routing to the best available free AI model
- **Supports Multiple AI Providers** — Auto-detects key type: Gemini (`AIza...`), OpenAI (`sk-...`), or OpenRouter (`sk-or-...`)
- **Markdown Rendering** — AI responses render as rich, formatted markdown with headers, bullet points, and code blocks

---

### 🧠 AI-Driven Optimization & Analysis
- **Contextual Resume Tailoring**: Uses vector embeddings to map user experience against job descriptions, identifying key overlap and missing keywords.
- **Narrative Cover Letter Generation**: Moves beyond generic templates by constructing a 4-paragraph psychological narrative hook based on the user's actual career trajectory.
- **Real-time ATS Scoring**: Provides instant feedback on resume "parse-ability" and keyword density relative to the target role.

### 🔗 Intelligent Data Aggregation
- **GitHub Profiler**: Analyses code repositories, languages, and contribution graphs to synthesize a "Technical Skills" profile.
- **LinkedIn Extraction**: Parses professional history and endorsements to auto-populate work experience modules.
- **Skill Gap Analysis**: Identifies critical missing hard skills for a target role and suggests learning paths.

### 📄 Resume Builder Enhancements *(Updated)*
- **Smart CV File Naming** — Downloads are automatically named using `FirstName_LastName_CV` format
  - e.g., `Kavishka_Thilakarathna_CV.pdf` / `.docx` / `.txt`
  - Applies across all three download formats (PDF, Word DOCX, plain text)
- **Word Document (.docx) Export** — Full DOCX generation with proper formatting using the `docx` library
- **Multi-format PDF Templates** — Download using Modern, Classic, or Minimal template layouts
- **Live Preview** — Real-time CV preview panel with horizontal/vertical layout toggle
- **Persistent Resume History** — Auto-saves resume edits to localStorage for session continuity

### 🎨 Templates *(Updated)*
- **Template Gallery** — Browse and preview all available resume templates
- **Live Dummy Data Preview** — Click "Preview" on any template to instantly see it rendered with sample data
- **One-click Apply** — Apply any template directly to your active resume from the template gallery

### 📊 Dashboard Stats *(Updated)*
- **Always-Accurate Stats** — Dashboard now reads from localStorage first to ensure stats (Total Resumes, ATS Score, Jobs Analyzed, Profile Completion) are always current, even without an active session
- **Real-time Updates** — Stats refresh on every navigation to the dashboard

### ⚡ Modern Application Architecture
- **Reactive UX**: Built with React and shadcn/ui for a fluid, accessible, and responsive interface.
- **Edge-First Backend**: Powered by Supabase Edge Functions (Deno) for low-latency AI inference and data processing.
- **Secure Persistence**: Enterprise-grade Row Level Security (RLS) ensures user data isolation and privacy.

---

## 🛠️ Technical Architecture

### Frontend Layer
- **Framework**: [Vite](https://vitejs.dev/) + [React](https://react.dev/) (TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix Primitives)
- **State Management**: React Query (TanStack) for server state; Context API for local sessions.
- **Markdown Rendering**: `react-markdown` for rich AI response formatting

### Backend & Infrastructure
- **Database**: PostgreSQL (Supabase) with `pgvector` for semantic search capabilities.
- **Runtime**: Deno (Supabase Edge Functions).
- **Authentication**: Supabase Auth (JWT + RLS).
- **Storage**: Supabase Storage for resume artifacts (PDF/DOCX).

### AI Orchestration
- **Model Layer**: Integrated with LLMs via OpenRouter (free tier), OpenAI, and Google Gemini.
- **Memory Architecture**: 4-Tier Agentic Memory system (Short-Term, Semantic, Episodic, Procedural) for context-aware, hallucination-free responses.
- **Prompt Engineering**: Role-enforced system prompts with strict SOPs for professional career guidance.
- **Edge Function**: `resume-ai-bot` Supabase Edge Function handles all AI chat inference server-side.

---

## 🔑 Environment Variables

```env
# Frontend (required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Backend Edge Function Secrets (set via Supabase CLI)
AI_API_KEY=sk-or-your_openrouter_or_openai_or_gemini_key
```

### Setting AI API Key for the Bot

```bash
# Login to Supabase CLI
supabase login --token your_personal_access_token

# Set the AI API key (supports OpenRouter, OpenAI, or Gemini)
supabase secrets set --project-ref YOUR_PROJECT_REF AI_API_KEY="sk-or-..."

# Deploy the AI Bot edge function
supabase functions deploy resume-ai-bot --project-ref YOUR_PROJECT_REF --no-verify-jwt
```

---

## 💻 Local Development

### Prerequisites
- Node.js v18+
- npm or pnpm
- Supabase CLI (for backend linking)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kavishka-CodXlab/Resume.AI.git
   cd Resume.AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 📦 Deployment

This project is optimized for deployment on modern edge platforms.

### Frontend
Deploy the `/dist` folder to invalidation-capable CDNs like **Vercel**, **Netlify**, or **Cloudflare Pages**.

```bash
npm run build
```

### Backend (Edge Functions)
Deploy serverless functions directly to Supabase global edge network:

```bash
# Deploy all functions
supabase functions deploy --project-ref YOUR_PROJECT_REF

# Deploy only the AI bot function
supabase functions deploy resume-ai-bot --project-ref YOUR_PROJECT_REF --no-verify-jwt
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest improvements.

---

## 📋 Changelog

### v2.0.0 — March 2026
- ✅ Added Resume.AI Career Advisor Bot with 4-Tier Agentic Memory Architecture
- ✅ Added ChatGPT-style full-screen chat mode
- ✅ Added animated floating bot widget with custom icon
- ✅ Added "Ask AI Assistant" to Optimize sidebar section
- ✅ Improved CV download naming: `FirstName_LastName_CV.ext`
- ✅ Real-time dashboard statistics updated from localStorage
- ✅ Template gallery preview with dummy data
- ✅ Word (.docx) document export support

### v1.0.0 — February 2026
- ✅ Initial release with ATS Score, Job Analyzer, GitHub/LinkedIn profiler
- ✅ Resume Builder with multi-template PDF export
- ✅ Application Tracker, Learning Suggestions, Skills Matcher

---

<div align="center">
  <p>Engineered with ❤️ by <a href="https://github.com/kavishka-CodXlab">Kavishka Thilakarathna</a></p>
  <p>&copy; 2026 Resume.AI. All rights reserved.</p>
</div>
