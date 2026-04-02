
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
        details?: string;
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

export const LAYOUT_OPTIONS = [
    {
        id: 'professional',
        name: 'Professional',
        description: 'Corporate blue header, clean layout - Ideal for business professionals',
        color: 'bg-blue-50 text-blue-900 border-blue-200',
        iconColor: 'bg-blue-200 text-blue-700'
    },
    {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional serif font, timeless design - Best for conservative industries',
        color: 'bg-green-50 text-green-900 border-green-200',
        iconColor: 'bg-green-200 text-green-700'
    },
    {
        id: 'executive',
        name: 'Executive',
        description: 'Gold accent, sophisticated serif - Perfect for senior leadership roles',
        color: 'bg-orange-50 text-orange-900 border-orange-200',
        iconColor: 'bg-orange-200 text-orange-700'
    },
    {
        id: 'elegant',
        name: 'Elegant',
        description: 'Balanced, centered design - Perfect for a polished, professional look',
        color: 'bg-rose-50 text-rose-900 border-rose-200',
        iconColor: 'bg-rose-200 text-rose-700'
    },
    {
        id: 'techblue',
        name: 'Tech Blue',
        description: 'Clean design with blue accents - Perfect for tech and professional roles',
        color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        iconColor: 'bg-indigo-200 text-indigo-700'
    }
] as const;

export type LayoutId = typeof LAYOUT_OPTIONS[number]['id'];

export const TEMPLATE_OPTIONS = [
    {
        id: 'devops-engineer',
        name: 'DevOps Engineer',
        personName: 'Alex Carter',
        description: 'Professional resume template tailored for DevOps Engineer roles.',
        preview: '💼 DevOps Engineer',
        category: 'IT',
        layoutId: 'professional' as const,
        layout: 'Clean',
        color: 'bg-blue-50 text-blue-900 border-blue-200',
        iconColor: 'bg-blue-200 text-blue-700'
    },
    {
        id: 'pharmacist',
        name: 'Pharmacist',
        personName: 'Alex Carter',
        description: 'Professional resume template tailored for Pharmacist roles.',
        preview: '💼 Pharmacist',
        category: 'Healthcare',
        layoutId: 'classic' as const,
        layout: 'Classic',
        color: 'bg-green-50 text-green-900 border-green-200',
        iconColor: 'bg-green-200 text-green-700'
    },
    {
        id: 'project-coordinator',
        name: 'Project Coordinator',
        personName: 'Alex Carter',
        description: 'Professional resume template tailored for Project Coordinator roles.',
        preview: '💼 Project Coordinator',
        category: 'Business',
        layoutId: 'executive' as const,
        layout: 'Executive',
        color: 'bg-orange-50 text-orange-900 border-orange-200',
        iconColor: 'bg-orange-200 text-orange-700'
    },
    {
        id: 'nurse',
        name: 'Nurse',
        personName: 'Ava Bennett',
        description: 'Professional resume template tailored for Nurse roles.',
        preview: '💼 Nurse',
        category: 'Healthcare',
        layoutId: 'elegant' as const,
        layout: 'Centered',
        color: 'bg-rose-50 text-rose-900 border-rose-200',
        iconColor: 'bg-rose-200 text-rose-700'
    },
    {
        id: 'administrative-assistant',
        name: 'Administrative Assistant',
        personName: 'Ava Bennett',
        description: 'Professional resume template tailored for Administrative Assistant roles.',
        preview: '💼 Administrative Assistant',
        category: 'Business',
        layoutId: 'techblue' as const,
        layout: 'Modern',
        color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        iconColor: 'bg-indigo-200 text-indigo-700'
    },
    {
        id: 'procurement-officer',
        name: 'Procurement Officer',
        personName: 'Daniel Foster',
        description: 'Professional resume template tailored for Procurement Officer roles.',
        preview: '💼 Procurement Officer',
        category: 'Logistics',
        layoutId: 'professional' as const,
        layout: 'Clean',
        color: 'bg-blue-50 text-blue-900 border-blue-200',
        iconColor: 'bg-blue-200 text-blue-700'
    },
    {
        id: 'bank-officer',
        name: 'Bank Officer',
        personName: 'Daniel Foster',
        description: 'Professional resume template tailored for Bank Officer roles.',
        preview: '💼 Bank Officer',
        category: 'Finance',
        layoutId: 'classic' as const,
        layout: 'Classic',
        color: 'bg-green-50 text-green-900 border-green-200',
        iconColor: 'bg-green-200 text-green-700'
    },
    {
        id: 'supply-chain-coordinator',
        name: 'Supply Chain Coordinator',
        personName: 'Ethan Brooks',
        description: 'Professional resume template tailored for Supply Chain Coordinator roles.',
        preview: '💼 Supply Chain Coordinator',
        category: 'Logistics',
        layoutId: 'executive' as const,
        layout: 'Executive',
        color: 'bg-orange-50 text-orange-900 border-orange-200',
        iconColor: 'bg-orange-200 text-orange-700'
    },
    {
        id: 'quantity-surveyor',
        name: 'Quantity Surveyor',
        personName: 'Liam Santos',
        description: 'Professional resume template tailored for Quantity Surveyor roles.',
        preview: '💼 Quantity Surveyor',
        category: 'Construction',
        layoutId: 'elegant' as const,
        layout: 'Centered',
        color: 'bg-rose-50 text-rose-900 border-rose-200',
        iconColor: 'bg-rose-200 text-rose-700'
    },
    {
        id: 'react-developer',
        name: 'React Developer',
        personName: 'Liam Santos',
        description: 'Professional resume template tailored for React Developer roles.',
        preview: '💼 React Developer',
        category: 'IT',
        layoutId: 'techblue' as const,
        layout: 'Modern',
        color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        iconColor: 'bg-indigo-200 text-indigo-700'
    },
    {
        id: 'marketing-executive',
        name: 'Marketing Executive',
        personName: 'Liam Santos',
        description: 'Professional resume template tailored for Marketing Executive roles.',
        preview: '💼 Marketing Executive',
        category: 'Marketing',
        layoutId: 'professional' as const,
        layout: 'Clean',
        color: 'bg-blue-50 text-blue-900 border-blue-200',
        iconColor: 'bg-blue-200 text-blue-700'
    },
    {
        id: 'operations-manager',
        name: 'Operations Manager',
        personName: 'Lucas Grant',
        description: 'Professional resume template tailored for Operations Manager roles.',
        preview: '💼 Operations Manager',
        category: 'Management',
        layoutId: 'classic' as const,
        layout: 'Classic',
        color: 'bg-green-50 text-green-900 border-green-200',
        iconColor: 'bg-green-200 text-green-700'
    },
    {
        id: 'medical-laboratory-technician',
        name: 'Medical Laboratory Technician',
        personName: 'Lucas Grant',
        description: 'Professional resume template tailored for Medical Laboratory Technician roles.',
        preview: '💼 Medical Laboratory Technician',
        category: 'Healthcare',
        layoutId: 'executive' as const,
        layout: 'Executive',
        color: 'bg-orange-50 text-orange-900 border-orange-200',
        iconColor: 'bg-orange-200 text-orange-700'
    },
    {
        id: 'flutter-developer',
        name: 'Flutter Developer',
        personName: 'Maya Perera',
        description: 'Professional resume template tailored for Flutter Developer roles.',
        preview: '💼 Flutter Developer',
        category: 'IT',
        layoutId: 'elegant' as const,
        layout: 'Centered',
        color: 'bg-rose-50 text-rose-900 border-rose-200',
        iconColor: 'bg-rose-200 text-rose-700'
    },
    {
        id: 'sales-executive',
        name: 'Sales Executive',
        personName: 'Maya Perera',
        description: 'Professional resume template tailored for Sales Executive roles.',
        preview: '💼 Sales Executive',
        category: 'Sales',
        layoutId: 'techblue' as const,
        layout: 'Modern',
        color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        iconColor: 'bg-indigo-200 text-indigo-700'
    },
    {
        id: 'civil-engineer',
        name: 'Civil Engineer',
        personName: 'Maya Perera',
        description: 'Professional resume template tailored for Civil Engineer roles.',
        preview: '💼 Civil Engineer',
        category: 'Engineering',
        layoutId: 'professional' as const,
        layout: 'Clean',
        color: 'bg-blue-50 text-blue-900 border-blue-200',
        iconColor: 'bg-blue-200 text-blue-700'
    },
    {
        id: 'logistics-officer',
        name: 'Logistics Officer',
        personName: 'Nina Walker',
        description: 'Professional resume template tailored for Logistics Officer roles.',
        preview: '💼 Logistics Officer',
        category: 'Logistics',
        layoutId: 'classic' as const,
        layout: 'Classic',
        color: 'bg-green-50 text-green-900 border-green-200',
        iconColor: 'bg-green-200 text-green-700'
    },
    {
        id: 'financial-analyst',
        name: 'Financial Analyst',
        personName: 'Nina Walker',
        description: 'Professional resume template tailored for Financial Analyst roles.',
        preview: '💼 Financial Analyst',
        category: 'Finance',
        layoutId: 'executive' as const,
        layout: 'Executive',
        color: 'bg-orange-50 text-orange-900 border-orange-200',
        iconColor: 'bg-orange-200 text-orange-700'
    },
    {
        id: 'customer-service-representative',
        name: 'Customer Service Representative',
        personName: 'Noah Mitchell',
        description: 'Professional resume template tailored for Customer Service Representative roles.',
        preview: '💼 Customer Service Representative',
        category: 'Support',
        layoutId: 'elegant' as const,
        layout: 'Centered',
        color: 'bg-rose-50 text-rose-900 border-rose-200',
        iconColor: 'bg-rose-200 text-rose-700'
    },
    {
        id: 'full-stack-developer',
        name: 'Full-Stack Developer',
        personName: 'Noah Mitchell',
        description: 'Professional resume template tailored for Full-Stack Developer roles.',
        preview: '💼 Full-Stack Developer',
        category: 'IT',
        layoutId: 'techblue' as const,
        layout: 'Modern',
        color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        iconColor: 'bg-indigo-200 text-indigo-700'
    }
] as const;

export type TemplateId = typeof TEMPLATE_OPTIONS[number]['id'];
