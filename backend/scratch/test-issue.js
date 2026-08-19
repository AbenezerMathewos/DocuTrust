const axios = require('axios');
const fs = require('fs');
const path = require('path');

const runTest = async () => {
  try {
    console.log('--- Testing API Endpoints ---');

    // 1. Create Institution
    console.log('1. Creating Institution...');
    const instResponse = await axios.post('http://localhost:5000/api/institutions', {
      name: 'Hawassa University',
      code: 'HU',
      contactEmail: 'info@hu.edu.et'
    }).catch(err => err.response); // Ignore error if it already exists

    if (instResponse.status === 201) {
      console.log('Created:', instResponse.data.code);
    } else {
      console.log('Institution might already exist:', instResponse.data);
    }

    // 2. Issue Certificate
    console.log('2. Issuing Certificate...');
    const certPayload = {
      recipientName: 'Abenezer Mathewos',
      studentId: 'ID-12345',
      institutionCode: 'HU',
      degree: 'Bachelor of Science in Computer Science',
      department: 'Computer Science',
      classification: 'First Class Honors',
      graduationDate: '2026-07-15'
    };

    const certResponse = await axios.post('http://localhost:5000/api/certificates/issue', certPayload, {
      responseType: 'arraybuffer' // We expect a PDF binary back
    });

    console.log(`Status: ${certResponse.status}`);
    
    // Save the PDF
    const outputPath = path.join(__dirname, 'issued-certificate.pdf');
    fs.writeFileSync(outputPath, certResponse.data);
    console.log(`Certificate PDF saved to ${outputPath}`);

  } catch (err) {
    console.error('Test Failed:', err.message);
    if (err.response) {
      console.error(err.response.data.toString());
    }
  }
};

runTest();
