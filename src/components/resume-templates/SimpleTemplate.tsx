import React from 'react';
import { MapPin, Phone, Mail, Linkedin, Github, Globe } from 'lucide-react';
import { ResumeData } from './index';

interface SimpleTemplateProps {
    data: ResumeData;
}

export const SimpleTemplate: React.FC<SimpleTemplateProps> = ({ data }) => {
    return (
        <div className="resume-template simple-template" style={{
            fontFamily: 'Helvetica, Arial, sans-serif',
            maxWidth: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            padding: '20mm',
            backgroundColor: 'white',
            color: '#2c3e50',
            fontSize: '11pt',
            lineHeight: '1.5'
        }}>
            {/* Header */}
            <header style={{
                marginBottom: '20px'
            }}>
                <h1 style={{
                    fontSize: '26pt',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    margin: '0 0 6px 0',
                    letterSpacing: '0.5px'
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
                    columnGap: '20px',
                    rowGap: '8px',
                    fontSize: '9.5pt',
                    color: '#4B5563',
                    marginTop: '10px',
                    justifyContent: 'flex-start'
                }}>
                    {[
                        data.location && <span style={{display: 'flex', alignItems: 'center'}}><MapPin size={14} style={{marginRight: '6px', color: '#666'}} /> {data.location}</span>,
                        data.phone && <span style={{display: 'flex', alignItems: 'center'}}><Phone size={14} style={{marginRight: '6px', color: '#666'}} /> {data.phone}</span>,
                        data.email && <span style={{display: 'flex', alignItems: 'center'}}><Mail size={14} style={{marginRight: '6px', color: '#666'}} /> {data.email}</span>,
                        data.linkedin && <span style={{display: 'flex', alignItems: 'center'}}><Linkedin size={14} style={{marginRight: '6px', color: '#666'}} /> {data.linkedin.replace('linkedin.com/in/', '').replace('https://', '')}</span>,
                        data.github && <span style={{display: 'flex', alignItems: 'center'}}><Github size={14} style={{marginRight: '6px', color: '#666'}} /> {data.github.replace('github.com/', '').replace('https://', '')}</span>,
                        data.portfolio && <span style={{display: 'flex', alignItems: 'center'}}><Globe size={14} style={{marginRight: '6px', color: '#666'}} /> {data.portfolio.replace('https://', '').replace('www.', '')}</span>,
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
                                <strong style={{ fontWeight: '700', color: '#111827', marginRight: '6px' }}>{c.label}:</strong>
                                {c.value.replace(/^https?:\/\//, '')}
                            </span>
                        )) : [])
                    ].filter(Boolean).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                            {item}
                        </div>
                    ))}
                </div>
            </header>

            {/* Professional Summary */}
            {data.summary && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{
                        fontSize: '13pt',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Summary
                    </h2>
                    <p style={{ margin: 0, color: '#34495e' }}>{data.summary}</p>
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
                                    fontSize: '13pt',
                                    fontWeight: 'bold',
                                    color: '#2c3e50',
                                    marginBottom: '6px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {category || 'Key Skills'}
                                </h2>
                                <div style={{ fontSize: '10.5pt', color: '#34495e' }}>{list}</div>
                            </section>
                        );
                    })}
                </>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{
                        fontSize: '13pt',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Projects
                    </h2>
                    {data.projects.map((project, idx) => (
                        <div key={idx} style={{ marginBottom: '12px' }}>
                            <h3 style={{
                                fontSize: '11.5pt',
                                fontWeight: 'bold',
                                color: '#2c3e50',
                                margin: '0 0 3px 0'
                            }}>
                                {project.name}
                            </h3>
                            {project.tech && (
                                <p style={{
                                    fontSize: '9.5pt',
                                    color: '#7f8c8d',
                                    margin: '0 0 5px 0'
                                }}>
                                    <strong>Technologies:</strong> {project.tech}
                                </p>
                            )}
                            <ul style={{ margin: 0, paddingLeft: '18px', color: '#34495e' }}>
                                {project.description.split('\n').filter((d: string) => d.trim()).map((desc: string, didx: number) => (
                                    <li key={didx} style={{ marginBottom: '3px' }}>
                                        {desc.replace(/^[•\-\*]\s*/, '')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>
            )}

            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{
                        fontSize: '13pt',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Experience
                    </h2>
                    {data.experience.map((exp, idx) => (
                        <div key={idx} style={{ marginBottom: '14px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                marginBottom: '3px'
                            }}>
                                <h3 style={{
                                    fontSize: '11.5pt',
                                    fontWeight: 'bold',
                                    color: '#2c3e50',
                                    margin: 0
                                }}>
                                    {exp.title}
                                </h3>
                                <span style={{
                                    fontSize: '10pt',
                                    color: '#7f8c8d'
                                }}>
                                    {exp.duration}
                                </span>
                            </div>
                            <p style={{
                                fontSize: '11pt',
                                fontWeight: '700',
                                color: '#333',
                                margin: '0 0 6px 0',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {exp.company}
                                {exp.location && (
                                    <>
                                        <span style={{ margin: '0 8px', color: '#ccc', fontWeight: '300' }}>|</span>
                                        <span style={{ fontSize: '10pt', color: '#666', fontStyle: 'italic', fontWeight: '400' }}>
                                            {exp.location}
                                        </span>
                                    </>
                                )}
                            </p>
                            <ul style={{
                                margin: 0,
                                paddingLeft: '18px',
                                color: '#34495e'
                            }}>
                                {exp.bullets.map((bullet, bidx) => (
                                    <li key={bidx} style={{ marginBottom: '3px' }}>{bullet}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
                <section>
                    <h2 style={{
                        fontSize: '13pt',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Education
                    </h2>
                    {data.education.map((edu, idx) => (
                        <div key={idx} style={{ marginBottom: '8px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline'
                            }}>
                                <h3 style={{
                                    fontSize: '11.5pt',
                                    fontWeight: 'bold',
                                    color: '#2c3e50',
                                    margin: 0
                                }}>
                                    {edu.degree}{edu.details ? ` ${edu.details}` : ''}
                                </h3>
                                <span style={{
                                    fontSize: '10pt',
                                    color: '#7f8c8d'
                                }}>
                                    {edu.year}
                                </span>
                            </div>
                            <p style={{
                                fontSize: '10.5pt',
                                color: '#7f8c8d',
                                margin: '2px 0 0 0'
                            }}>
                                {edu.institution}
                            </p>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
};
