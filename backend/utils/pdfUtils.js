const PDFDocument = require('pdfkit');

/**
 * Generates a PDF certificate.
 */
const generateCertificatePDF = (certData, qrDataUri) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 0,
        autoFirstPage: false
      });
      doc.addPage({ margin: 0 });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const width = doc.page.width;
      const height = doc.page.height;

      // Outer Border
      doc.rect(20, 20, width - 40, height - 40).lineWidth(3).stroke('#1d4ed8');
      // Inner Border
      doc.rect(26, 26, width - 52, height - 52).lineWidth(1).stroke('#94a3b8');

      // Watermark Text - Absolutely positioned so it doesn't affect cursor
      doc.save();
      doc.fillColor('#f1f5f9').fontSize(110);
      // We must explicitly set opacity to simulate a watermark in PDFKit if needed, or use a very light color like #f1f5f9
      doc.text('DOCUTRUST', 0, height / 2 - 40, { align: 'center', width: width });
      doc.restore();

      // Reset Y cursor explicitly to top margin area
      doc.y = 80;

      // Header (Institution)
      doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(36)
         .text(certData.institution || 'Official Institution', { align: 'center', width: width - 80 });

      doc.y += 10;
      doc.fillColor('#475569').font('Helvetica').fontSize(14)
         .text('Federal Democratic Republic of Ethiopia', { align: 'center', width: width - 80 });

      // Certificate Title
      doc.y += 40;
      doc.fillColor('#1d4ed8').font('Times-BoldItalic').fontSize(28)
         .text('Certificate of Graduation', { align: 'center', width: width - 80 });

      // Body
      doc.y += 40;
      doc.fillColor('#334155').font('Helvetica').fontSize(16)
         .text('This is to certify that', { align: 'center', width: width - 80 });

      doc.y += 20;
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(32)
         .text((certData.recipientName || 'Student Name').toUpperCase(), { align: 'center', width: width - 80 });

      doc.y += 30;
      doc.fillColor('#334155').font('Helvetica').fontSize(16)
         .text('has successfully fulfilled all the requirements for the degree of', { align: 'center', width: width - 80 });

      doc.y += 20;
      doc.fillColor('#1d4ed8').font('Helvetica-Bold').fontSize(24)
         .text((certData.degree || 'Degree Name').toUpperCase(), { align: 'center', width: width - 80 });

      if (certData.classification) {
        doc.y += 25;
        doc.fillColor('#475569').font('Helvetica-Oblique').fontSize(16)
           .text(`with ${certData.classification}`, { align: 'center', width: width - 80 });
      }

      // Date and Signatures (Absolutely Positioned near bottom)
      const dateStr = certData.graduationDate ? new Date(certData.graduationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date';
      
      const bottomY = height - 160;
      
      // Left side: Date
      doc.fontSize(14).fillColor('#0f172a').text(`Awarded on: ${dateStr}`, 80, bottomY);
      doc.text('____________________', 80, bottomY + 25);
      doc.fontSize(10).fillColor('#64748b').text('Date of Issue', 80, bottomY + 40);

      // Right side: Signature
      doc.fontSize(14).fillColor('#0f172a').text('____________________', width - 280, bottomY + 25, { align: 'right', width: 200 });
      doc.fontSize(10).fillColor('#64748b').text('Authorized Signature', width - 280, bottomY + 40, { align: 'right', width: 200 });

      // QR Code and Security Footer
      if (qrDataUri) {
        const base64Data = qrDataUri.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        const qrBuffer = Buffer.from(base64Data, 'base64');
        // Center Bottom
        doc.image(qrBuffer, width / 2 - 45, bottomY - 10, { width: 90 });
      }

      // Footer Meta
      doc.fontSize(9).font('Courier-Bold').fillColor('#94a3b8')
         .text(`CERT ID: ${certData.certificateId || 'Unknown'}`, 50, height - 40, { align: 'left', width: width/2 - 50 });
      
      doc.fontSize(9).font('Courier').fillColor('#94a3b8')
         .text('Secured by DocuTrust Ed25519 Cryptography', width/2, height - 40, { align: 'right', width: width/2 - 50 });

      // End the document
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateCertificatePDF };
