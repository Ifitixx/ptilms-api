// ptilms-api/services/EmailService.js
import { createTransport } from 'nodemailer';
import config from '../config/config.cjs'; // Correct: Default import
import { info as _info, error as _error } from '../utils/logger.js';

const { email } = config; // Correct: Destructure after default import

class EmailService {
  constructor() {
    if (!email || !email.host || !email.port || !email.user || !email.pass) {
      throw new Error('Invalid email configuration: host, port, user, or pass is missing.');
    }
    this.transporter = createTransport({
      host: email.host,
      port: email.port,
      secure: email.secure, // true for 465, false for other ports
      auth: {
        user: email.user,
        pass: email.pass,
      },
    });
    this.from = email.from;
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: this.from,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      _info(`Email sent: ${info.messageId}`);
    } catch (error) {
      _error(`Error sending email:`, error);
      throw error;
    }
  }
}

export default EmailService;