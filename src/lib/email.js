import { render } from '@react-email/render';
import { ScheduleAppointment } from '@emails/ScheduleAppointment';

import { getMTATransporter } from '@lib/mailer';

export async function sendScheduleAppointment({ to, verificationToken }) {
  const emailHtml = await render(
    <ScheduleAppointment
      verificationToken={verificationToken}
    />
  ).then(html => html);

  try {
    const transporter = getMTATransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: 'Medical Appointment Scheduled',
      html: emailHtml,
    };
    
    await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
