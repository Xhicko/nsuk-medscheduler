"use client"

import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FloatingLabelInput } from '@/components/custom/floating-label-input'
import { SectionCard } from "@/components/custom/section-card"
import { YesNoSegment } from "@/components/custom/yes-no-segment"
import { Heart } from 'lucide-react'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { womensHealthSectionSchema } from '@/lib/medicalForms'

const WomensHealth = forwardRef(function WomensHealth({ formData = {}, onFormChange = () => {}, readOnly = false }, ref) {
  const { control, register, handleSubmit, watch, reset, setError, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(womensHealthSectionSchema),
    mode: 'onChange',
    defaultValues: {
      menses_regular: formData.menses_regular ?? undefined,
      menses_painful: formData.menses_painful ?? undefined,
      menses_duration_days: formData.menses_duration_days ?? '',
      last_period_date: formData.last_period_date ?? '',
      breast_sexual_disease: formData.breast_sexual_disease ?? undefined,
      breast_sexual_details: formData.breast_sexual_details ?? '',
    }
  })

  useEffect(() => {
    reset({
      menses_regular: formData.menses_regular ?? undefined,
      menses_painful: formData.menses_painful ?? undefined,
      menses_duration_days: formData.menses_duration_days ?? '',
      last_period_date: formData.last_period_date ?? '',
      breast_sexual_disease: formData.breast_sexual_disease ?? undefined,
      breast_sexual_details: formData.breast_sexual_details ?? '',
    })
  }, [formData, reset])

  const breastValue = watch('breast_sexual_disease')

  useImperativeHandle(ref, () => ({
    submit: () => new Promise((resolve, reject) => {
      handleSubmit(async (values) => {
        try {
          const valid = await trigger()
          if (!valid) return reject(errors)

          const cleaned = {}
          cleaned.menses_regular = values.menses_regular === undefined ? undefined : !!values.menses_regular
          cleaned.menses_painful = values.menses_painful === undefined ? undefined : !!values.menses_painful

          const dur = (values.menses_duration_days || '').toString().trim()
          cleaned.menses_duration_days = dur === '' ? null : Number(dur)

          cleaned.last_period_date = (values.last_period_date || '').toString().trim() || null

          cleaned.breast_sexual_disease = values.breast_sexual_disease === undefined ? undefined : !!values.breast_sexual_disease
          if (cleaned.breast_sexual_disease) {
            const details = (values.breast_sexual_details || '').toString().trim()
            if (!details) {
              setError('breast_sexual_details', { type: 'required', message: 'Please provide details' })
              return reject({ breast_sexual_details: { message: 'Required' } })
            }
            cleaned.breast_sexual_details = details
          } else {
            cleaned.breast_sexual_details = null
          }

          onFormChange({ ...formData, ...cleaned })
          resolve(cleaned)
        } catch (err) {
          reject(err)
        }
      }, (errs) => reject(errs))()
    })
  }))

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <div className="space-y-6">
        <SectionCard title="Menstrual History (For Females)" icon={<Heart className="h-4 w-4" />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 py-2 border-b">
              <Label className="text-sm">Are your periods regular?</Label>
              <Controller control={control} name="menses_regular" render={({ field }) => (
                <YesNoSegment value={!!field.value} onChange={(v) => field.onChange(!!v)} name="menses_regular" disabled={readOnly} />
              )} />
            </div>

            <div className="flex items-center justify-between gap-4 py-2 border-b">
              <Label className="text-sm">Are your periods painful?</Label>
              <Controller control={control} name="menses_painful" render={({ field }) => (
                <YesNoSegment value={!!field.value} onChange={(v) => field.onChange(!!v)} name="menses_painful" disabled={readOnly} />
              )} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FloatingLabelInput id="menses_duration_days" label="Duration (days)" type="number" register={register('menses_duration_days')} watchedValue={watch('menses_duration_days')} errors={errors.menses_duration_days} isFocused={false} setIsFocused={() => {}} disabled={readOnly} />
              <FloatingLabelInput id="last_period_date" label="Last period date" type="date" register={register('last_period_date')} watchedValue={watch('last_period_date')} errors={errors.last_period_date} isFocused={false} setIsFocused={() => {}} disabled={readOnly} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Breast & Sexual Health" icon={<Heart className="h-4 w-4" />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 py-2 border-b">
              <Label className="text-sm">Any breast or sexual health concerns?</Label>
              <Controller control={control} name="breast_sexual_disease" render={({ field }) => (
                <YesNoSegment value={!!field.value} onChange={(v) => field.onChange(!!v)} name="breast_sexual_disease" disabled={readOnly} />
              )} />
            </div>
            {breastValue && (
              <div className="pl-4 border-l-2 border-[#0077B6]/20">
                <Label htmlFor="breast_sexual_details">Please provide details</Label>
                <Textarea id="breast_sexual_details" {...register('breast_sexual_details')} readOnly={readOnly} className="mt-1 focus-visible:ring-[#0077B6]" placeholder="Describe any concerns or conditions..." />
                {errors.breast_sexual_details && <p className="text-sm mt-1 text-red-600">{errors.breast_sexual_details.message}</p>}
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </form>
  )
})

export default WomensHealth
