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

interface ClassicTemplateProps {
    data: ResumeData;
}

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ data }) => {
    return (
        <div className="resume-template classic-template" style={{
            fontFamily: '"Times New Roman", Times, serif',
            maxWidth: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            padding: '20mm',
            backgroundColor: 'white',
            color: '#000',
            fontSize: '11pt',
            lineHeight: '1.4'
        }}>
            {/* Header */}
            <header style={{
                textAlign: 'center',
                borderBottom: '2px solid #000',
                paddingBottom: '12px',
                marginBottom: '18px'
            }}>
                <h1 style={{
                    fontSize: '24pt',
                    fontWeight: 'bold',
                    color: '#000',
                    margin: '0 0 8px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                }}>
                    {data.fullName}
                </h1>
                <div style={{
                    fontSize: '10pt',
                    color: '#333',
                    lineHeight: '1.6'
                }}>
                    {data.email && <div>{data.email}</div>}
                    {data.phone && <div>{data.phone}</div>}
                    {data.location && <div>{data.location}</div>}
                    {data.linkedin && <div>{data.linkedin}</div>}
                    {data.github && <div>{data.github}</div>}
                    {data.portfolio && <div>{data.portfolio}</div>}
                </div>
            </header>

            {/* Professional Summary */}
            {data.summary && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{
                        fontSize: '13pt',
                        fontWeight: 'bold',
                        color: '#000',
                        borderBottom: '1px solid #000',
                        paddingBottom: '3px',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Professional Summary
                    </h2>
                    <p style={{ margin: 0, textAlign: 'justify' }}>{data.summary}</p>
                </section>
            )}

            {/* Technical Skills */}
            {data.skills && data.skills.length > 0 && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{
                        fontSize: '13pt',
                        fontWeight: 'bold',
                        color: '#000',
                        borderBottom: '1px solid #000',
                        paddingBottom: '3px',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Technical Skills
                    </h2>
                    <p style={{ margin: 0 }}>
                        {data.skills.join(' • ')}
                    </p>
                </section>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{
                        fontSize: '13pt',
                        fontWeight: 'bold',
                        color: '#000',
                        borderBottom: '1px solid #000',
                        paddingBottom: '3px',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Projects
                    </h2>
                    {data.projects.map((project, idx) => (
                        <div key={idx} style={{ marginBottom: '12px' }}>
                            <h3 style={{
                                fontSize: '11pt',
                                fontWeight: 'bold',
                                color: '#000',
                                margin: '0 0 3px 0'
                            }}>
                                {project.name}
                            </h3>
                            {project.tech && (
                                <p style={{
                                    fontSize: '10pt',
                                    color: '#333',
                                    margin: '0 0 5px 0',
                                    fontStyle: 'italic'
                                }}>
                                    Tech Stack: {project.tech}
                                </p>
                            )}
                            <p style={{ margin: 0 }}>{project.description}</p>
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
                        color: '#000',
                        borderBottom: '1px solid #000',
                        paddingBottom: '3px',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Work Experience
                    </h2>
                    {data.experience.map((exp, idx) => (
                        <div key={idx} style={{ marginBottom: '12px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                marginBottom: '3px'
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
                                    color: '#333',
                                    fontStyle: 'italic'
                                }}>
                                    {exp.duration}
                                </span>
                            </div>
                            <p style={{
                                fontSize: '11pt',
                                fontWeight: '600',
                                margin: '0 0 6px 0'
                            }}>
                                {exp.company}
                            </p>
                            <ul style={{
                                margin: 0,
                                paddingLeft: '20px'
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
                        color: '#000',
                        borderBottom: '1px solid #000',
                        paddingBottom: '3px',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
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
                                    fontSize: '11pt',
                                    fontWeight: 'bold',
                                    color: '#000',
                                    margin: 0
                                }}>
                                    {edu.degree}
                                </h3>
                                <span style={{
                                    fontSize: '10pt',
                                    color: '#333',
                                    fontStyle: 'italic'
                                }}>
                                    {edu.year}
                                </span>
                            </div>
                            <p style={{
                                fontSize: '11pt',
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
