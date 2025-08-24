"use client"

import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
import { Label } from "@/components/ui/label"
import { SectionCard } from "@/components/custom/section-card"
import { YesNoSegment } from "@/components/custom/yes-no-segment"
import { Syringe } from 'lucide-react'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { immunizations1Schema } from '@/lib/medicalForms'

const fields = [
  { key: 'imm_yellow_fever', label: 'Yellow fever' },
  { key: 'imm_smallpox', label: 'Smallpox' },
  { key: 'imm_typhoid', label: 'Typhoid' },
  { key: 'imm_tetanus', label: 'Tetanus' },
]

const Immunizations1 = forwardRef(function Immunizations1({ formData = {}, onFormChange = () => {}, readOnly = false }, ref) {
  const { control, handleSubmit, reset, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(immunizations1Schema),
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
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 mb-5 mt-5">
      <SectionCard title="Immunizations (Part 1)" icon={<Syringe className="h-4 w-4" />}>
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
          </div>
        </div>
      </SectionCard>
    </form>
  )
})

export default Immunizations1
