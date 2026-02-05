
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

### 🧠 AI-Driven Optimization & Analysis
-   **Contextual Resume Tailoring**: Uses vector embeddings to map user experience against job descriptions, identifying key overlap and missing keywords.
-   **Narrative Cover Letter Generation**: Moves beyond generic templates by constructing a 4-paragraph psychological narrative hook based on the user's actual career trajectory.
-   **Real-time ATS Scoring**: Provides instant feedback on resume "parse-ability" and keyword density relative to the target role.

### 🔗 Intelligent Data Aggregation
-   **GitHub Profiler**: analyzing code repositories, languages, and contribution graphs to synthesize a "Technical Skills" profile.
-   **LinkedIn Extraction**: Parses professional history and endorsements to auto-populate work experience modules.
-   **Skill Gap Analysis**: Identifies critical missing hard skills for a target role and suggests learning paths.

### ⚡ Modern Application Architecture
-   **Reactive UX**: Built with React and shadcn/ui for a fluid, accessible, and responsive interface.
-   **Edge-First Backend**: Powered by Supabase Edge Functions (Deno) for low-latency AI inference and data processing.
-   **Secure Persistence**: Enterprise-grade Row Level Security (RLS) ensures user data isolation and privacy.

---

## 🛠️ Technical Architecture

### Frontend Layer
-   **Framework**: [Vite](https://vitejs.dev/) + [React](https://react.dev/) (TypeScript)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix Primitives)
-   **State Management**: React Query (TanStack) for server state; Context API for local sessions.

### Backend & Infrastructure
-   **Database**: PostgreSQL (Supabase) with `pgvector` for semantic search capabilities.
-   **Runtime**: Deno (Supabase Edge Functions).
-   **Authentication**: Supabase Auth (JWT + RLS).
-   **Storage**: Supabase Storage for resume artifacts (PDF/DOCX).

### AI Orchestration
-   **Model Layer**: Integrated with sophisticated LLMs (via OpenRouter/OpenAI) for generation and semantic analysis.
-   **Prompt Engineering**: Custom system prompts designed for "narrative enforcement" to prevent hallucination and ensure professional tone.

---

## 💻 Local Development

### Prerequisites
-   Node.js v18+
-   npm or pnpm
-   Supabase CLI (for backend linking)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/kavishka-CodXlab/Resume.AI.git
    cd Resume.AI
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Start Development Server**
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
supabase functions deploy
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest improvements.

---

<div align="center">
  <p>Engineered with ❤️ by <a href="https://github.com/kavishka-CodXlab">Kavishka Thilakarathna</a></p>
  <p>&copy; 2026 Resume.AI. All rights reserved.</p>
</div>
