const { generateVerificationQR } = require('../utils/qrUtils');
const fs = require('fs');
const path = require('path');

const runTest = async () => {
  try {
    console.log('--- Testing QR Generation ---');
    const certificateId = 'CERT-HU-2026-CS-0104';
    
    const qrDataUri = await generateVerificationQR(certificateId);
    
    console.log('\nGenerated QR Data URI (truncated):');
    console.log(qrDataUri.substring(0, 50) + '...');

    // Save as an actual image file for visual verification
    // A data URI looks like "data:image/png;base64,iVBORw0KGgo..."
    const base64Data = qrDataUri.replace(/^data:image\/png;base64,/, "");
    
    const outputPath = path.join(__dirname, 'test-qr-output.png');
    fs.writeFileSync(outputPath, base64Data, 'base64');
    
    console.log(`\nQR Code successfully saved to ${outputPath}`);
    console.log('Open it to verify it scans correctly.');

  } catch (err) {
    console.error('Test Failed:', err);
  }
};

runTest();
