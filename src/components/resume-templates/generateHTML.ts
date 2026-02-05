import { ResumeData } from './index';

export const generateATSHTML = (data: ResumeData, template: 'modern' | 'classic' | 'executive' | 'minimalist' | 'professional' | 'elegant'): string => {
  const styles = getTemplateStyles(template);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.fullName} - Resume</title>
  <style>
    ${styles}
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header -->
    <header class="header">
      <h1 class="name">${data.fullName}</h1>
      <div class="contact-info">
        ${[
      data.email,
      data.phone,
      data.location
    ].filter(Boolean).join(' | ')}
      </div>
      ${(data.linkedin || data.github || data.portfolio) ? `
      <div class="contact-links">
        ${[data.linkedin, data.github, data.portfolio].filter(Boolean).join(' | ')}
      </div>
      ` : ''}
    </header>

    ${data.summary ? `
    <!-- Professional Summary -->
    <section class="section">
      <h2 class="section-title">PROFESSIONAL SUMMARY</h2>
      <div class="section-content">
        <p class="summary">${data.summary}</p>
      </div>
    </section>
    ` : ''}

    ${data.skills && data.skills.length > 0 ? `
    <!-- Technical Skills -->
    <section class="section">
      <h2 class="section-title">TECHNICAL SKILLS</h2>
      <div class="section-content">
        <div class="skills-container">
          ${data.skills.map(skill => {
      if (skill.includes(':')) {
        const [category, items] = skill.split(':').map(s => s.trim());
        return `<p class="skill-row"><strong>${category}:</strong> ${items}</p>`;
      }
      return `<p class="skill-row">${skill}</p>`;
    }).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    ${data.experience && data.experience.length > 0 ? `
    <!-- Work Experience -->
    <section class="section">
      <h2 class="section-title">PROFESSIONAL EXPERIENCE</h2>
      <div class="section-content">
        ${data.experience.map(exp => `
          <div class="experience-item">
            <div class="exp-header">
              <div class="exp-title-company">
                <h3 class="exp-title">${exp.title}</h3>
                <p class="exp-company">${exp.company}</p>
              </div>
              <span class="exp-duration">${exp.duration}</span>
            </div>
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
            <h3 class="project-title">${project.name}</h3>
            ${project.tech ? `<p class="tech-stack"><strong>Technologies:</strong> ${project.tech}</p>` : ''}
            <p class="project-description">${project.description}</p>
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
              <span class="edu-degree">${edu.degree}</span>
              <span class="edu-year">${edu.year}</span>
            </div>
            <p class="edu-institution">${edu.institution}</p>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}
  </div>
</body>
</html>
  `.trim();
};

const getTemplateStyles = (template: 'modern' | 'classic' | 'executive' | 'minimalist' | 'professional' | 'elegant'): string => {
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
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .resume-container {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 15mm 20mm;
      background: white;
    }
    
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: 700;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .section-content {
      padding-left: 0;
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
      page-break-inside: avoid;
    }
    
    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
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
    
    .exp-company {
      font-size: 11pt;
      font-weight: 600;
      margin-bottom: 6px;
    }
    
    .edu-institution {
      font-size: 11pt;
      font-weight: 500;
      color: #4a5568;
      margin: 0 0 12px 0;
      font-style: italic;
    }
    
    .exp-duration {
      font-size: 10pt;
      font-style: italic;
      white-space: nowrap;
      margin-left: 15px;
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
    
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .resume-container {
        padding: 12mm 15mm;
      }
      .section {
        page-break-inside: avoid;
      }
    }
  `;

  if (template === 'modern') {
    return baseStyles + `
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 25px 30px;
        margin: -15mm -20mm 25px -20mm;
        text-align: center;
      }
      
      .name {
        font-size: 32pt;
        font-weight: 700;
        margin-bottom: 8px;
        letter-spacing: 1px;
      }
      
      .contact-info, .contact-links {
        font-size: 10pt;
        margin: 5px 0;
        opacity: 0.95;
      }
      
      .contact-links span {
        margin: 0 10px;
      }
      
      .section-title {
        color: #667eea;
        border-bottom: 3px solid #667eea;
        padding-bottom: 6px;
      }
      
      .skill-tag {
        background: #f0f4ff;
        color: #667eea;
        border: 1px solid #d0d9ff;
      }
      
      .exp-title, .project-title {
        color: #667eea;
      }
      
      .exp-company {
        color: #764ba2;
      }
      
      .exp-duration, .edu-year {
        color: #7c3aed;
      }
    `;
  } else if (template === 'classic') {
    return baseStyles + `
      body {
        font-family: 'Georgia', 'Times New Roman', serif;
      }
      
      .header {
        text-align: center;
        border-bottom: 3px double #2c3e50;
        padding-bottom: 15px;
        margin-bottom: 25px;
      }
      
      .name {
        font-size: 28pt;
        font-weight: 700;
        color: #1a252f;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      
      .contact-info, .contact-links {
        font-size: 10pt;
        color: #34495e;
        margin: 5px 0;
      }
      
      .section-title {
        color: #1a252f;
        border-bottom: 2px solid #2c3e50;
        padding-bottom: 4px;
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
    `;
  } else if (template === 'executive') {
    return baseStyles + `
      body {
        font-family: 'Garamond', 'Georgia', serif;
        color: #1a1a1a;
      }
      
      .header {
        border-left: 5px solid #c9a961;
        padding-left: 25px;
        margin-bottom: 30px;
      }
      
      .name {
        font-size: 34pt;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
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
      
      .summary {
        font-size: 11.5pt;
        font-style: italic;
      }
    `;
  } else if (template === 'minimalist') {
    return baseStyles + `
      body {
        font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
        color: #333;
      }
      
      .header {
        margin-bottom: 30px;
      }
      
      .name {
        font-size: 30pt;
        font-weight: 300;
        color: #000;
        margin-bottom: 10px;
        letter-spacing: -0.5px;
      }
      
      .contact-info, .contact-links {
        font-size: 9.5pt;
        color: #666;
        margin: 4px 0;
        font-weight: 300;
      }
      
      .section-title {
        color: #000;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 6px;
        font-size: 12pt;
        font-weight: 600;
      }
      
      .skill-tag {
        background: #f5f5f5;
        color: #333;
        border: none;
        font-weight: 400;
      }
      
      .exp-title, .project-title {
        color: #000;
        font-weight: 600;
      }
      
      .exp-company {
        color: #666;
        font-weight: 500;
      }
      
      .exp-duration, .edu-year {
        color: #999;
        font-weight: 300;
      }
      
      .exp-bullets {
        font-weight: 300;
      }
    `;
  } else if (template === 'elegant') {
    return baseStyles + `
      body {
        font-family: 'Helvetica', 'Arial', sans-serif;
        color: #1a1a1a;
      }
      
      .header {
        text-align: center;
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

      .exp-title-company {
        font-weight: 700;
        font-size: 11pt;
      }

      .exp-header {
        display: block;
        margin-bottom: 5px;
      }

      .exp-title {
         display: inline;
         font-size: 11pt;
      }

      .exp-company::before {
        content: " | ";
        font-weight: normal;
        color: #ccc;
      }

      .exp-company {
        display: inline;
        font-size: 11pt;
        color: #000;
        font-style: normal;
      }

      .exp-duration::before {
        content: " | ";
        font-weight: normal;
        color: #ccc;
      }

      .exp-duration {
        display: inline;
        font-size: 11pt;
        font-style: normal;
        margin-left: 0;
        color: #000;
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
  } else { // professional
    return baseStyles + `
      body {
        font-family: 'Calibri', 'Arial', sans-serif;
      }
      
      .header {
        background: #2c3e50;
        color: white;
        padding: 20px 25px;
        margin: -15mm -20mm 25px -20mm;
      }
      
      .name {
        font-size: 30pt;
        font-weight: 700;
        margin-bottom: 8px;
      }
      
      .contact-info, .contact-links {
        font-size: 10pt;
        margin: 4px 0;
        opacity: 0.9;
      }
      
      .section-title {
        color: #2c3e50;
        border-bottom: 2px solid #3498db;
        padding-bottom: 6px;
      }
      
      .skill-tag {
        background: #ebf5fb;
        color: #2874a6;
        border: 1px solid #aed6f1;
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
  }
};

export const generateCoverLetterHTML = (data: ResumeData, coverLetterText: string): string => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.fullName} - Cover Letter</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    body {
      font-family: 'Inter', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background: white;
      max-width: 210mm;
      margin: auto;
    }
    
    * {
      box-sizing: border-box;
    }
    
    .container {
      padding: 2.5cm 2.5cm;
      min-height: 297mm;
    }
    
    .header {
      margin-bottom: 30px;
      text-align: center;
    }
    
    .name {
      font-size: 26pt;
      font-weight: 800;
      color: #111827;
      margin: 0 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .contact-info {
      font-size: 9.5pt;
      color: #374151;
      margin-top: 4px;
      font-weight: 400;
    }
    
    .accent-line {
      height: 1px;
      background: #e5e7eb;
      margin: 20px 0;
      width: 100%;
    }
    
    .letter-info {
      margin-top: 40px;
      margin-bottom: 40px;
      font-size: 11pt;
      color: #1f2937;
    }
    
    .recipient-block {
      margin-bottom: 25px;
    }
    
    .recipient-name {
      font-weight: 600;
    }
    
    .date {
      margin-bottom: 30px;
      color: #4b5563;
    }
    
    .content {
      font-size: 11pt;
      white-space: pre-wrap;
      text-align: justify;
      color: #374151;
      line-height: 1.7;
    }
    
    .signature-area {
      margin-top: 50px;
    }
    
    .signature-name {
      font-weight: 700;
      font-size: 12pt;
      margin-top: 5px;
    }

    @media print {
      body { margin: 0; }
      .container { padding: 1.5cm 2cm; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="name">${data.fullName}</h1>
      <div class="contact-info">
        ${[data.phone, data.email, data.portfolio].filter(Boolean).join('  |  ')}
      </div>
      <div class="contact-info">
        ${[data.linkedin, data.github, data.location].filter(Boolean).join('  |  ')}
      </div>
      <div class="accent-line"></div>
    </header>

    <div class="letter-info">
      <div class="recipient-block">
        <div class="recipient-name">Hiring Manager's Name</div>
        <div>${data.experience?.[0]?.company || "[Company Name]"}</div>
        <div>Company Address</div>
        <div>City, State, Zip Code</div>
      </div>
      <div class="date">${currentDate}</div>
    </div>

    <main class="content">
${coverLetterText}
    </main>

    <div class="signature-area">
      <div>Sincerely,</div>
      <div class="signature-name">${data.fullName}</div>
    </div>
  </div>
</body>
</html>
`;
};
