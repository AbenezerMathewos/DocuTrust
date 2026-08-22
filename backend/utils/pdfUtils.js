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
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      });

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

      // Watermark Text / Background pattern
      doc.fillColor('#f8fafc').fontSize(120).text('DOCUTRUST', width / 2 - 300, height / 2 - 60, {
        align: 'center', opacity: 0.1
      });

      // Header (Institution)
      doc.moveDown(2);
      doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(36)
         .text(certData.institution || 'Official Institution', { align: 'center' });

      doc.moveDown(0.5);
      doc.fillColor('#475569').font('Helvetica').fontSize(14)
         .text('Federal Democratic Republic of Ethiopia', { align: 'center' });

      // Certificate Title
      doc.moveDown(2.5);
      doc.fillColor('#1d4ed8').font('Times-BoldItalic').fontSize(28)
         .text('Certificate of Graduation', { align: 'center' });

      // Body
      doc.moveDown(1.5);
      doc.fillColor('#334155').font('Helvetica').fontSize(16)
         .text('This is to certify that', { align: 'center' });

      doc.moveDown(1);
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(32)
         .text((certData.recipientName || 'Student Name').toUpperCase(), { align: 'center' });

      doc.moveDown(1);
      doc.fillColor('#334155').font('Helvetica').fontSize(16)
         .text('has successfully fulfilled all the requirements for the degree of', { align: 'center' });

      doc.moveDown(1);
      doc.fillColor('#1d4ed8').font('Helvetica-Bold').fontSize(24)
         .text((certData.degree || 'Degree Name').toUpperCase(), { align: 'center' });

      if (certData.classification) {
        doc.moveDown(0.5);
        doc.fillColor('#475569').font('Helvetica-Oblique').fontSize(16)
           .text(`with ${certData.classification}`, { align: 'center' });
      }

      // Date and Signatures
      const dateStr = certData.graduationDate ? new Date(certData.graduationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date';
      
      doc.fontSize(14).fillColor('#0f172a');
      
      // Left side: Date
      doc.text(`Awarded on: ${dateStr}`, 80, height - 160);
      doc.text('____________________', 80, height - 135);
      doc.fontSize(10).fillColor('#64748b').text('Date of Issue', 80, height - 120);

      // Right side: Signature
      doc.fontSize(14).fillColor('#0f172a').text('____________________', width - 280, height - 135, { align: 'right', width: 200 });
      doc.fontSize(10).fillColor('#64748b').text('Authorized Signature', width - 280, height - 120, { align: 'right', width: 200 });

      // QR Code and Security Footer
      if (qrDataUri) {
        const base64Data = qrDataUri.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        const qrBuffer = Buffer.from(base64Data, 'base64');
        // Center Bottom
        doc.image(qrBuffer, width / 2 - 45, height - 160, { width: 90 });
      }

      // Footer Meta
      doc.fontSize(9).font('Courier-Bold').fillColor('#94a3b8')
         .text(`CERT ID: ${certData.certificateId || 'Unknown'}`, 50, height - 40, { align: 'left' });
      
      doc.fontSize(9).font('Courier').fillColor('#94a3b8')
         .text('Secured by DocuTrust Ed25519 Cryptography', 50, height - 40, { align: 'right', width: width - 100 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateCertificatePDF };
