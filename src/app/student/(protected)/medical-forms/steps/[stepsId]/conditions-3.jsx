"use client"

import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
import { Label } from "@/components/ui/label"
import { SectionCard } from "@/components/custom/section-card"
import { YesNoSegment } from "@/components/custom/yes-no-segment"
import { Info } from 'lucide-react'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { conditions3Schema } from '@/lib/medicalForms'

const fields = [
  { key: 'prev_hay_fever', label: 'Hay fever' },
  { key: 'prev_diabetes', label: 'Diabetes' },
  { key: 'prev_eye_ear_nose', label: 'Eye, ear, or nose problems' },
  { key: 'prev_throat_trouble', label: 'Throat trouble' },
]

const Conditions3 = forwardRef(function Conditions3({ formData = {}, onFormChange = () => {}, readOnly = false }, ref) {
  const { control, handleSubmit, reset, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(conditions3Schema),
    mode: 'onChange',
    defaultValues: fields.reduce((acc, f) => ({ ...acc, [f.key]: formData[f.key] ?? false }), {})
  })

  useEffect(() => {
    reset(fields.reduce((acc, f) => ({ ...acc, [f.key]: formData[f.key] ?? false }), {}))
  }, [formData, reset])

  useImperativeHandle(ref, () => ({
    submit: () => new Promise((resolve, reject) => {
      handleSubmit(async (values) => {
        try {
          const valid = await trigger()
          if (!valid) return reject(errors)
          const cleaned = {}
          for (const f of fields) cleaned[f.key] = !!values[f.key]
          onFormChange({ ...formData, ...cleaned })
          resolve(cleaned)
        } catch (err) { reject(err) }
      }, (errs) => reject(errs))()
    })
  }))

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <SectionCard title="Previous Medical Conditions (3/6)" icon={<Info className="h-4 w-4" />}>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">Please continue indicating if you have ever had any of the following conditions:</p>
          <div className="divide-y">
            {fields.map((cond) => (
              <div key={cond.key} className="flex items-center justify-between gap-4 py-3">
                <Label className="text-sm">{cond.label}</Label>
                <Controller control={control} name={cond.key} render={({ field }) => (
                  <YesNoSegment value={!!field.value} onChange={(v) => field.onChange(!!v)} name={cond.key} disabled={readOnly} size="sm" />
                )} />
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </form>
  )
})

export default Conditions3
