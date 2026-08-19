const PDFDocument = require('pdfkit');

/**
 * Generates a PDF certificate.
 * 
 * @param {Object} certData The certificate payload (student name, degree, etc.)
 * @param {string} qrDataUri The Base64 Data URI of the QR code
 * @returns {Promise<Buffer>} A promise that resolves to a Buffer containing the PDF document.
 */
const generateCertificatePDF = (certData, qrDataUri) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a document in landscape mode
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      // Draw a simple border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke();

      // Title / Institution
      doc.moveDown(2);
      doc.font('Helvetica-Bold')
         .fontSize(35)
         .text(certData.institution || 'Institution Name', { align: 'center' });

      doc.moveDown(1.5);
      doc.font('Helvetica')
         .fontSize(20)
         .text('This is to certify that', { align: 'center' });

      doc.moveDown(1);
      doc.font('Helvetica-Bold')
         .fontSize(30)
         .text(certData.recipientName || 'Student Name', { align: 'center' });

      doc.moveDown(1);
      doc.font('Helvetica')
         .fontSize(20)
         .text('has successfully completed the requirements for the degree of', { align: 'center' });

      doc.moveDown(1);
      doc.font('Helvetica-Bold')
         .fontSize(25)
         .text(certData.degree || 'Degree Name', { align: 'center' });

      if (certData.classification) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Oblique')
           .fontSize(18)
           .text(`with ${certData.classification}`, { align: 'center' });
      }

      doc.moveDown(1);
      doc.font('Helvetica')
         .fontSize(16)
         .text(`Awarded on: ${certData.graduationDate || 'Date'}`, { align: 'center' });

      // Embed QR Code
      if (qrDataUri) {
        // Strip the data:image/png;base64, prefix
        const base64Data = qrDataUri.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        const qrBuffer = Buffer.from(base64Data, 'base64');
        
        // Position it at the bottom left (or bottom right)
        // A4 landscape is 841.89 x 595.28 points
        doc.image(qrBuffer, 50, doc.page.height - 150, { width: 100 });
      }

      // Certificate ID
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Certificate ID: ${certData.certificateId || 'Unknown'}`, 50, doc.page.height - 40, {
            align: 'left'
         });

      // Signatures (placeholders)
      doc.fontSize(14)
         .text('_________________________', doc.page.width - 250, doc.page.height - 120, { align: 'center' })
         .text('Registrar Signature', doc.page.width - 250, doc.page.height - 100, { align: 'center' });

      // Finalize the PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateCertificatePDF
};
