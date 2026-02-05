export { ModernTemplate } from './ModernTemplate';
export { ClassicTemplate } from './ClassicTemplate';
export { SimpleTemplate } from './SimpleTemplate';
export { ElegantTemplate } from './ElegantTemplate';
export { generateATSHTML, generateCoverLetterHTML } from './generateHTML';

export interface ResumeData {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
    summary?: string;
    skills: string[];
    experience: Array<{
        title: string;
        company: string;
        duration: string;
        bullets: string[];
    }>;
    projects: Array<{
        name: string;
        description: string;
        tech: string;
    }>;
    education: Array<{
        degree: string;
        institution: string;
        year: string;
    }>;
}

export const TEMPLATE_OPTIONS = [
    {
        id: 'modern',
        name: 'Modern',
        description: 'Purple gradient header, contemporary design - Perfect for tech & creative roles',
        preview: '🎨 Modern Gradient'
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Corporate blue header, clean layout - Ideal for business professionals',
        preview: '💼 Professional'
    },
    {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional serif font, timeless design - Best for conservative industries',
        preview: '📄 Classic'
    },
    {
        id: 'executive',
        name: 'Executive',
        description: 'Gold accent, sophisticated serif - Perfect for senior leadership roles',
        preview: '👔 Executive'
    },
    {
        id: 'minimalist',
        name: 'Minimalist',
        description: 'Ultra-clean, light typography - Universal appeal, maximum readability',
        preview: '✨ Minimalist'
    },
    {
        id: 'elegant',
        name: 'Elegant',
        description: 'Balanced, centered design - Perfect for a polished, professional look',
        preview: '⭐ Elegant'
    }
] as const;

export type TemplateId = typeof TEMPLATE_OPTIONS[number]['id'];
