"use client"

import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SectionCard } from "@/components/custom/section-card"
import { YesNoSegment } from "@/components/custom/yes-no-segment"
import { Info } from 'lucide-react'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { conditions6Schema } from '@/lib/medicalForms'

const fields = [
  { key: 'prev_ulcer', label: 'Ulcer' },
  { key: 'prev_haemorrhoids', label: 'Haemorrhoids' },
  { key: 'prev_skin_disease', label: 'Skin disease' },
  { key: 'prev_schistosomiasis', label: 'Schistosomiasis' },
]

const Conditions6 = forwardRef(function Conditions6({ formData = {}, onFormChange = () => {}, readOnly = false }, ref) {
  const { control, register, handleSubmit, reset, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(conditions6Schema),
    mode: 'onChange',
    defaultValues: fields.reduce((acc, f) => ({ ...acc, [f.key]: formData[f.key] ?? false }), { prev_other_condition: formData.prev_other_condition ?? false, prev_other_details: formData.prev_other_details ?? '' })
  })

  useEffect(() => {
    reset(fields.reduce((acc, f) => ({ ...acc, [f.key]: formData[f.key] ?? false }), { prev_other_condition: formData.prev_other_condition ?? false, prev_other_details: formData.prev_other_details ?? '' }))
  }, [formData, reset])

  useImperativeHandle(ref, () => ({
    submit: () => new Promise((resolve, reject) => {
      handleSubmit(async (values) => {
        try {
          const valid = await trigger()
          if (!valid) return reject(errors)
          const cleaned = {}
          for (const f of fields) cleaned[f.key] = !!values[f.key]
          const other = !!values.prev_other_condition
          cleaned.prev_other_condition = other
          cleaned.prev_other_details = other ? ((values.prev_other_details || '').toString().trim() || null) : null
          onFormChange({ ...formData, ...cleaned })
          resolve(cleaned)
        } catch (err) { reject(err) }
      }, (errs) => reject(errs))()
    })
  }))

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <SectionCard title="Previous Medical Conditions (6/6)" icon={<Info className="h-4 w-4" />}>
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

          <div className="pl-4 border-l-2 border-[#0077B6]/20">
            <Label htmlFor="prev_other_details">Please specify other conditions</Label>
            <Textarea id="prev_other_details" {...register('prev_other_details')} readOnly={readOnly} className="mt-1 focus-visible:ring-[#0077B6]" placeholder="Describe any other medical conditions, surgeries, or health issues..." />
            {errors.prev_other_details && <p className="text-sm mt-1 text-red-600">{errors.prev_other_details.message}</p>}
          </div>
        </div>
      </SectionCard>
    </form>
  )
})

export default Conditions6
