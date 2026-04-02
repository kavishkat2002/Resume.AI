import React from 'react';

import { ResumeData } from './index';

interface ElegantTemplateProps {
    data: ResumeData;
}

export const ElegantTemplate: React.FC<ElegantTemplateProps> = ({ data }) => {
    return (
        <div className="resume-template elegant-template" style={{
            fontFamily: '"Inter", "Segoe UI", "Helvetica", "Arial", sans-serif',
            maxWidth: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            padding: '1.5cm 2cm',
            backgroundColor: 'white',
            color: '#1a1a1a',
            fontSize: '10.5pt',
            lineHeight: '1.4'
        }}>
            {/* Header */}
            <header style={{
                textAlign: 'left',
                marginBottom: '20px'
            }}>
                <h1 style={{
                    fontSize: '22pt',
                    fontWeight: '800',
                    color: '#000',
                    margin: '0 0 10px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    {data.fullName}
                </h1>
                {data.jobTitle && (
                    <div style={{
                        fontSize: '14pt',
                        fontWeight: '600',
                        color: data.accentColor || '#333',
                        marginBottom: '8px',
                        textTransform: 'uppercase'
                    }}>
                        {data.jobTitle}
                    </div>
                )}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, auto)',
                    columnGap: '40px',
                    rowGap: '8px',
                    fontSize: '9.5pt',
                    color: '#333',
                    marginTop: '15px',
                    justifyContent: 'flex-start'
                }}>
                    {[
                        data.location && <span>{data.location}</span>,
                        data.phone && <span>{data.phone}</span>,
                        data.email && <span>{data.email}</span>,
                        data.linkedin && <span>{data.linkedin.replace('linkedin.com/in/', '').replace('https://', '')}</span>,
                        data.github && <span>{data.github.replace('github.com/', '').replace('https://', '')}</span>,
                        data.portfolio && <span>{data.portfolio.replace('https://', '').replace('www.', '')}</span>,
                        ...(data.customContacts ? data.customContacts.filter(c => {
                             const l = c.label.toLowerCase();
                             if (l.includes('linkedin') && data.linkedin) return false;
                             if (l.includes('github') && data.github) return false;
                             if ((l.includes('portfolio') || l.includes('website')) && data.portfolio) return false;
                             if (l.includes('email') && data.email) return false;
                             if (l.includes('phone') && data.phone) return false;
                             if (l.includes('location') && data.location) return false;
                             return true;
                        }).map((c, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                <strong style={{ fontWeight: '700', color: '#000', marginRight: '8px' }}>{c.label}:</strong>
                                {c.value.replace(/^https?:\/\//, '')}
                            </span>
                        )) : [])
                    ].filter(Boolean).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: idx % 2 === 0 ? 'flex-start' : 'flex-start' }}>
                            {item}
                        </div>
                    ))}
                </div>
            </header>

            {/* Professional Summary */}
            {data.summary && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{
                        fontSize: '12pt',
                        fontWeight: 'bold',
                        color: '#000',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Professional Summary
                    </h2>
                    <p style={{
                        margin: 0,
                        textAlign: 'justify',
                        color: '#1a1a1a',
                        fontSize: '10.5pt'
                    }}>
                        {data.summary}
                    </p>
                </section>
            )}

            {/* Technical Skills */}
            {data.skills && data.skills.length > 0 && (
                <>
                    {data.skills.map((skill, idx) => {
                        const [category, list] = skill.includes(':') ? skill.split(/:(.*)/s) : [null, skill];
                        return (
                            <section key={idx} style={{ marginBottom: '16px' }}>
                                <h2 style={{
                                    fontSize: '12pt',
                                    fontWeight: 'bold',
                                    color: '#000',
                                    marginBottom: '6px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {category || 'Competencies'}
                                </h2>
                                <div style={{ fontSize: '10.5pt', color: '#333' }}>{list}</div>
                            </section>
                        );
                    })}
                </>
            )}

            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{
                        fontSize: '12pt',
                        fontWeight: 'bold',
                        color: '#000',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Professional Experience
                    </h2>
                    {data.experience.map((exp, idx) => (
                        <div key={idx} style={{ marginBottom: '12px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                marginBottom: '2px'
                            }}>
                                <h3 style={{
                                    fontSize: '11pt',
                                    fontWeight: 'bold',
                                    color: '#000',
                                    margin: 0
                                }}>
                                    {exp.title}
                                </h3>
                                <span style={{
                                    fontSize: '10pt',
                                    color: '#555',
                                    fontStyle: 'italic'
                                }}>
                                    {exp.duration}
                                </span>
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '10.5pt', marginBottom: '6px', display: 'flex', alignItems: 'center' }}>
                                {exp.company}
                                {exp.location && (
                                    <>
                                        <span style={{ margin: '0 8px', color: '#ccc', fontWeight: '300' }}>|</span>
                                        <span style={{ fontSize: '10pt', color: '#666', fontStyle: 'italic', fontWeight: '400' }}>
                                            {exp.location}
                                        </span>
                                    </>
                                )}
                            </div>
                            <ul style={{
                                margin: 0,
                                paddingLeft: '18px',
                                listStyleType: 'disc'
                            }}>
                                {exp.bullets.map((bullet, bidx) => (
                                    <li key={bidx} style={{ marginBottom: '2px' }}>{bullet}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{
                        fontSize: '12pt',
                        fontWeight: 'bold',
                        color: '#000',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Key Projects
                    </h2>
                    {data.projects.map((project, idx) => (
                        <div key={idx} style={{ marginBottom: '10px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                                {project.name} {project.tech && <span style={{ fontWeight: 'normal', fontStyle: 'italic', fontSize: '9.5pt', color: '#666' }}>({project.tech})</span>}
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '18px' }}>
                                {project.description.split('\n').filter((d: string) => d.trim()).map((desc: string, didx: number) => (
                                    <li key={didx} style={{ marginBottom: '2px' }}>
                                        {desc.replace(/^[•\-\*]\s*/, '')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{
                        fontSize: '12pt',
                        fontWeight: 'bold',
                        color: '#000',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Education
                    </h2>
                    {data.education.map((edu, idx) => (
                        <div key={idx} style={{ marginBottom: '6px' }}>
                            <div style={{ fontWeight: 'bold' }}>
                                {edu.degree}{edu.details ? ` ${edu.details}` : ''} | {edu.year}
                            </div>
                            <div style={{ fontSize: '10.5pt', color: '#555', marginTop: '1px' }}>
                                {edu.institution}
                            </div>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
};
