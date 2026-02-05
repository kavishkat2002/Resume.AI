import React from 'react';

interface ResumeData {
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
                <div style={{
                    fontSize: '10pt',
                    color: '#7f8c8d',
                    lineHeight: '1.6'
                }}>
                    {[data.email, data.phone, data.location, data.linkedin, data.github, data.portfolio]
                        .filter(Boolean)
                        .join(' | ')}
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
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{
                        fontSize: '13pt',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Skills
                    </h2>
                    <p style={{ margin: 0, color: '#34495e' }}>
                        {data.skills.join(', ')}
                    </p>
                </section>
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
                            <p style={{ margin: 0, color: '#34495e' }}>{project.description}</p>
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
                                fontSize: '10.5pt',
                                color: '#7f8c8d',
                                margin: '0 0 6px 0'
                            }}>
                                {exp.company}
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
                                    {edu.degree}
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
