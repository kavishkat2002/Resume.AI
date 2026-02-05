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

interface ModernTemplateProps {
    data: ResumeData;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ data }) => {
    return (
        <div className="resume-template modern-template" style={{
            fontFamily: 'Arial, sans-serif',
            maxWidth: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            padding: '20mm',
            backgroundColor: 'white',
            color: '#333',
            fontSize: '11pt',
            lineHeight: '1.5'
        }}>
            {/* Header */}
            <header style={{
                borderBottom: '3px solid #2563eb',
                paddingBottom: '15px',
                marginBottom: '20px'
            }}>
                <h1 style={{
                    fontSize: '28pt',
                    fontWeight: 'bold',
                    color: '#1e40af',
                    margin: '0 0 8px 0',
                    letterSpacing: '0.5px'
                }}>
                    {data.fullName}
                </h1>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    fontSize: '10pt',
                    color: '#666'
                }}>
                    {data.email && <span>✉ {data.email}</span>}
                    {data.phone && <span>📱 {data.phone}</span>}
                    {data.location && <span>📍 {data.location}</span>}
                    {data.linkedin && <span>🔗 {data.linkedin}</span>}
                    {data.github && <span>💻 {data.github}</span>}
                    {data.portfolio && <span>🌐 {data.portfolio}</span>}
                </div>
            </header>

            {/* Professional Summary */}
            {data.summary && (
                <section style={{ marginBottom: '20px' }}>
                    <h2 style={{
                        fontSize: '14pt',
                        fontWeight: 'bold',
                        color: '#1e40af',
                        borderBottom: '2px solid #93c5fd',
                        paddingBottom: '5px',
                        marginBottom: '10px',
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
                <section style={{ marginBottom: '20px' }}>
                    <h2 style={{
                        fontSize: '14pt',
                        fontWeight: 'bold',
                        color: '#1e40af',
                        borderBottom: '2px solid #93c5fd',
                        paddingBottom: '5px',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Technical Skills
                    </h2>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        {data.skills.map((skill, idx) => (
                            <span key={idx} style={{
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                fontSize: '10pt',
                                fontWeight: '500'
                            }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
                <section style={{ marginBottom: '20px' }}>
                    <h2 style={{
                        fontSize: '14pt',
                        fontWeight: 'bold',
                        color: '#1e40af',
                        borderBottom: '2px solid #93c5fd',
                        paddingBottom: '5px',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Projects
                    </h2>
                    {data.projects.map((project, idx) => (
                        <div key={idx} style={{ marginBottom: '15px' }}>
                            <h3 style={{
                                fontSize: '12pt',
                                fontWeight: 'bold',
                                color: '#333',
                                margin: '0 0 4px 0'
                            }}>
                                {project.name}
                            </h3>
                            {project.tech && (
                                <p style={{
                                    fontSize: '9pt',
                                    color: '#666',
                                    margin: '0 0 6px 0',
                                    fontStyle: 'italic'
                                }}>
                                    <strong>Tech Stack:</strong> {project.tech}
                                </p>
                            )}
                            <p style={{ margin: 0 }}>{project.description}</p>
                        </div>
                    ))}
                </section>
            )}

            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
                <section style={{ marginBottom: '20px' }}>
                    <h2 style={{
                        fontSize: '14pt',
                        fontWeight: 'bold',
                        color: '#1e40af',
                        borderBottom: '2px solid #93c5fd',
                        paddingBottom: '5px',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Work Experience
                    </h2>
                    {data.experience.map((exp, idx) => (
                        <div key={idx} style={{ marginBottom: '15px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                marginBottom: '4px'
                            }}>
                                <h3 style={{
                                    fontSize: '12pt',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    margin: 0
                                }}>
                                    {exp.title}
                                </h3>
                                <span style={{
                                    fontSize: '10pt',
                                    color: '#666',
                                    fontStyle: 'italic'
                                }}>
                                    {exp.duration}
                                </span>
                            </div>
                            <p style={{
                                fontSize: '11pt',
                                color: '#1e40af',
                                fontWeight: '600',
                                margin: '0 0 8px 0'
                            }}>
                                {exp.company}
                            </p>
                            <ul style={{
                                margin: 0,
                                paddingLeft: '20px'
                            }}>
                                {exp.bullets.map((bullet, bidx) => (
                                    <li key={bidx} style={{ marginBottom: '4px' }}>{bullet}</li>
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
                        fontSize: '14pt',
                        fontWeight: 'bold',
                        color: '#1e40af',
                        borderBottom: '2px solid #93c5fd',
                        paddingBottom: '5px',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Education
                    </h2>
                    {data.education.map((edu, idx) => (
                        <div key={idx} style={{ marginBottom: '10px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline'
                            }}>
                                <h3 style={{
                                    fontSize: '12pt',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    margin: 0
                                }}>
                                    {edu.degree}
                                </h3>
                                <span style={{
                                    fontSize: '10pt',
                                    color: '#666',
                                    fontStyle: 'italic'
                                }}>
                                    {edu.year}
                                </span>
                            </div>
                            <p style={{
                                fontSize: '11pt',
                                color: '#666',
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
