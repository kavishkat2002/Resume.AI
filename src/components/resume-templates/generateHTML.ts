import { ResumeData } from './index';

export const generateATSHTML = (data: ResumeData, template: 'classic' | 'executive' | 'professional' | 'elegant' | 'techblue'): string => {
  const styles = getTemplateStyles(template, data.accentColor);

  const layoutStyle = data.layout ? `
    :root {
      --scale-factor: ${data.layout.fontSize / 100};
      --line-height-factor: ${data.layout.lineHeight / 100};
      --section-spacing: ${data.layout.sectionSpacing / 100};
      --accent-color: ${data.accentColor || '#7c3aed'};
      --one-page-multiplier: ${data.pageStrategy === 'one_page' ? '0.85' : '1'};
    }
    html {
      font-size: calc(16px * var(--scale-factor)) !important;
    }
    body {
      font-size: calc(11pt * var(--scale-factor));
    }
    .name {
      font-size: calc(32pt * var(--scale-factor));
      line-height: 1.1;
      margin-bottom: 4px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .job-title {
      font-size: calc(16pt * var(--scale-factor));
      margin-top: 4px;
      margin-bottom: 8px;
    }
    .section-title {
      font-size: calc(14pt * var(--scale-factor));
    }
    .exp-title, .project-title, .edu-degree {
      font-size: calc(12pt * var(--scale-factor));
    }
    .summary, .skill-row, .exp-company, .edu-institution, .edu-year {
      font-size: calc(11pt * var(--scale-factor));
    }
    .exp-duration, .exp-bullets, .tech-stack, .project-description {
      font-size: calc(10.5pt * var(--scale-factor));
    }
    .contact-info, .contact-links {
      font-size: calc(10pt * var(--scale-factor));
    }

    body, .summary, .skill-row, .exp-bullets, .project-description {
      line-height: calc(1.5 * var(--line-height-factor) * var(--one-page-multiplier)) !important;
    }
    .section {
      margin-bottom: calc(24px * var(--section-spacing) * var(--one-page-multiplier)) !important;
    }
    .resume-container {
      width: 210mm;
      max-width: 100%;
      margin: 0 auto;
      padding: ${data.pageStrategy === 'one_page' ? '5mm 15mm' : '5mm 20mm'};
      background: white;
      word-wrap: break-word;
      min-height: 297mm;
      box-sizing: border-box;
      ${data.pageStrategy === 'one_page' ? 'height: 297mm; overflow: hidden; position: relative;' : ''}
    }
    @media print {
      body { background: white; margin: 0; padding: 0; }
      @page { size: A4; margin: 0; }
      ${data.pageStrategy === 'one_page' ? `
        html, body { height: 297mm; overflow: hidden; }
        .resume-container { height: 297mm !important; margin: 0 auto !important; }
      ` : ''}
    }
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.fullName} - Resume</title>
  <style>
    ${styles}
    ${layoutStyle}
    .print-header-spacer { height: 8mm; }
    .print-footer-spacer { height: 8mm; }
  </style>
</head>
<body>
  ${data.pageStrategy === 'one_page' ? `
    <div class="resume-container">
  ` : `
  <table class="print-wrapper" style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr><td><div class="print-header-spacer"></div></td></tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="resume-container">
  `}
    <!-- Header -->
    <header class="header">
      <h1 class="name">${data.fullName}</h1>
      ${data.jobTitle ? `<p class="job-title">${data.jobTitle}</p>` : ''}
      <div class="contact-section" style="display: grid; grid-template-columns: repeat(2, minmax(0, auto)); column-gap: 30px; row-gap: 8px; margin-top: 15px; justify-content: flex-start; text-align: left;">
        ${[
          data.email ? `<span style="display: flex; align-items: center; gap: 8px; white-space: nowrap; font-size: 10pt; color: #4B5563;">
            <svg style="width:14px; height:14px; color:#4B5563" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            ${data.email}
          </span>` : '',
          data.phone ? `<span style="display: flex; align-items: center; gap: 8px; white-space: nowrap; font-size: 10pt; color: #4B5563;">
            <svg style="width:14px; height:14px; color:#4B5563" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            ${data.phone}
          </span>` : '',
          data.location ? `<span style="display: flex; align-items: center; gap: 8px; white-space: nowrap; font-size: 10pt; color: #4B5563;">
            <svg style="width:14px; height:14px; color:#4B5563" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${data.location}
          </span>` : '',
          data.linkedin ? `<span style="display: flex; align-items: center; gap: 8px; white-space: nowrap; font-size: 10pt; color: #4B5563;">
            <svg style="width:14px; height:14px; color:#4B5563" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
            ${data.linkedin.replace('linkedin.com/in/', '').replace('https://', '')}
          </span>` : '',
          data.portfolio ? `<span style="display: flex; align-items: center; gap: 8px; white-space: nowrap; font-size: 10pt; color: #4B5563;">
            <svg style="width:14px; height:14px; color:#4B5563" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            ${data.portfolio.replace('https://', '').replace('www.', '')}
          </span>` : '',
          data.github ? `<span style="display: flex; align-items: center; gap: 8px; white-space: nowrap; font-size: 10pt; color: #4B5563;">
            <svg style="width:14px; height:14px; color:#4B5563" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            ${data.github.replace('github.com/', '').replace('https://', '')}
          </span>` : '',
          ...(data.customContacts?.map(c => {
             const label = c.label.toLowerCase();
             if (label.includes('linkedin') && data.linkedin) return ''; 
             if (label.includes('github') && data.github) return '';
             if ((label.includes('portfolio') || label.includes('website')) && data.portfolio) return '';
             if (label.includes('email') && data.email) return '';
             if (label.includes('phone') && data.phone) return '';
             if (label.includes('location') && data.location) return '';

             return `<span style="display: flex; align-items: center; gap: 8px; white-space: nowrap; font-size: 10pt;">
                <span style="font-weight: 700; color: #111827;">${c.label}:</span>
                <span style="color: #4B5563;">${c.value.replace(/^https?:\/\//, '')}</span>
             </span>`;
          }) || [])
        ].filter(Boolean).join('')}
      </div>
    </header>

    ${data.summary ? `
    <!-- Professional Summary -->
    <section class="section" style="break-inside: avoid; page-break-inside: avoid;">
      <h2 class="section-title">PROFESSIONAL SUMMARY</h2>
      <div class="section-content summary">
        <p>${data.summary}</p>
      </div>
    </section>
    ` : ''}

    ${data.skills && data.skills.length > 0 ? `
    <!-- Categorised Skills -->
    ${data.skills.map(skill => {
      const [category, items] = skill.includes(':') ? skill.split(/:(.*)/s).map(s => s.trim()) : [null, skill];
      return `
      <section class="section" style="break-inside: avoid; page-break-inside: avoid;">
        <h2 class="section-title">${(category || 'Technical Expertise').toUpperCase()}</h2>
        <div class="section-content">
          <p class="skill-row">${items}</p>
        </div>
      </section>
      `;
    }).join('')}
    ` : ''}

    ${data.additionalSkills && data.additionalSkills.length > 0 ? `
    <!-- Additional Skills -->
    ${data.additionalSkills.map(skill => {
      const [category, items] = skill.includes(':') ? skill.split(/:(.*)/s).map(s => s.trim()) : [null, skill];
      return `
      <section class="section" style="break-inside: avoid; page-break-inside: avoid;">
        <h2 class="section-title">${(category || 'Additional Skills').toUpperCase()}</h2>
        <div class="section-content">
          <p class="skill-row">${items}</p>
        </div>
      </section>
      `;
    }).join('')}
    ` : ''}

    ${data.experience && data.experience.length > 0 ? `
    <!-- Work Experience -->
    <section class="section">
      <h2 class="section-title">PROFESSIONAL EXPERIENCE</h2>
      <div class="section-content">
        ${data.experience.map(exp => `
          <div class="experience-item">
            <div class="exp-title-row">
              <h3 class="exp-title">${exp.title}</h3>
              <span class="exp-duration">${exp.duration}</span>
            </div>
            <p class="exp-company-location">
              <span class="exp-company">${exp.company}</span>
              ${exp.location ? `<span class="exp-location-divider"> | </span><span class="exp-location">${exp.location}</span>` : ''}
            </p>
            <ul class="exp-bullets">
              ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${data.projects && data.projects.length > 0 ? `
    <!-- Projects -->
    <section class="section">
      <h2 class="section-title">KEY PROJECTS</h2>
      <div class="section-content">
        ${data.projects.map(project => `
          <div class="project-item">
            <div class="exp-title-row">
              <h3 class="project-title">${project.name}</h3>
              ${project.dates ? `<span class="exp-duration">${project.dates}</span>` : ''}
            </div>
            ${project.tech ? `<p class="tech-stack" style="margin-top: -2px; margin-bottom: 4px;"><strong>Technologies:</strong> ${project.tech}</p>` : ''}
            <ul class="exp-bullets">
              ${project.description.split('\n').filter((d: string) => d.trim()).map((desc: string) => `<li>${desc.replace(/^[•\-\*]\s*/, '')}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${data.education && data.education.length > 0 ? `
    <!-- Education -->
    <section class="section">
      <h2 class="section-title">EDUCATION</h2>
      <div class="section-content">
        ${data.education.map(edu => `
          <div class="education-item">
            <div class="edu-row">
              <span class="edu-degree">${edu.degree}${edu.details ? ` ${edu.details}` : ''}</span>
              <span class="edu-year">${edu.year}</span>
            </div>
            <p class="edu-institution">${edu.institution}</p>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${data.certifications && data.certifications.length > 0 ? `
    <!-- Certifications -->
    <section class="section">
      <h2 class="section-title">CERTIFICATIONS</h2>
      <div class="section-content">
        ${data.certifications.map(cert => `
          <div class="education-item">
            <div class="edu-row">
              <span class="edu-degree">${cert.name}</span>
              <span class="edu-year">${cert.date}</span>
            </div>
            <p class="edu-institution">${cert.issuer}</p>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${data.achievements ? `
    <!-- Achievements -->
    <section class="section" style="break-inside: avoid; page-break-inside: avoid;">
      <h2 class="section-title">ACHIEVEMENTS</h2>
      <div class="section-content">
        <ul class="exp-bullets">
          ${data.achievements.split('\n').filter(a => a.trim()).map(a => `<li>${a.trim().replace(/^[•*-]\s*/, '')}</li>`).join('')}
        </ul>
      </div>
    </section>
    ` : ''}

    ${data.publications && data.publications.length > 0 ? `
    <!-- Publications -->
    <section class="section">
      <h2 class="section-title">PUBLICATIONS</h2>
      <div class="section-content">
        ${data.publications.map(pub => `
          <div class="education-item">
            <div class="edu-row">
              <span class="edu-degree">${pub.title}</span>
              <span class="edu-year">${pub.date}</span>
            </div>
            <p class="edu-institution">${pub.publisher}</p>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${data.additionalInfo && data.additionalInfo.trim() ? `
    <!-- Additional Information -->
    <section class="section" style="break-inside: avoid; page-break-inside: avoid;">
      <h2 class="section-title">ADDITIONAL INFORMATION</h2>
      <div class="section-content">
        <p style="white-space: pre-wrap;">${data.additionalInfo}</p>
      </div>
    </section>
    ` : ''}

    ${data.references && data.references.length > 0 ? `
    <!-- References -->
    <section class="section">
      <h2 class="section-title">REFERENCES</h2>
      <div class="section-content">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${data.references.map(ref => `
            <div style="padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;break-inside:avoid;page-break-inside:avoid;">
              <p style="font-weight:bold;font-size:11pt;color:#1e293b;margin:0 0 2px 0;">${ref.name}</p>
              <p style="font-size:10pt;color:#475569;font-style:italic;margin:0 0 4px 0;">${ref.role}</p>
              ${ref.organization ? `<p style="font-size:10pt;color:#64748b;margin:0 0 2px 0;">${ref.organization}</p>` : ''}
              ${ref.phone ? `<p style="font-size:10pt;color:#64748b;margin:0 0 2px 0;">${ref.phone}</p>` : ''}
              ${ref.email ? `<p style="font-size:10pt;color:#64748b;margin:0;">${ref.email}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}
  ${data.pageStrategy === 'one_page' ? `
    </div>
  ` : `
          </div>
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr><td><div class="print-footer-spacer"></div></td></tr>
    </tfoot>
  </table>
  `}
</body>
</html>
  `.trim();
};

const getTemplateStyles = (template: 'classic' | 'executive' | 'professional' | 'elegant' | 'techblue', accentColor?: string): string => {
  const baseStyles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      background: white;
      color: #2c3e50;
      line-height: 1.7;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .resume-container {
      width: 210mm;
      max-width: 100%;
      min-height: 297mm;
      margin: 0 auto;
      /* Only horizontal padding here; vertical spacing handled by @page margin */
      padding: 0 20mm;
      background: white;
      word-wrap: break-word;
    }
    
    .section {
      margin-bottom: 28px;
      /* Sections can flow across pages */
    }

    .section-title {
      font-size: 13pt;
      font-weight: 700;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      color: #1a252f;
      break-after: avoid;
      page-break-after: avoid;
    }
    
    .section-content {
      padding-left: 0;
    }
    
    .job-title {
      font-size: 16pt;
      font-weight: 500;
      color: ${accentColor || '#34495e'};
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .summary {
      font-size: 11pt;
      line-height: 1.7;
      text-align: justify;
      color: #34495e;
    }
    
    .skills-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 30px;
      row-gap: 12px;
    }

    .skill-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .skill-category {
      font-size: 11pt;
      font-weight: 700;
      color: #1a252f;
      text-transform: none;
    }

    .skill-values {
      font-size: 10.5pt;
      color: #4b5563;
      line-height: 1.4;
      margin: 0;
    }
    
    .skill-row {
      font-size: 11pt;
      line-height: 1.6;
      color: #2c3e50;
      margin: 0;
    }
    
    .skill-row strong {
      color: #1a252f;
    }
    
    
    .experience-item, .project-item, .education-item {
      margin-bottom: 16px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    .exp-title-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }
    
    .edu-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }
    
    .exp-title-company {
      flex: 1;
    }
    
    .exp-title, .project-title {
      font-size: 12pt;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .edu-degree {
      font-size: 12pt;
      font-weight: 700;
      color: #1a252f;
    }
    
    .exp-company-location {
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .exp-company {
      font-size: 11pt;
      font-weight: 700;
      color: #333;
    }
    
    .exp-location-divider {
      color: #94a3b8;
      font-weight: 300;
    }
    
    .exp-location {
      font-size: 10.5pt;
      color: #71717a;
      font-style: italic;
    }
    
    .edu-institution {
      font-size: 11pt;
      font-weight: 500;
      color: #4a5568;
      margin: 0 0 12px 0;
      font-style: italic;
    }

    .edu-details {
      font-size: 10pt;
      color: #6b7280;
      font-style: italic;
      margin: 2px 0 12px 0;
    }
    
    .exp-duration {
      font-size: 10.5pt;
      font-weight: 500;
      color: #71717a;
      white-space: nowrap;
      text-align: right;
      margin-left: 20px;
    }
    
    .edu-year {
      font-size: 11pt;
      font-weight: 600;
      color: #2c3e50;
      white-space: nowrap;
    }
    
    .exp-bullets {
      margin-left: 20px;
      font-size: 10.5pt;
      line-height: 1.6;
    }
    
    .exp-bullets li {
      margin-bottom: 6px;
    }
    
    .tech-stack {
      font-size: 10pt;
      margin-bottom: 6px;
      font-style: italic;
    }
    
    .project-description {
      font-size: 10.5pt;
      line-height: 1.6;
    }
    
    @page {
      size: A4;
      /* Vertical margin for every page; handles the top/bottom spacing consistently */
      margin: 15mm 0;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .resume-container {
        padding: 0 20mm;
        min-height: unset;
        width: 100%;
      }
      .section {
        break-inside: auto;
        page-break-inside: auto;
      }
      .experience-item,
      .project-item,
      .education-item {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .section-title {
        break-after: avoid;
        page-break-after: avoid;
      }
      p, li {
        orphans: 3;
        widows: 3;
      }
    }
  `;

  if (template === 'classic') {
    return baseStyles + `
      body {
        font-family: 'Georgia', 'Times New Roman', serif;
      }
      
      .header { text-align: left; margin-bottom: 28px; border-bottom: 2px solid ${accentColor || '#3b82f6'}; padding-bottom: 22px; }
      .name { font-size: 30pt; font-weight: 800; color: #111827; margin: 0 0 6px 0; text-transform: none; letter-spacing: 0.5px; }
      .job-title { font-size: 14pt; font-weight: 700; color: ${accentColor || '#b45309'}; margin: 5px 0 18px 0; text-transform: uppercase; letter-spacing: 2px; }
      
      .contact-info, .contact-links {
        font-size: 11pt;
        color: #34495e;
        margin: 5px 0;
      }
      
      .section-title {
        color: #1a252f;
        border-bottom: 1px solid #d1d5db;
        padding-bottom: 6px;
        margin-bottom: 16px;
        font-size: 13pt;
        letter-spacing: 1.5px;
      }
      
      .skill-tag {
        background: #ecf0f1;
        color: #2c3e50;
        border: 1px solid #bdc3c7;
      }
      
      .exp-title, .project-title, .edu-degree {
        color: #1a252f;
      }
      
      .exp-company, .edu-institution {
        color: #34495e;
        font-style: italic;
      }
      
      .exp-duration, .edu-year {
        color: #7f8c8d;
      }
      
      .exp-company {
        color: #34495e;
        font-style: italic;
        font-weight: 700;
      }
      
      .exp-location {
        color: #7f8c8d;
      }
    `;
  } else if (template === 'executive') {
    return baseStyles + `
      body {
        font-family: 'Garamond', 'Georgia', serif;
        color: #1a1a1a;
      }
      
      .header {
        border-left: 5px solid ${accentColor || '#c9a961'};
        padding-left: 25px;
        margin-bottom: 30px;
      }
      
      .name {
        font-size: 34pt;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
        word-break: break-word;
      }
      
      .contact-info, .contact-links {
        font-size: 10.5pt;
        color: #4a4a4a;
        margin: 4px 0;
      }
      
      .section-title {
        color: #c9a961;
        border-bottom: 2px solid #c9a961;
        padding-bottom: 6px;
        font-size: 13pt;
      }
      
      .skill-tag {
        background: #faf8f3;
        color: #8b7355;
        border: 1px solid #d4c5b0;
      }
      
      .exp-title, .project-title {
        color: #1a1a1a;
        font-size: 12.5pt;
      }
      
      .exp-company {
        color: #c9a961;
        font-weight: 700;
      }
      
      .exp-duration, .edu-year {
        color: #6a6a6a;
      }
      
      .exp-company {
        color: #c9a961;
        font-weight: 700;
      }
      
      .exp-location {
        color: #8b7355;
      }
      
      .summary {
        font-size: 11.5pt;
        font-style: italic;
      }
    `;
  } else if (template === 'elegant') {
    return baseStyles + `
      body {
        font-family: 'Helvetica', 'Arial', sans-serif;
        color: #1a1a1a;
      }
      
      .header {
        text-align: left;
        margin-bottom: 25px;
      }
      
      .name {
        font-size: 24pt;
        font-weight: 800;
        color: #000;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .contact-info, .contact-links {
        font-size: 10pt;
        color: #333;
        margin: 4px 0;
      }
      
      .section-title {
        color: #000;
        border: none;
        padding-bottom: 0;
        margin-bottom: 10px;
        font-size: 12.5pt;
        font-weight: 700;
        text-transform: uppercase;
      }
      
      .section {
        margin-bottom: 22px;
      }

      .exp-duration {
        color: #000;
        font-weight: 600;
      }
      
      .exp-company {
        font-weight: 800;
        color: #000;
        font-size: 11pt;
      }
      
      .exp-location {
        color: #666;
        font-style: italic;
      }

      .edu-row {
        display: block;
        font-weight: 700;
        font-size: 11pt;
      }

      .edu-degree {
        display: inline;
        font-size: 11pt;
      }

      .edu-institution::before {
        content: " | ";
        font-weight: normal;
        color: #ccc;
      }

      .edu-institution {
        display: inline;
        font-size: 11pt;
        font-style: normal;
        color: #000;
        margin: 0;
      }

      .edu-year::before {
        content: " | ";
        font-weight: normal;
        color: #ccc;
      }

      .edu-year {
        display: inline;
        font-size: 11pt;
        font-weight: 700;
      }
    `;
  } else if (template === 'professional') { // professional
    return baseStyles + `
      body {
        font-family: 'Calibri', 'Arial', sans-serif;
      }
      
      .header {
        background: white;
        color: #1a252f;
        padding: 0;
        margin-bottom: 25px;
        text-align: left;
      }
      
      .name {
        font-size: 32pt;
        font-weight: 800;
        color: #1a252f;
        margin-bottom: 4px;
        letter-spacing: -0.5px;
      }

      .job-title {
        color: var(--accent-color);
        font-size: 16pt;
        font-weight: 700;
        margin-bottom: 12px;
        letter-spacing: 1px;
      }
      
      .contact-info, .contact-links {
        font-size: 10pt;
        margin: 4px 0;
        color: #4b5563;
      }
      
      .section-title {
        color: #1a252f;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 4px;
        margin-top: 24px;
      }
      
      .skill-tag {
        background: #f8fafc;
        color: #334155;
        border: 1px solid #e2e8f0;
      }
      
      .exp-title, .project-title {
        color: #2c3e50;
      }
      
      .exp-company {
        color: #3498db;
        font-weight: 600;
      }
      
      .exp-duration, .edu-year {
        color: #7f8c8d;
      }
    `;
  } else if (template === 'techblue') {
    return baseStyles + `
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #333;
      }
      
      .header {
        border-bottom: 4px solid ${accentColor || '#1E40AF'};
        padding-bottom: 12px;
        margin-bottom: 20px;
        text-align: left;
      }
      
      .name {
        font-size: 28pt;
        font-weight: 700;
        color: #111827;
        margin-bottom: 5px;
        letter-spacing: -0.5px;
      }
      
      .contact-info, .contact-links {
        font-size: 9.5pt;
        color: #4B5563;
        margin: 4px 0;
      }
      
      .section-title {
        color: #111827;
        border-bottom: 1px solid #D1D5DB;
        padding-bottom: 4px;
        font-size: 12pt;
        font-weight: 700;
      }
      
      .exp-title-company {
        display: inline;
      }
      
      .exp-title, .project-title {
        font-size: 11pt;
        color: #111827;
        font-weight: 700;
      }
      
      .exp-company {
        font-size: 10.5pt;
        color: #374151;
        font-weight: 500;
      }
      
      .exp-duration, .edu-year {
        color: #4B5563;
        font-size: 9.5pt;
      }
      
      .edu-degree {
        font-size: 11pt;
        color: #111827;
        font-weight: 700;
      }
      
      .edu-institution {
        font-size: 10pt;
        color: #374151;
      }
    `;
  }
  
  return baseStyles;
};


