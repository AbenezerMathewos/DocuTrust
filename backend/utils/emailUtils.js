const nodemailer = require('nodemailer');

/**
 * Send email notification to a certificate holder
 * @param {string} toEmail - Recipient's email
 * @param {string} recipientName - Recipient's name
 * @param {string} degree - Degree title
 * @param {string} institution - Institution name
 * @param {string} certificateId - Certificate ID for verification link
 */
const sendCertificateNotification = async (toEmail, recipientName, degree, institution, certificateId) => {
  // Create transporter — uses Gmail SMTP. Configure in .env
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use Gmail App Password, not your main password
    },
  });

  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateId}`;

  const mailOptions = {
    from: `"DocuTrust — Ethiopia" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your Official Certificate is Ready — DocuTrust`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 30px; border-radius: 12px;">
        <div style="background: #1d4ed8; color: white; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 22px;">🎓 DocuTrust</h1>
          <p style="margin: 6px 0 0 0; opacity: 0.8; font-size: 13px;">Ethiopia's National Document Trust Infrastructure</p>
        </div>

        <h2 style="color: #1e293b;">Dear ${recipientName},</h2>
        <p style="color: #475569;">Congratulations! Your official certificate has been cryptographically signed and issued by <strong>${institution}</strong>.</p>

        <div style="background: white; border: 1px solid #e2e8f0; border-left: 4px solid #1d4ed8; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Degree Awarded</p>
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1e293b;">${degree}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Issued by: ${institution}</p>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #16a34a; font-weight: bold;">🔐 SHA-256 Cryptographic Proof</p>
          <p style="margin: 0; font-size: 11px; color: #166534; font-family: monospace;">Certificate ID: ${certificateId}</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #166534;">This certificate is anchored to the DocuTrust blockchain ledger and is mathematically tamper-proof.</p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${verifyUrl}" style="background: #1d4ed8; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
            ✅ View & Verify Certificate
          </a>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          You can also log in to your DocuTrust Citizen Wallet at <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/dashboard" style="color: #1d4ed8;">My Digital Wallet</a> to download your secure PDF.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #cbd5e1; font-size: 11px; text-align: center;">DocuTrust — Securing Ethiopia's Digital Future | Digital Ethiopia 2025</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`❌ Email failed to ${toEmail}:`, err.message);
    return false; // Don't crash the issuance flow if email fails
  }
};

module.exports = { sendCertificateNotification };
