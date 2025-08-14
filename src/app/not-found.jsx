import SegmentCtaButton from '@/components/custom/SegmentCtaButton'
import SegmentOtherButton from '@/components/custom/SegmentOtherButton'

export default function NotFound() {
  return (
    <main className="min-h-[100vh] w-full flex items-center justify-center px-4 py-20 bg-gradient-to-b from-[#0077B6] to-[#005a8a]">
      <div className="mx-auto w-full max-w-5xl text-center text-white">
        <div className="mx-auto text-[7rem] leading-none font-extrabold drop-shadow-sm sm:text-[9rem]">404</div>
        <p className="mt-3 text-xs font-semibold tracking-widest uppercase opacity-90">We are sorry, but the page you requested was not found</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <SegmentCtaButton />
          <SegmentOtherButton />
        </div>
      </div>
    </main>
  )
}
