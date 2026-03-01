export { ModernTemplate } from './ModernTemplate';
export { ClassicTemplate } from './ClassicTemplate';
export { SimpleTemplate } from './SimpleTemplate';
export { ElegantTemplate } from './ElegantTemplate';
export { TechBlueTemplate } from './TechBlueTemplate';
export { generateATSHTML } from './generateHTML';
export interface ResumeData {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
    profileImageUri?: string;
    jobTitle?: string;
    accentColor?: string;
    customContacts?: Array<{id?: string, label: string, value: string}>;
    summary?: string;
    skills: string[];
    additionalSkills?: string[];
    experience: Array<{
        title: string;
        company: string;
        location?: string;
        duration: string;
        bullets: string[];
    }>;
    projects: Array<{
        name: string;
        description: string;
        tech: string;
        dates?: string;
    }>;
    education: Array<{
        degree: string;
        institution: string;
        year: string;
    }>;
    certifications?: Array<{
        name: string;
        issuer: string;
        date: string;
    }>;
    publications?: Array<{
        title: string;
        publisher: string;
        date: string;
    }>;
    achievements?: string;
    additionalInfo?: string;
    references?: Array<{
        name: string;
        role: string;
        organization: string;
        phone: string;
        email: string;
    }>;
    layout?: {
        fontSize: number;
        lineHeight: number;
        sectionSpacing: number;
    };
    pageStrategy?: 'one_page' | 'standard';
}

export const TEMPLATE_OPTIONS = [
    {
        id: 'modern',
        name: 'Modern',
        description: 'Purple gradient header, contemporary design - Perfect for tech & creative roles',
        preview: '🎨 Modern Gradient',
        category: 'Creative',
        layout: 'Contemporary',
        color: 'bg-purple-100 text-purple-900 border-purple-200',
        iconColor: 'bg-purple-200 text-purple-700'
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Corporate blue header, clean layout - Ideal for business professionals',
        preview: '💼 Professional',
        category: 'Business',
        layout: 'Clean',
        color: 'bg-blue-50 text-blue-900 border-blue-200',
        iconColor: 'bg-blue-200 text-blue-700'
    },
    {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional serif font, timeless design - Best for conservative industries',
        preview: '📄 Classic',
        category: 'Finance',
        layout: 'Classic',
        color: 'bg-green-50 text-green-900 border-green-200',
        iconColor: 'bg-green-200 text-green-700'
    },
    {
        id: 'executive',
        name: 'Executive',
        description: 'Gold accent, sophisticated serif - Perfect for senior leadership roles',
        preview: '👔 Executive',
        category: 'Management',
        layout: 'Executive',
        color: 'bg-orange-50 text-orange-900 border-orange-200',
        iconColor: 'bg-orange-200 text-orange-700'
    },
    {
        id: 'minimalist',
        name: 'Minimalist',
        description: 'Ultra-clean, light typography - Universal appeal, maximum readability',
        preview: '✨ Minimalist',
        category: 'All',
        layout: 'Clean',
        color: 'bg-zinc-50 text-zinc-900 border-zinc-200',
        iconColor: 'bg-zinc-200 text-zinc-700'
    },
    {
        id: 'elegant',
        name: 'Elegant',
        description: 'Balanced, centered design - Perfect for a polished, professional look',
        preview: '⭐ Elegant',
        category: 'Creative',
        layout: 'Centered',
        color: 'bg-rose-50 text-rose-900 border-rose-200',
        iconColor: 'bg-rose-200 text-rose-700'
    },
    {
        id: 'techblue',
        name: 'Tech Blue',
        description: 'Clean design with blue accents - Perfect for tech and professional roles',
        preview: '🔷 Tech Blue',
        category: 'IT',
        layout: 'Modern',
        color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        iconColor: 'bg-indigo-200 text-indigo-700'
    }
] as const;

export type TemplateId = typeof TEMPLATE_OPTIONS[number]['id'];
