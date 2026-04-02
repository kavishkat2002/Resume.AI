import React from 'react';
import { ResumeData } from './index';

interface TechBlueTemplateProps {
    data: ResumeData;
    jobTitle?: string;
}

export const TechBlueTemplate: React.FC<TechBlueTemplateProps> = ({ data, jobTitle }) => {
    return (
        <div className="resume-template techblue-template" style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            maxWidth: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            padding: '20mm',
            backgroundColor: 'white',
            color: '#333',
            fontSize: '10pt',
            lineHeight: '1.5'
        }}>
            {/* Header */}
            <header style={{
                borderBottom: '4px solid #1E40AF',
                paddingBottom: '12px',
                marginBottom: '20px'
            }}>
                <h1 style={{
                    fontSize: '28pt',
                    fontWeight: 'bold',
                    color: '#111827',
                    margin: '0 0 5px 0',
                    lineHeight: '1.1',
                    letterSpacing: '-0.5px'
                }}>
                    {data.fullName}
                </h1>
                
                {jobTitle && (
                    <h2 style={{
                        fontSize: '18pt',
                        fontWeight: 'bold',
                        color: '#2563EB',
                        margin: '0 0 12px 0',
                        lineHeight: '1'
                    }}>
                        {jobTitle}
                    </h2>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, auto)',
                    columnGap: '40px',
                    rowGap: '10px',
                    fontSize: '9.5pt',
                    color: '#4B5563',
                    marginTop: '15px',
                    justifyContent: 'flex-start'
                }}>
                        {/* 1. LinkedIn */}
                        {data.linkedin && (
                            <span style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                                <svg style={{width:'14px', height:'14px', marginRight:'8px', color:'#4B5563'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                    <rect x="2" y="9" width="4" height="12"></rect>
                                    <circle cx="4" cy="4" r="2"></circle>
                                </svg>
                                {data.linkedin.replace('linkedin.com/in/', '').replace('https://', '')}
                            </span>
                        )}

                        {/* 2. GitHub */}
                        {data.github && (
                            <span style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                                <svg style={{width:'14px', height:'14px', marginRight:'8px', color:'#4B5563'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                </svg>
                                {data.github.replace('github.com/', '').replace('https://', '')}
                            </span>
                        )}

                        {/* 3. Portfolio/Web */}
                        {data.portfolio && (
                            <span style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                                <svg style={{width:'14px', height:'14px', marginRight:'8px', color:'#4B5563'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="2" y1="12" x2="22" y2="12"></line>
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                </svg>
                                {data.portfolio.replace('https://', '').replace('www.', '')}
                            </span>
                        )}

                        {/* 4. Email */}
                        {data.email && (
                            <span style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                                <svg style={{width:'14px', height:'14px', marginRight:'8px', color:'#4B5563'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                {data.email}
                            </span>
                        )}

                        {/* 5. Phone */}
                        {data.phone && (
                            <span style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                                <svg style={{width:'14px', height:'14px', marginRight:'8px', color:'#4B5563'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                                {data.phone}
                            </span>
                        )}

                        {/* 6. Location */}
                        {data.location && (
                            <span style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                                <svg style={{width:'14px', height:'14px', marginRight:'8px', color:'#4B5563'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                {data.location}
                            </span>
                        )}

                        {/* 7. Other custom contacts (like Portfolio, Instagram, etc. if added via custom section) */}
                        {data.customContacts && data.customContacts.filter(c => {
                            const l = c.label.toLowerCase();
                            return !(l.includes('linkedin') && data.linkedin) && 
                                   !(l.includes('github') && data.github) && 
                                   !((l.includes('portfolio') || l.includes('website')) && data.portfolio) && 
                                   !(l.includes('email') && data.email) && 
                                   !(l.includes('phone') && data.phone) && 
                                   !(l.includes('location') && data.location);
                        }).map((contact, idx) => (
                            <span key={idx} style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                                <span style={{
                                    fontWeight: '700', 
                                    color: '#1F2937', 
                                    marginRight: '8px'
                                }}>
                                    {contact.label}:
                                </span>
                                {contact.value.replace(/^https?:\/\//, '')}
                            </span>
                        ))}
                </div>
            </header>

            {data.summary && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #D1D5DB', paddingBottom: '4px', marginBottom: '8px', color: '#111827' }}>
                        Professional Summary
                    </h2>
                    <p style={{ margin: 0, textAlign: 'justify', color: '#374151', lineHeight: '1.6' }}>{data.summary}</p>
                </section>
            )}

            {data.experience && data.experience.length > 0 && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #D1D5DB', paddingBottom: '4px', marginBottom: '8px', color: '#111827' }}>
                        Professional Experience
                    </h2>
                    {data.experience.map((exp, idx) => (
                        <div key={idx} style={{ marginBottom: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                                <h3 style={{ fontSize: '11pt', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                                    {exp.title}
                                </h3>
                                <span style={{ fontSize: '9.5pt', color: '#4B5563' }}>
                                    {exp.duration}
                                </span>
                            </div>
                            <p style={{
                                fontSize: '11pt',
                                fontWeight: '700',
                                color: '#111827',
                                margin: '0 0 8px 0',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {exp.company}
                                {exp.location && (
                                    <>
                                        <span style={{ margin: '0 8px', color: '#D1D5DB', fontWeight: '300' }}>|</span>
                                        <span style={{ fontSize: '10pt', color: '#666', fontStyle: 'italic', fontWeight: '400' }}>
                                            {exp.location}
                                        </span>
                                    </>
                                )}
                            </p>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '10pt', lineHeight: '1.5' }}>
                                {exp.bullets.map((bullet, bidx) => (
                                    <li key={bidx} style={{ marginBottom: '3px' }}>{bullet}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>
            )}

            {data.projects && data.projects.length > 0 && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #D1D5DB', paddingBottom: '4px', marginBottom: '8px', color: '#111827' }}>
                        Key Projects
                    </h2>
                    {data.projects.map((project, idx) => (
                        <div key={idx} style={{ marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '11.5pt', fontWeight: 'bold', color: '#111827', margin: '0 0 2px 0' }}>
                                {project.name}
                            </h3>
                            {project.tech && (
                                <p style={{ fontSize: '9pt', color: '#6B7280', margin: '0 0 6px 0' }}>
                                    {project.tech}
                                </p>
                            )}
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '10pt', lineHeight: '1.5' }}>
                                {project.description.split('\n').filter(d => d.trim()).map((desc, didx) => (
                                    <li key={didx} style={{ marginBottom: '3px' }}>{desc.replace(/^- /, '')}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>
            )}

            {data.skills && data.skills.length > 0 && (
                <>
                    {data.skills.map((skill, idx) => {
                        const [category, items] = skill.includes(':') ? skill.split(/:(.*)/s).map(s => s.trim()) : [null, skill];
                        return (
                            <section key={idx} style={{ marginBottom: '18px' }}>
                                <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #D1D5DB', paddingBottom: '4px', marginBottom: '8px', color: '#111827', textTransform: 'uppercase' }}>
                                    {category || 'Key Expertise'}
                                </h2>
                                <div style={{ color: '#4B5563', fontSize: '10.5pt', lineHeight: '1.5' }}>{items}</div>
                            </section>
                        );
                    })}
                </>
            )}

            {data.education && data.education.length > 0 && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #D1D5DB', paddingBottom: '4px', marginBottom: '8px', color: '#111827' }}>
                        Education
                    </h2>
                    {data.education.map((edu, idx) => (
                        <div key={idx} style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <h3 style={{ fontSize: '11pt', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                                    {edu.degree}{edu.details ? ` ${edu.details}` : ''}
                                </h3>
                                <span style={{ fontSize: '9.5pt', color: '#4B5563' }}>
                                    {edu.year}
                                </span>
                            </div>
                            <p style={{ fontSize: '10pt', color: '#374151', margin: '2px 0 0 0' }}>
                                {edu.institution}
                            </p>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
};
