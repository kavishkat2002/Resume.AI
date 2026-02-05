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
                textAlign: 'center',
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
                <div style={{
                    fontSize: '9.5pt',
                    color: '#333',
                    marginBottom: '10px'
                }}>
                    {[
                        data.location,
                        data.phone,
                        data.email,
                        data.linkedin,
                        data.github,
                        data.portfolio
                    ].filter(Boolean).map((info, idx, arr) => (
                        <React.Fragment key={idx}>
                            <span>{info}</span>
                            {idx < arr.length - 1 && <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>}
                        </React.Fragment>
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
                <section style={{ marginBottom: '18px' }}>
                    <h2 style={{
                        fontSize: '12pt',
                        fontWeight: 'bold',
                        color: '#000',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Technical Skills
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {/* We group by category if possible, but for a simple list: */}
                        <p style={{ margin: 0 }}>
                            {data.skills.join(', ')}
                        </p>
                    </div>
                </section>
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
                                fontWeight: 'bold',
                                fontSize: '11pt',
                                marginBottom: '4px'
                            }}>
                                {exp.title} | {exp.company} | {exp.duration}
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
                            <p style={{ margin: 0 }}>{project.description}</p>
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
                        <div key={idx} style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                            {edu.degree} | {edu.institution} | {edu.year}
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
};
