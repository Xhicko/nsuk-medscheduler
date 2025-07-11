````markdown
# NASU Clinic Scheduler

A web-based appointment scheduling system for Nasarawa State University, Keffi, enabling student authentication, medical form submission, doctor-led appointment management, and secure result notifications.

## Features

- **Authentication**  
  - Student sign‑up via email & matric number  
  - OTP verification & password creation  
- **Login**  
  - Secure matric number + password authentication  
- **Medical Form Submission**  
  - Students fill in medical details before clinic visit  
- **Admin/Doctor Panel**  
  - View submitted student records  
  - Schedule blood‑sample appointments  
- **Clinic Workflow Tracking**  
  - Mark blood‑sample submission status  
- **Result Notification**  
  - Email alerts when results are ready  
  - Downloadable result files in student portal  

## Tech Stack

- **Frontend:** Next.js, Tailwind CSS  
- **Backend & Auth:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)  
- **Hosting:** Vercel (recommended)  

## Getting Started

### Prerequisites

- Node.js v16+  
- npm or yarn  
- Supabase account & project  

### Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/your‑username/NASU‑Clinic‑Scheduler.git
   cd NASU‑Clinic‑Scheduler
````

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root and add:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
   SUPABASE_SERVICE_ROLE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY>  
   SMTP_HOST=<YOUR_SMTP_HOST>  
   SMTP_PORT=<YOUR_SMTP_PORT>  
   SMTP_USER=<YOUR_SMTP_USER>  
   SMTP_PASS=<YOUR_SMTP_PASS>
   ```

4. **Initialize Supabase**

   * Create tables for `students`, `medical_forms`, `appointments`, `results`.
   * Enable email/password + OTP authentication.
   * Configure Storage bucket for result documents.

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign up** as a student with your email & matric number.
2. **Verify OTP** sent to your email and create a password.
3. **Log in** using matric number & password.
4. **Submit** your medical details form.
5. **Doctor/Admin** schedules your clinic appointment.
6. **Visit clinic**, submit blood sample, and mark status.
7. **Receive email** when your results are ready; then download from your dashboard.

## Folder Structure

```
/
├── components/       # Reusable UI components
├── pages/            # Next.js pages & API routes
├── lib/              # Supabase client & utilities
├── styles/           # Global & component-specific styles
├── public/           # Static assets
└── README.md
```

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m "Add YourFeature"`)
4. Push to your branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

Please adhere to the existing code style and include descriptive commit messages.

## License

This project is licensed under the MIT License.

```
```
