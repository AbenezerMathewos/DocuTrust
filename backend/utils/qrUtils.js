const QRCode = require('qrcode');

/**
 * Generates a verification QR code for a given certificate ID.
 * The QR code encodes a URL pointing to the verification portal.
 * 
 * @param {string} certificateId The ID of the certificate.
 * @returns {Promise<string>} A promise that resolves to the Data URI of the QR code image.
 */
const generateVerificationQR = async (certificateId) => {
  try {
    // Determine the base URL based on the environment (e.g. dev vs production)
    const baseUrl = process.env.VERIFICATION_BASE_URL || 'https://your-domain.com/verify';
    const verificationUrl = `${baseUrl}/${certificateId}`;

    // Generate QR Code as a Data URI (Base64 encoded string)
    const qrDataUri = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H', // High error correction is good if we are printing it
      margin: 2,
      width: 250,
      color: {
        dark: '#000000', // Black dots
        light: '#ffffff' // White background
      }
    });

    return qrDataUri;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('QR generation failed');
  }
};

module.exports = {
  generateVerificationQR
};
