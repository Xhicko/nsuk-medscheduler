"use client"

import { cn } from "@/lib/utils"

export function SectionCard({ title, icon, description, className, children }) {
  return (
    <section className={cn("rounded-xl border border-[#0077B6] bg-white shadow-sm", className)}>
      <header className="flex items-start gap-3 border-b border-[#0077B6] px-4 py-3 sm:px-6">
        {icon ? <div className="mt-0.5 text-[#0077B6]">{icon}</div> : null}
        <div>
          <h3 className="text-base font-semibold leading-none tracking-tight text-[#0077B6]">{title}</h3>
          {description ? <p className="mt-1 text-xs text-gray-600">{description}</p> : null}
        </div>
      </header>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  )
}
