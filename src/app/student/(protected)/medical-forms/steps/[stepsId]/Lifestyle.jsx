"use client"

import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FloatingLabelInput } from '@/components/custom/floating-label-input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ChevronDown as ChevronDownIcon } from 'lucide-react'
import { SectionCard } from "@/components/custom/section-card"
import { YesNoSegment } from "@/components/custom/yes-no-segment"
import { HeartPulse, Activity } from 'lucide-react'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lifestyleSectionSchema } from '@/lib/medicalForms'

const Lifestyle = forwardRef(function Lifestyle({ formData = {}, onFormChange = () => {}, readOnly = false }, ref) {
  const { control, register, handleSubmit, watch, reset, setError, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(lifestyleSectionSchema),
    mode: 'onChange',
    defaultValues: {
      smoke: formData.smoke ?? false,
      alcohol: formData.alcohol ?? false,
      alcohol_since: formData.alcohol_since ?? '',
      alcohol_qty_per_day: formData.alcohol_qty_per_day ?? '',
      leisure_activities: formData.leisure_activities ?? '',
      current_treatments: formData.current_treatments ?? '',
    }
  })

  useEffect(() => {
    reset({
      smoke: formData.smoke ?? false,
      alcohol: formData.alcohol ?? false,
      alcohol_since: formData.alcohol_since ?? '',
      alcohol_qty_per_day: formData.alcohol_qty_per_day ?? '',
      leisure_activities: formData.leisure_activities ?? '',
      current_treatments: formData.current_treatments ?? '',
    })
  }, [formData, reset])

  const alcoholValue = watch('alcohol')

  useImperativeHandle(ref, () => ({
    submit: () => new Promise((resolve, reject) => {
      handleSubmit(async (values) => {
        try {
          const valid = await trigger()
          if (!valid) return reject(errors)

          const cleaned = {}
          cleaned.smoke = !!values.smoke
          const alcohol = !!values.alcohol
          cleaned.alcohol = alcohol

          if (alcohol) {
            const since = (values.alcohol_since || '').toString().trim()
            if (!since) {
              setError('alcohol_since', { type: 'required', message: 'Please provide when you started consuming alcohol' })
              return reject({ alcohol_since: { message: 'Required' } })
            }
            cleaned.alcohol_since = since
            const qty = (values.alcohol_qty_per_day || '').toString().trim()
            cleaned.alcohol_qty_per_day = qty || null
          } else {
            cleaned.alcohol_since = null
            cleaned.alcohol_qty_per_day = null
          }

          const leisure = (values.leisure_activities || '').toString().trim()
          cleaned.leisure_activities = leisure || null

          const treatments = (values.current_treatments || '').toString().trim()
          cleaned.current_treatments = treatments || null

          onFormChange({ ...formData, ...cleaned })
          resolve(cleaned)
        } catch (err) {
          console.error('lifestyle submit error', err)
          reject(err)
        }
      }, (errs) => reject(errs))()
    })
  }))

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <div className="space-y-6 mt-4">
        <SectionCard title="Lifestyle Habits" icon={<HeartPulse className="h-4 w-4" />} className="mb-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 py-2 border-b">
              <Label className="text-sm">Do you smoke?</Label>
              <Controller
                control={control}
                name="smoke"
                render={({ field }) => (
                  <YesNoSegment value={!!field.value} onChange={(v) => field.onChange(!!v)} name="smoke" disabled={readOnly} />
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 py-2 border-b">
                <Label className="text-sm">Do you consume alcohol?</Label>
                <Controller
                  control={control}
                  name="alcohol"
                  render={({ field }) => (
                    <YesNoSegment value={!!field.value} onChange={(v) => field.onChange(!!v)} name="alcohol" disabled={readOnly} />
                  )}
                />
              </div>

              {alcoholValue && !readOnly && (
                <div className="grid grid-cols-1 mt-3 gap-4 sm:grid-cols-2 p-4 border-l-2 border-[#0077B6]/20">
                  <Controller
                    control={control}
                    name="alcohol_since"
                    render={({ field }) => {
                      const selected = field.value ? new Date(field.value) : undefined
                      return (
                        <div className="flex flex-col gap-2">
                          <Label className="text-sm">Since when (date/age)</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between font-normal h-14"
                                id="alcohol_since"
                                disabled={readOnly}
                              >
                                {selected ? selected.toLocaleDateString() : 'Select date'}
                                <ChevronDownIcon className="ml-2 h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto bg-white  overflow-hidden p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={selected}
                                captionLayout="dropdown"
                                onSelect={(d) => {
                                  if (!d) {
                                    field.onChange('')
                                    return
                                  }
                                  // store as YYYY-MM-DD to match previous string/date usage
                                  const iso = d.toISOString().split('T')[0]
                                  field.onChange(iso)
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                          {errors.alcohol_since && (
                            <p className="text-sm text-red-600">{errors.alcohol_since.message}</p>
                          )}
                        </div>
                      )
                    }}
                  />

                  <FloatingLabelInput
                    id="alcohol_qty_per_day"
                    label="Quantity per day"
                    type="text"
                    register={register('alcohol_qty_per_day')}
                    watchedValue={watch('alcohol_qty_per_day')}
                    errors={errors.alcohol_qty_per_day}
                    isFocused={false}
                    setIsFocused={() => {}}
                    disabled={readOnly}
                  />
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Activities & Current Treatments" icon={<Activity className="h-4 w-4" />} className="mb-2">
          <div className="space-y-4">
            <div className="mb-2">
              <Label htmlFor="leisure_activities">Leisure activities and hobbies</Label>
              <Textarea
                id="leisure_activities"
                {...register('leisure_activities')}
                readOnly={readOnly}
                className="mt-1 focus-visible:ring-[#0077B6]"
                placeholder="Sports, exercise, hobbies, recreational activities..."
              />
            </div>
            <div>
              <Label htmlFor="current_treatments">Current treatments or medications</Label>
              <Textarea
                id="current_treatments"
                {...register('current_treatments')}
                readOnly={readOnly}
                className="mt-1 focus-visible:ring-[#0077B6]"
                placeholder="List any medications, treatments, or therapies you're currently receiving..."
              />
            </div>
          </div>
        </SectionCard>
      </div>
    </form>
  )
})

export default Lifestyle
