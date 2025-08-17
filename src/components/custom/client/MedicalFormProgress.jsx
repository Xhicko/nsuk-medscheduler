"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

// steps: [{ id, title, completed }], currentStep: id of current step
export function MedicalFormProgress({ steps, currentStep }) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep)

  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = step.completed
          const isConnected = index < steps.length - 1

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isCompleted
                      ? "bg-[#0077B6] border-[#0077B6] text-white"
                      : isActive
                        ? "border-[#0077B6] bg-white text-[#0077B6]"
                        : "border-gray-300 bg-white text-gray-400",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn("text-xs font-medium", isActive || isCompleted ? "text-[#0077B6]" : "text-white")}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
              {isConnected && (
                <div className={cn("mx-2 h-0.5 w-8 sm:w-16", index < currentIndex ? "bg-[#0077B6]" : "bg-white")} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
