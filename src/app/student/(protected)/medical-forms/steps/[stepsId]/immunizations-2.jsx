"use client"

import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SectionCard } from "@/components/custom/section-card"
import { YesNoSegment } from "@/components/custom/yes-no-segment"
import { Syringe } from 'lucide-react'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { immunizations2Schema } from '@/lib/medicalForms'

const fields = [
  { key: 'imm_tuberculosis', label: 'Tuberculosis' },
  { key: 'imm_cholera', label: 'Cholera' },
  { key: 'imm_polio', label: 'Polio' },
  { key: 'imm_others', label: 'Other immunizations' },
]

const Immunizations2 = forwardRef(function Immunizations2({ formData = {}, onFormChange = () => {}, readOnly = false }, ref) {
  const { control, register, handleSubmit, reset, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(immunizations2Schema),
    mode: 'onChange',
    defaultValues: fields.reduce((acc, f) => ({ ...acc, [f.key]: formData[f.key] ?? false }), { imm_others_details: formData.imm_others_details ?? '' })
  })

  useEffect(() => {
    reset(fields.reduce((acc, f) => ({ ...acc, [f.key]: formData[f.key] ?? false }), { imm_others_details: formData.imm_others_details ?? '' }))
  }, [formData, reset])

  useImperativeHandle(ref, () => ({
    submit: () => new Promise((resolve, reject) => {
      handleSubmit(async (values) => {
        try {
          const valid = await trigger()
          if (!valid) return reject(errors)
          const cleaned = {}
          for (const f of fields) cleaned[f.key] = !!values[f.key]
          const others = !!values.imm_others
          cleaned.imm_others = others
          cleaned.imm_others_details = others ? ((values.imm_others_details || '').toString().trim() || null) : null
          onFormChange({ ...formData, ...cleaned })
          resolve(cleaned)
        } catch (err) { reject(err) }
      }, (errs) => reject(errs))()
    })
  }))

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 mb-5 mt-5">
      <SectionCard title="Immunizations (Part 2)" icon={<Syringe className="h-4 w-4" />}>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">Please indicate which immunizations you have received:</p>
          <div className="divide-y">
            {fields.map((imm) => (
              <div key={imm.key} className="flex items-center justify-between gap-4 py-3 border-b-1 border-[#0077B6]/20 ">
                <Label className="text-sm">{imm.label}</Label>
                <Controller control={control} name={imm.key} render={({ field }) => (
                  <YesNoSegment value={!!field.value} onChange={(v) => field.onChange(!!v)} name={imm.key} disabled={readOnly} size="sm" />
                )} />
              </div>
            ))}

            <div className="mt-3 pl-4 border-l-2 border-[#0077B6]/20">
              <Label htmlFor="imm_others_details">If other, please provide details</Label>
              <Textarea id="imm_others_details" {...register('imm_others_details')} readOnly={readOnly} className="mt-1 focus-visible:ring-[#0077B6]" placeholder="Describe other immunizations..." />
              {errors.imm_others_details && <p className="text-sm mt-1 text-red-600">{errors.imm_others_details.message}</p>}
            </div>
          </div>
        </div>
      </SectionCard>
    </form>
  )
})

export default Immunizations2
