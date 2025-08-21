import Link from 'next/link'

export default function StepNotFound() {
  return (
    <main className="min-h-[100vh] w-full flex items-center justify-center px-4 py-20 bg-[#0077B6]">
      <div className="mx-auto w-full max-w-3xl text-center text-white">
        <div className="mx-auto text-2xl leading-none font-extrabold uppercase drop-shadow-sm">Step unavailable</div>
        <p className="mt-3 text-sm opacity-95">The medical form you're trying to open isn't available for your profile
         <br />
         If you believe this is an error, please go back to your dashboard or contact support.</p>
        <div className="mt-8 flex items-center justify-center">
          <Link href="/student/dashboard" className="inline-block px-6 py-3 bg-white text-[#0077B6] rounded font-semibold">Back to dashboard</Link>
        </div>
      </div>
    </main>
  )
}
