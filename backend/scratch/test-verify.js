const axios = require('axios');
const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const dotenv = require('dotenv');
dotenv.config();

const runTest = async () => {
  try {
    console.log('--- Testing Verification API ---');
    await mongoose.connect('mongodb://localhost:27017/docutrust');

    // 1. Issue a temporary certificate first to get a valid ID (or fetch an existing one)
    const certPayload = {
      recipientName: 'Abenezer Mathewos',
      studentId: 'ID-VERIFY',
      institutionCode: 'HU',
      degree: 'BSc Computer Science',
      department: 'CS',
      classification: 'First Class',
      graduationDate: '2026-07-15' // IMPORTANT to use this date format
    };

    console.log('1. Issuing a new certificate...');
    // We already have HU created from previous tests
    let certId;
    try {
        const issueRes = await axios.post('http://localhost:5000/api/certificates/issue', certPayload, { responseType: 'arraybuffer' });
        // The API currently returns binary, wait, how do I get the ID?
        // Ah, it's in the Content-Disposition header!
        const disposition = issueRes.headers['content-disposition'];
        certId = disposition.match(/filename=(CERT-.*?)\.pdf/)[1];
        console.log(`Issued Certificate ID: ${certId}`);
    } catch(err) {
        console.error('Error issuing:', err.message);
        process.exit(1);
    }

    // 2. Test Authentic Verification
    console.log('\n2. Testing Verification (Authentic)...');
    const verifyRes = await axios.get(`http://localhost:5000/api/certificates/verify/${certId}`);
    console.log(`Status: ${verifyRes.data.status}`);
    console.log(`Message: ${verifyRes.data.message}`);

    // 3. Test Not Found Verification
    console.log('\n3. Testing Verification (Not Found)...');
    try {
        await axios.get(`http://localhost:5000/api/certificates/verify/CERT-FAKE-1234`);
    } catch (err) {
        if(err.response && err.response.status === 404) {
            console.log(`Status: ${err.response.data.status}`);
            console.log(`Message: ${err.response.data.message}`);
        } else {
            console.error('Unexpected error:', err.message);
        }
    }

    // 4. Tamper with the Database Record and Test Again
    console.log('\n4. Testing Verification (Tampered)...');
    await Certificate.updateOne({ certificateId: certId }, { 'credential.degree': 'Master of Computer Science' });
    
    const verifyTamperedRes = await axios.get(`http://localhost:5000/api/certificates/verify/${certId}`);
    console.log(`Status: ${verifyTamperedRes.data.status}`);
    console.log(`Message: ${verifyTamperedRes.data.message}`);

    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err.message);
    if (err.response) {
      console.error(err.response.data);
    }
    process.exit(1);
  }
};

runTest();
