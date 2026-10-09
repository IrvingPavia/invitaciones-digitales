const nodemailer = require('nodemailer');
const { getDB } = require('../models/database');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Envía email de verificación al usuario recién registrado.
 * @param {string} to - Email del destinatario
 * @param {string} token - Token de verificación UUID
 * @param {string} name - Nombre del usuario
 */
async function sendVerificationEmail(to, token, name) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verificar/${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #6366f1; color: #ffffff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; color: #333333; line-height: 1.6; }
        .btn { display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { padding: 20px 30px; background: #f9fafb; color: #6b7280; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Vitely</h1>
        </div>
        <div class="content">
          <h2>¡Hola ${name}!</h2>
          <p>Gracias por registrarte en Vitely. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="btn">Verificar mi cuenta</a>
          </p>
          <p>O copia y pega esta URL en tu navegador:</p>
          <p style="word-break: break-all; color: #6366f1;">${verificationUrl}</p>
          <p><strong>Este enlace es válido por 24 horas.</strong></p>
          <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Vitely. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || '"Vitely" <noreply@vitely.com>',
    to,
    subject: 'Verifica tu cuenta en Vitely',
    html,
  });
}

/**
 * Envía confirmación de pago al usuario.
 * @param {string} to - Email del destinatario
 * @param {object} purchaseDetails - Detalles de la compra
 * @param {string} purchaseDetails.name - Nombre del usuario
 * @param {string} purchaseDetails.planName - Nombre del paquete
 * @param {number} purchaseDetails.quantity - Cantidad de eventos
 * @param {number} purchaseDetails.unitPrice - Precio unitario
 * @param {number} purchaseDetails.discountPct - Porcentaje de descuento
 * @param {number} purchaseDetails.totalAmount - Monto total cobrado
 * @param {string} purchaseDetails.transactionId - ID de la transacción
 */
async function sendPaymentConfirmation(to, purchaseDetails) {
  const { name, planName, quantity, unitPrice, discountPct, totalAmount, transactionId } = purchaseDetails;

  const discountLine = discountPct > 0
    ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;">Descuento por volumen</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">-${discountPct}%</td></tr>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #10b981; color: #ffffff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; color: #333333; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .total { font-size: 18px; font-weight: bold; color: #10b981; }
        .footer { padding: 20px 30px; background: #f9fafb; color: #6b7280; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Pago Confirmado!</h1>
        </div>
        <div class="content">
          <h2>Hola ${name},</h2>
          <p>Tu pago ha sido procesado exitosamente. Aquí tienes el resumen de tu compra:</p>
          <table>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;">Paquete</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${planName}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;">Cantidad de eventos</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${quantity}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;">Precio unitario</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${unitPrice.toFixed(2)} MXN</td></tr>
            ${discountLine}
            <tr><td style="padding:8px;border-bottom:2px solid #333;"><span class="total">Total</span></td><td style="padding:8px;border-bottom:2px solid #333;text-align:right;"><span class="total">$${totalAmount.toFixed(2)} MXN</span></td></tr>
          </table>
          <p>Referencia de transacción: <strong>#${transactionId}</strong></p>
          <p>Tus eventos ya están disponibles en tu dashboard. Puedes asignarles fecha cuando estés listo.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Vitely. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || '"Vitely" <noreply@vitely.com>',
    to,
    subject: 'Confirmación de pago - Vitely',
    html,
  });
}

/**
 * Envía confirmación de postergación de evento.
 * @param {string} to - Email del destinatario
 * @param {object} eventDetails - Detalles del evento postergado
 * @param {string} eventDetails.name - Nombre del usuario
 * @param {string} eventDetails.eventName - Nombre del evento
 * @param {string} eventDetails.originalDate - Fecha original del evento
 * @param {string} eventDetails.newDate - Nueva fecha del evento
 * @param {string} eventDetails.deactivationDate - Nueva fecha de desactivación
 */
async function sendPostponementConfirmation(to, eventDetails) {
  const { name, eventName, originalDate, newDate, deactivationDate } = eventDetails;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #f59e0b; color: #ffffff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; color: #333333; line-height: 1.6; }
        .info-box { background: #fffbeb; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 20px 0; }
        .footer { padding: 20px 30px; background: #f9fafb; color: #6b7280; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Evento Postergado</h1>
        </div>
        <div class="content">
          <h2>Hola ${name},</h2>
          <p>La postergación de tu evento ha sido procesada exitosamente.</p>
          <div class="info-box">
            <p><strong>Evento:</strong> ${eventName}</p>
            <p><strong>Fecha original:</strong> ${originalDate}</p>
            <p><strong>Nueva fecha:</strong> ${newDate}</p>
            <p><strong>Activo hasta:</strong> ${deactivationDate}</p>
          </div>
          <p>Recuerda que cada evento solo puede postergarse una vez. Tu invitación seguirá activa hasta 3 días después de la nueva fecha del evento.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Vitely. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || '"Vitely" <noreply@vitely.com>',
    to,
    subject: `Postergación confirmada: ${eventName} - Vitely`,
    html,
  });
}

/**
 * Reenvía email de verificación con rate limiting (max 3 por hora por usuario).
 * @param {number} userId - ID del usuario
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function resendVerification(userId) {
  const db = getDB();

  // Rate limiting: max 3 emails per hour per user
  const [recentEmails] = await db.query(
    `SELECT COUNT(*) as count FROM email_verifications 
     WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
    [userId]
  );

  if (recentEmails[0].count >= 3) {
    return {
      success: false,
      message: 'Has alcanzado el límite de reenvíos. Intenta de nuevo en 1 hora.',
    };
  }

  // Get user info
  const [users] = await db.query(
    'SELECT id, email, full_name, verification_status FROM users WHERE id = ?',
    [userId]
  );

  if (!users[0]) {
    return { success: false, message: 'Usuario no encontrado.' };
  }

  const user = users[0];

  if (user.verification_status === 'verified') {
    return { success: false, message: 'La cuenta ya está verificada.' };
  }

  if (!user.email) {
    return { success: false, message: 'No hay email asociado a esta cuenta.' };
  }

  // Generate new token
  const { v4: uuidv4 } = require('uuid');
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.query(
    `INSERT INTO email_verifications (user_id, token, type, expires_at) VALUES (?, ?, 'registration', ?)`,
    [userId, token, expiresAt]
  );

  // Send email
  await sendVerificationEmail(user.email, token, user.full_name || 'Usuario');

  return { success: true, message: 'Correo de verificación reenviado.' };
}

module.exports = {
  sendVerificationEmail,
  sendPaymentConfirmation,
  sendPostponementConfirmation,
  resendVerification,
};
