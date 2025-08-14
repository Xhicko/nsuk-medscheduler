import { render } from '@react-email/render'
import AppointmentEmail from '@emails/ScheduleAppointment'
import AppointmentRevertedEmail from '@emails/AppointmentReverted'
import AppointmentMissedEmail from '@emails/AppointmentMissed'
import AppointmentRescheduledEmail from '@emails/AppointmentRescheduled'
import ResultReadyEmail from '@emails/ResultReady'

import { getMTATransporter } from '@lib/mailer'
import AdminVerificationEmail from '@emails/AdminVerification'
import AdminWelcomeEmail from '@emails/AdminWelcome'


export async function sendScheduleAppointment({ to, systemName, studentName, matricNumber, start, end }) {
  const html = await render(
    <AppointmentEmail
      systemName={systemName}
      studentName={studentName}
      matricNumber={matricNumber}
      start={start}
      end={end}
    />
  )

  const text = await render(
    <AppointmentEmail
      systemName={systemName}
      studentName={studentName}
      matricNumber={matricNumber}
      start={start}
      end={end}
    />,
    { plainText: true }
  )

  try {
    const transporter = getMTATransporter()

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: 'Medical Appointment Scheduled',
      html,
      text,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending appointment email:', error)
    throw error
  }
}

export async function sendAppointmentReverted({ to, systemName, studentName, matricNumber, note }) {
  const html = await render(
    <AppointmentRevertedEmail
      systemName={systemName}
      studentName={studentName}
      matricNumber={matricNumber}
      note={note}
    />
  )

  const text = await render(
    <AppointmentRevertedEmail
      systemName={systemName}
      studentName={studentName}
      matricNumber={matricNumber}
      note={note}
    />,
    { plainText: true }
  )

  try {
    const transporter = getMTATransporter()

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: 'Appointment Update: Reverted to Pending',
      html,
      text,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending appointment reverted email:', error)
    throw error
  }
}

export async function sendAppointmentMissed({ to, systemName, studentName, matricNumber, start, end, note }) {
  const html = await render(
    <AppointmentMissedEmail
      systemName={systemName}
      studentName={studentName}
      matricNumber={matricNumber}
      start={start}
      end={end}
      note={note}
    />
  )

  const text = await render(
    <AppointmentMissedEmail
      systemName={systemName}
      studentName={studentName}
      matricNumber={matricNumber}
      start={start}
      end={end}
      note={note}
    />,
    { plainText: true }
  )

  try {
    const transporter = getMTATransporter()
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: 'Appointment Missed',
      html,
      text,
    }
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending appointment missed email:', error)
    throw error
  }
}

export async function sendAppointmentRescheduled({ to, systemName, studentName, matricNumber, start, end }) {
  const html = await render(
    <AppointmentRescheduledEmail
      systemName={systemName}
      studentName={studentName}
      matricNumber={matricNumber}
      start={start}
      end={end}
    />
  )

  const text = await render(
    <AppointmentRescheduledEmail
      systemName={systemName}
      studentName={studentName}
      matricNumber={matricNumber}
      start={start}
      end={end}
    />,
    { plainText: true }
  )

  try {
    const transporter = getMTATransporter()
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: 'Medical Appointment Rescheduled',
      html,
      text,
    }
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending appointment rescheduled email:', error)
    throw error
  }
}

export async function sendResultReady({ to, systemName, studentName, matricNumber }) {
  const html = await render(
    <ResultReadyEmail
      systemName={systemName}
      studentName={studentName}
      matricNumber={matricNumber}
    />
  )

  const text = await render(
    <ResultReadyEmail
      systemName={systemName}
      studentName={studentName}
      matricNumber={matricNumber}
    />,
    { plainText: true }
  )

  try {
    const transporter = getMTATransporter()
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: 'Your medical test result is ready',
      html,
      text,
    }
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending result ready email:', error)
    throw error
  }
}

// Send a simple Admin Email Verification token
export async function sendAdminVerificationToken({ to, token }) {
  const systemName = process.env.NEXT_PUBLIC_SYSTEM_NAME || process.env.SYSTEM_NAME || 'NSUK Medical Scheduler'
  const subject = `${systemName} Admin Verification Token`
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER

  const html = await render(
    <AdminVerificationEmail
      systemName={systemName}
      token={token}
      supportEmail={supportEmail}
    />
  )

  const text = await render(
    <AdminVerificationEmail
      systemName={systemName}
      token={token}
      supportEmail={supportEmail}
    />,
    { plainText: true }
  )

  try {
    const transporter = getMTATransporter()
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    }
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending admin verification token:', error)
    throw error
  }
}

// Send admin welcome email with role and medical ID (no password for security)
export async function sendAdminWelcome({ to, systemName, fullName, role, medicalId, password, loginUrl, supportEmail }) {
  const safeSystemName = systemName || process.env.NEXT_PUBLIC_SYSTEM_NAME || process.env.SYSTEM_NAME || 'NSUK Medical Scheduler'
  const html = await render(
    <AdminWelcomeEmail
      systemName={safeSystemName}
      fullName={fullName}
      role={role}
      medicalId={medicalId}
      password={password}
      loginUrl={loginUrl}
      supportEmail={supportEmail}
    />
  )

  const text = await render(
    <AdminWelcomeEmail
      systemName={safeSystemName}
      fullName={fullName}
      role={role}
      medicalId={medicalId}
      password={password}
      loginUrl={loginUrl}
      supportEmail={supportEmail}
    />,
    { plainText: true }
  )

  try {
    const transporter = getMTATransporter()
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `${safeSystemName}: Admin account created`,
      html,
      text,
    }
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending admin welcome email:', error)
    throw error
  }
}
