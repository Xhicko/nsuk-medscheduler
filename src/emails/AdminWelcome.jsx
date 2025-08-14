import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"

export default function AdminWelcomeEmail({ systemName, fullName, role, medicalId, password, loginUrl, supportEmail }) {
  const safeSystemName = systemName || process.env.NEXT_PUBLIC_SYSTEM_NAME || process.env.SYSTEM_NAME || "NSUK Medical Scheduler"
  const safeName = fullName || "Admin"
  const safeRole = role || "admin"
  const safeMedicalId = medicalId || "—"
  const safePassword = password || undefined
  const safeLoginUrl = loginUrl || undefined
  const safeSupport = supportEmail || process.env.SUPPORT_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER

  return (
    <Html>
      <Head />
      <Preview>{`${safeSystemName}: Your admin account details`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading as="h2" style={styles.brand}>
              {safeSystemName}
            </Heading>
          </Section>

          <Section>
            <Heading as="h3" style={styles.title}>Welcome, {safeName}</Heading>
            <Text style={styles.paragraph}>Your admin account has been created successfully.</Text>
          </Section>

          <Section style={styles.card}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{safeRole}</Text>

            <Hr style={styles.hr} />

            <Text style={styles.label}>Medical ID</Text>
            <Text style={styles.value}>{safeMedicalId}</Text>

            {safePassword && (
              <>
                <Hr style={styles.hr} />
                <Text style={styles.label}>Password</Text>
                <Text style={styles.value}>{safePassword}</Text>
              </>
            )}
          </Section>

          {safeLoginUrl && (
            <Section>
              <Text style={styles.paragraph}>
                You can sign in at: <a href={safeLoginUrl} style={styles.link}>{safeLoginUrl}</a>
              </Text>
            </Section>
          )}

          {safeSupport && (
            <Section>
              <Text style={styles.note}>
                Need help? Contact <a href={`mailto:${safeSupport}`} style={styles.link}>{safeSupport}</a>
              </Text>
            </Section>
          )}

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
  hr: {
    border: "none",
    borderTop: "1px solid #000000",
    margin: "12px 0",
  },
  hrLight: {
    border: "none",
    borderTop: "1px solid #000000",
    opacity: 0.2,
    margin: "16px 0",
  },
  footerText: {
    margin: 0,
    fontSize: "12px",
    color: "#000000",
    opacity: 0.8,
  },
  link: {
    color: "#0077B6",
    textDecoration: "none",
  },
}
