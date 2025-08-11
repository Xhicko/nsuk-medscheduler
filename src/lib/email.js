import { render } from '@react-email/render'
import AppointmentEmail from '@emails/ScheduleAppointment'
import AppointmentRevertedEmail from '@emails/AppointmentReverted'
import AppointmentMissedEmail from '@emails/AppointmentMissed'
import AppointmentRescheduledEmail from '@emails/AppointmentRescheduled'

import { getMTATransporter } from '@lib/mailer'


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
