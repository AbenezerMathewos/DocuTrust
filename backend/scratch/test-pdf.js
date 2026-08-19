const { generateVerificationQR } = require('../utils/qrUtils');
const { generateCertificatePDF } = require('../utils/pdfUtils');
const fs = require('fs');
const path = require('path');

const runTest = async () => {
  try {
    console.log('--- Testing PDF Generation ---');
    
    const certData = {
      certificateId: 'CERT-HU-2026-CS-0104',
      recipientName: 'Abenezer Mathewos',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'Hawassa University',
      classification: 'First Class Honors',
      graduationDate: '2026-07-15'
    };

    console.log('Generating QR code...');
    const qrDataUri = await generateVerificationQR(certData.certificateId);
    
    console.log('Generating PDF...');
    const pdfBuffer = await generateCertificatePDF(certData, qrDataUri);
    
    const outputPath = path.join(__dirname, 'test-certificate.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`\nPDF successfully saved to ${outputPath}`);

  } catch (err) {
    console.error('Test Failed:', err);
  }
};

runTest();
