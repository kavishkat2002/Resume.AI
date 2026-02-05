// Simple fallback PDF download function
export const downloadSimplePDF = (resumeText: string, fullName: string) => {
    const { jsPDF } = require('jspdf');

    const doc = new jsPDF();
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    let y = margin;
    const lineHeight = 6;

    doc.setFont("helvetica", "normal");

    const lines = resumeText.split('\n');

    lines.forEach((line) => {
        // Check if we need a new page
        if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }

        // Detect headers (all caps lines)
        const isHeader = line === line.toUpperCase() &&
            line.trim().length > 0 &&
            line.trim().length < 50 &&
            !line.includes('@') &&
            !line.includes('http');

        if (isHeader) {
            doc.setFontSize(12);
            doc.setFont(undefined, "bold");
            doc.setTextColor(0, 51, 102);
            const wrappedHeader = doc.splitTextToSize(line, maxWidth);
            wrappedHeader.forEach((wrappedLine: string) => {
                doc.text(wrappedLine, margin, y);
                y += lineHeight + 1;
            });
            doc.setFontSize(10);
            doc.setFont(undefined, "normal");
            doc.setTextColor(0, 0, 0);
            y += 2;
        } else if (line.trim().length > 0) {
            doc.setFontSize(10);
            const wrappedText = doc.splitTextToSize(line, maxWidth);
            wrappedText.forEach((wrappedLine: string) => {
                if (y > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(wrappedLine, margin, y);
                y += lineHeight;
            });
        } else {
            y += lineHeight / 2;
        }
    });

    const fileName = `${fullName.replace(/\s+/g, "_") || "resume"}_ATS.pdf`;
    doc.save(fileName);
};
