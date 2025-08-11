import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"

export default function AppointmentRescheduledEmail({
  systemName,
  studentName,
  matricNumber,
  start,
  end,
}) {
  const safeSystemName = systemName || process.env.NEXT_PUBLIC_SYSTEM_NAME || process.env.SYSTEM_NAME || "NSUK Medical Scheduler"
  const safeStudentName = studentName || "Student"
  const safeMatricNumber = matricNumber || "—"
  const safeStart = start || "TBD"
  const safeEnd = end || "TBD"
  return (
    <Html>
      <Head />
      <Preview>{`${safeSystemName}: Appointment rescheduled for ${safeStudentName}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading as="h2" style={styles.brand}>
              {safeSystemName}
            </Heading>
          </Section>

          <Section>
            <Heading as="h3" style={styles.title}>
              Appointment Rescheduled
            </Heading>
            <Text style={styles.paragraph}>
              Dear {safeStudentName} ({safeMatricNumber}),
            </Text>
            <Text style={styles.paragraph}>
              Your medical appointment has been rescheduled. Please find the new details below.
            </Text>
          </Section>

          <Section style={styles.card}>
            <Text style={styles.label}>Appointment Window</Text>
            <Text style={styles.value}>
              Start: {safeStart}
              <br />
              End: {safeEnd}
            </Text>
          </Section>

          <Section>
            <Text style={styles.note}>
              Please arrive 10 minutes early with your student ID. If you need to adjust the time, reply to this email.
            </Text>
          </Section>

          <Hr style={styles.hrLight} />

          <Section>
            <Text style={styles.footerText}>{safeSystemName} • University Health Services</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: "#ffffff",
    color: "#000000",
    margin: 0,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif",
  },
  container: {
    padding: "24px",
    margin: "0 auto",
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#0077B6",
    borderRadius: "8px",
    padding: "16px 20px",
    marginBottom: "20px",
  },
  brand: {
    margin: 0,
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: 700,
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    color: "#000000",
  },
  paragraph: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    color: "#000000",
  },
  card: {
    border: "1px solid #000000",
    borderRadius: "8px",
    padding: "16px",
    margin: "12px 0 16px",
    backgroundColor: "#ffffff",
  },
  label: {
    margin: "0 0 4px 0",
    fontSize: "12px",
    color: "#0077B6",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  value: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    color: "#000000",
  },
  hrLight: {
    border: "none",
    borderTop: "1px solid #000000",
    opacity: 0.2,
    margin: "16px 0",
  },
  note: {
    margin: "0 0 8px 0",
    fontSize: "12px",
    color: "#000000",
  },
  footerText: {
    margin: 0,
    fontSize: "12px",
    color: "#000000",
    opacity: 0.8,
  },
}
