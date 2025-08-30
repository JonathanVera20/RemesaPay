import twilio from 'twilio';
import nodemailer from 'nodemailer';
import config from '../config/config';
import logger from '../utils/logger';
import prisma from '../config/database';
import redisService from './redis';

// Initialize Twilio
const twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);

// Initialize Nodemailer
const emailTransporter = nodemailer.createTransporter({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: config.sendGrid.apiKey
  }
});

// Email templates
const emailTemplates = {
  remittanceSent: {
    subject: 'Remesa Enviada - RemesaPay',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Remesa Enviada Exitosamente</h2>
        <p>Estimado/a cliente,</p>
        <p>Su remesa ha sido enviada exitosamente:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>ID de Transacción:</strong> ${data.transactionId}</p>
          <p><strong>Monto:</strong> $${data.amount} USD</p>
          <p><strong>Destinatario:</strong> ${data.recipientPhone}</p>
          <p><strong>Código de Retiro:</strong> ${data.withdrawalCode}</p>
          <p><strong>Fecha:</strong> ${new Date(data.createdAt).toLocaleDateString('es-EC')}</p>
        </div>
        <p>El destinatario puede retirar el dinero presentando su cédula y el código de retiro en cualquier punto autorizado.</p>
        <p>Gracias por usar RemesaPay.</p>
      </div>
    `
  },
  
  remittanceReceived: {
    subject: 'Dinero Disponible para Retiro - RemesaPay',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">¡Has Recibido Dinero!</h2>
        <p>Tienes dinero disponible para retiro:</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
          <p><strong>Monto:</strong> $${data.amount} USD</p>
          <p><strong>De:</strong> ${data.senderPhone}</p>
          <p><strong>Código de Retiro:</strong> ${data.withdrawalCode}</p>
          <p><strong>Válido hasta:</strong> ${new Date(data.expiresAt).toLocaleDateString('es-EC')}</p>
        </div>
        <p><strong>Para retirar el dinero:</strong></p>
        <ol>
          <li>Visita cualquier punto autorizado</li>
          <li>Presenta tu cédula</li>
          <li>Proporciona el código: <strong>${data.withdrawalCode}</strong></li>
        </ol>
        <p>Encuentra puntos cercanos en: https://remesapay.com/ubicaciones</p>
      </div>
    `
  },

  kycRequired: {
    subject: 'Verificación de Identidad Requerida - RemesaPay',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Verificación de Identidad Requerida</h2>
        <p>Para continuar usando RemesaPay, necesitamos verificar tu identidad.</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Documentos requeridos:</strong></p>
          <ul>
            <li>Cédula de identidad (ambos lados)</li>
            <li>Comprobante de ingresos</li>
            <li>Foto selfie</li>
          </ul>
        </div>
        <p>Puedes completar la verificación en nuestra app o sitio web.</p>
        <a href="${config.app.frontendUrl}/kyc" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verificar Ahora</a>
      </div>
    `
  }
};

// SMS templates
const smsTemplates = {
  remittanceSent: (data: any) => 
    `RemesaPay: Remesa enviada exitosamente. Monto: $${data.amount}. Destinatario: ${data.recipientPhone}. Código: ${data.withdrawalCode}. ID: ${data.transactionId}`,
  
  remittanceReceived: (data: any) => 
    `RemesaPay: Tienes $${data.amount} para retirar. Código: ${data.withdrawalCode}. Válido hasta: ${new Date(data.expiresAt).toLocaleDateString('es-EC')}. Presenta tu cédula en cualquier punto autorizado.`,
  
  lowBalance: (data: any) => 
    `RemesaPay: Tu saldo está bajo ($${data.balance}). Recarga para continuar enviando remesas.`,
  
  securityAlert: (data: any) => 
    `RemesaPay ALERTA: Actividad sospechosa detectada en tu cuenta. Si no fuiste tú, contacta soporte inmediatamente.`,
  
  withdrawalCode: (data: any) => 
    `RemesaPay: Tu código de retiro es: ${data.withdrawalCode}. Válido por 24 horas. No lo compartas.`
};

// WhatsApp templates (using Twilio WhatsApp Business)
const whatsappTemplates = {
  remittanceSent: (data: any) => 
    `🏧 *RemesaPay - Remesa Enviada*\n\n` +
    `✅ Tu remesa fue enviada exitosamente\n` +
    `💰 Monto: $${data.amount} USD\n` +
    `📱 Destinatario: ${data.recipientPhone}\n` +
    `🔢 Código: ${data.withdrawalCode}\n` +
    `🆔 ID: ${data.transactionId}\n\n` +
    `El destinatario puede retirar el dinero en cualquier punto autorizado.`,
  
  remittanceReceived: (data: any) => 
    `💰 *¡Has recibido dinero!*\n\n` +
    `🎉 Tienes $${data.amount} USD disponible\n` +
    `👤 De: ${data.senderPhone}\n` +
    `🔢 Código: ${data.withdrawalCode}\n` +
    `⏰ Válido hasta: ${new Date(data.expiresAt).toLocaleDateString('es-EC')}\n\n` +
    `📍 Retira en cualquier punto autorizado con tu cédula y este código.`
};

export interface NotificationData {
  type: 'remittance_sent' | 'remittance_received' | 'kyc_required' | 'low_balance' | 'security_alert' | 'withdrawal_code';
  recipient: {
    phone: string;
    email?: string;
  };
  data: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('sms' | 'email' | 'whatsapp' | 'push')[];
}

class NotificationService {
  // Send SMS notification
  async sendSMS(to: string, message: string, priority: string = 'medium'): Promise<boolean> {
    try {
      // Rate limiting check
      const rateLimitKey = `sms_rate_limit:${to}`;
      const currentCount = await redisService.get(rateLimitKey);
      
      if (currentCount && parseInt(currentCount) >= 10) { // 10 SMS per hour limit
        logger.warn(`SMS rate limit exceeded for ${to}`);
        return false;
      }

      const result = await twilioClient.messages.create({
        body: message,
        from: config.twilio.phoneNumber,
        to: to
      });

      // Update rate limit counter
      await redisService.setex(rateLimitKey, 3600, (parseInt(currentCount || '0') + 1).toString());

      // Store notification record
      await prisma.notification.create({
        data: {
          type: 'SMS',
          recipient: to,
          content: message,
          status: 'SENT',
          priority,
          externalId: result.sid,
          sentAt: new Date()
        }
      });

      logger.info(`SMS sent successfully to ${to}`, { sid: result.sid });
      return true;

    } catch (error) {
      logger.error(`Failed to send SMS to ${to}:`, error);
      
      // Store failed notification
      await prisma.notification.create({
        data: {
          type: 'SMS',
          recipient: to,
          content: message,
          status: 'FAILED',
          priority,
          error: error.message
        }
      });

      return false;
    }
  }

  // Send email notification
  async sendEmail(to: string, subject: string, html: string, priority: string = 'medium'): Promise<boolean> {
    try {
      const result = await emailTransporter.sendMail({
        from: `"RemesaPay" <${config.sendGrid.fromEmail}>`,
        to,
        subject,
        html
      });

      // Store notification record
      await prisma.notification.create({
        data: {
          type: 'EMAIL',
          recipient: to,
          subject,
          content: html,
          status: 'SENT',
          priority,
          externalId: result.messageId,
          sentAt: new Date()
        }
      });

      logger.info(`Email sent successfully to ${to}`, { messageId: result.messageId });
      return true;

    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      
      // Store failed notification
      await prisma.notification.create({
        data: {
          type: 'EMAIL',
          recipient: to,
          subject,
          content: html,
          status: 'FAILED',
          priority,
          error: error.message
        }
      });

      return false;
    }
  }

  // Send WhatsApp notification
  async sendWhatsApp(to: string, message: string, priority: string = 'medium'): Promise<boolean> {
    try {
      // Format phone number for WhatsApp (must include country code)
      const whatsappNumber = `whatsapp:${to.startsWith('+') ? to : '+' + to}`;
      const fromNumber = `whatsapp:${config.twilio.whatsappNumber}`;

      const result = await twilioClient.messages.create({
        body: message,
        from: fromNumber,
        to: whatsappNumber
      });

      // Store notification record
      await prisma.notification.create({
        data: {
          type: 'WHATSAPP',
          recipient: to,
          content: message,
          status: 'SENT',
          priority,
          externalId: result.sid,
          sentAt: new Date()
        }
      });

      logger.info(`WhatsApp sent successfully to ${to}`, { sid: result.sid });
      return true;

    } catch (error) {
      logger.error(`Failed to send WhatsApp to ${to}:`, error);
      
      // Store failed notification
      await prisma.notification.create({
        data: {
          type: 'WHATSAPP',
          recipient: to,
          content: message,
          status: 'FAILED',
          priority,
          error: error.message
        }
      });

      return false;
    }
  }

  // Send multi-channel notification
  async sendNotification(notification: NotificationData): Promise<void> {
    const { type, recipient, data, priority, channels } = notification;

    // Get templates
    const smsTemplate = smsTemplates[type];
    const emailTemplate = emailTemplates[type];
    const whatsappTemplate = whatsappTemplates[type];

    const promises = [];

    // Send SMS
    if (channels.includes('sms') && smsTemplate) {
      promises.push(this.sendSMS(
        recipient.phone,
        smsTemplate(data),
        priority
      ));
    }

    // Send Email
    if (channels.includes('email') && emailTemplate && recipient.email) {
      promises.push(this.sendEmail(
        recipient.email,
        emailTemplate.subject,
        emailTemplate.html(data),
        priority
      ));
    }

    // Send WhatsApp
    if (channels.includes('whatsapp') && whatsappTemplate) {
      promises.push(this.sendWhatsApp(
        recipient.phone,
        whatsappTemplate(data),
        priority
      ));
    }

    // Execute all notifications
    try {
      await Promise.allSettled(promises);
      logger.info(`Multi-channel notification sent for type: ${type}`, {
        recipient: recipient.phone,
        channels,
        priority
      });
    } catch (error) {
      logger.error(`Failed to send multi-channel notification:`, error);
    }
  }

  // Send remittance sent notification
  async notifyRemittanceSent(data: {
    transactionId: string;
    amount: string;
    recipientPhone: string;
    withdrawalCode: string;
    createdAt: Date;
    senderPhone: string;
    senderEmail?: string;
  }): Promise<void> {
    await this.sendNotification({
      type: 'remittance_sent',
      recipient: {
        phone: data.senderPhone,
        email: data.senderEmail
      },
      data,
      priority: 'high',
      channels: ['sms', 'email']
    });
  }

  // Send remittance received notification
  async notifyRemittanceReceived(data: {
    amount: string;
    senderPhone: string;
    withdrawalCode: string;
    expiresAt: Date;
    recipientPhone: string;
    recipientEmail?: string;
  }): Promise<void> {
    await this.sendNotification({
      type: 'remittance_received',
      recipient: {
        phone: data.recipientPhone,
        email: data.recipientEmail
      },
      data,
      priority: 'high',
      channels: ['sms', 'whatsapp', 'email']
    });
  }

  // Send KYC required notification
  async notifyKYCRequired(phone: string, email?: string): Promise<void> {
    await this.sendNotification({
      type: 'kyc_required',
      recipient: { phone, email },
      data: {},
      priority: 'medium',
      channels: ['sms', 'email']
    });
  }

  // Send security alert
  async notifySecurityAlert(phone: string, data: any): Promise<void> {
    await this.sendNotification({
      type: 'security_alert',
      recipient: { phone },
      data,
      priority: 'urgent',
      channels: ['sms', 'whatsapp']
    });
  }

  // Get notification history
  async getNotificationHistory(
    recipient?: string,
    type?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const where: any = {};
    
    if (recipient) where.recipient = recipient;
    if (type) where.type = type;

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get notification statistics
  async getNotificationStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await prisma.notification.groupBy({
      by: ['type', 'status'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    });

    return stats.reduce((acc, stat) => {
      if (!acc[stat.type]) {
        acc[stat.type] = { SENT: 0, FAILED: 0, PENDING: 0 };
      }
      acc[stat.type][stat.status] = stat._count.id;
      return acc;
    }, {} as Record<string, Record<string, number>>);
  }
}

export default new NotificationService();
