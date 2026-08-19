const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const runTest = async () => {
  try {
    console.log('--- Testing Batch Issuance API ---');

    // 1. Create a dummy CSV file
    const csvContent = `recipientName,studentId,degree,department,classification,graduationDate
Alice Smith,ID-001,BSc Computer Science,CS,First Class,2026-07-15
Bob Jones,ID-002,BSc Mathematics,Math,Second Class,2026-07-15
Charlie Brown,ID-003,BSc Physics,Physics,First Class,2026-07-15`;
    
    const csvPath = path.join(__dirname, 'dummy_students.csv');
    fs.writeFileSync(csvPath, csvContent);
    console.log('1. Created dummy_students.csv');

    // 2. Prepare FormData
    console.log('2. Uploading CSV to batch-issue endpoint...');
    const formData = new FormData();
    formData.append('institutionCode', 'HU');
    formData.append('file', fs.createReadStream(csvPath));

    // 3. Make Request
    const response = await axios.post('http://localhost:5000/api/certificates/batch-issue', formData, {
      headers: {
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer' // We expect a ZIP file
    });

    // 4. Save ZIP
    const zipPath = path.join(__dirname, 'batch_output.zip');
    fs.writeFileSync(zipPath, response.data);
    console.log(`3. Success! Saved 3 certificates to ${zipPath}`);

    // Cleanup CSV
    fs.unlinkSync(csvPath);

  } catch (err) {
    console.error('Test Failed:', err.message);
    if (err.response) {
      console.error(err.response.data.toString());
    }
  }
};

runTest();
