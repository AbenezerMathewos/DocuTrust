/**
 * Simulated Twilio SMS Integration
 * In a real production environment for INSA, this would use a local Ethiopian SMS gateway
 * or a global provider like Twilio to send immediate alerts to citizens.
 */

const sendCertificateSMS = async (phoneNumber, recipientName, degree, institutionName, certificateId) => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const message = `DocuTrust Alert: Hello ${recipientName}, your ${degree} from ${institutionName} has been cryptographically secured. Verify using ID: ${certificateId}`;
      
      console.log(`\n================= SMS GATEWAY =================`);
      console.log(`To: ${phoneNumber}`);
      console.log(`Message: "${message}"`);
      console.log(`Status: DELIVERED (Simulated)`);
      console.log(`===============================================\n`);
      
      resolve(true);
    }, 500);
  });
};

module.exports = {
  sendCertificateSMS
};
