"use client"

import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {SectionCard} from "@/components/custom/section-card"
import {YesNoSegment} from "@/components/custom/yes-no-segment"
import { Stethoscope, Activity } from "lucide-react"

import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { historySectionSchema } from '@/lib/medicalForms'
// client-side validation errors are shown inline; server errors/success use toasts in parent

// Client-side schema: require general_health and ensure booleans are present
// Reuse shared server schema on the client to avoid drift
const historySchema = historySectionSchema

const History = forwardRef(function History({ formData = {}, onFormChange = () => {}, readOnly = false }, ref){
  // Initialize form with values from formData
  const { control, register, handleSubmit, watch, reset, setError, trigger, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(historySchema),
    mode: 'onChange',
    defaultValues: {
      general_health: formData.general_health ?? '',
      inpatient_admit: formData.inpatient_admit ?? false,
      inpatient_details: formData.inpatient_details ?? '',
      family_history: formData.family_history ?? '',
    }
  })

  // Keep local form in sync if parent supplies new formData
  useEffect(() => {
    reset({
      general_health: formData.general_health ?? '',
      inpatient_admit: formData.inpatient_admit ?? false,
      inpatient_details: formData.inpatient_details ?? '',
      family_history: formData.family_history ?? '',
    })
  }, [formData, reset])

  const inpatientAdmit = watch('inpatient_admit')

  // expose submit() to parent via ref
  useImperativeHandle(ref, () => ({
    submit: () => new Promise((resolve, reject) => {
      handleSubmit(async (values) => {
        try {
          // run full validation to populate all inline errors
          const valid = await trigger()
          if (!valid) {
            // reject with form errors; parent should not toast these
            return reject(errors)
          }

          // Clean and enforce rules before sending to server
          const cleaned = {}
          cleaned.general_health = values.general_health

          const admitted = !!values.inpatient_admit
          cleaned.inpatient_admit = admitted

          if (admitted) {
            const details = (values.inpatient_details || '').toString().trim()
            if (!details) {
              setError('inpatient_details', { type: 'required', message: 'Please provide inpatient admission details' })
              return reject({ inpatient_details: { message: 'Required' } })
            }
            cleaned.inpatient_details = details
          } else {
            cleaned.inpatient_details = null
          }

          const family = (values.family_history || '').toString().trim()
          if (family) cleaned.family_history = family

          onFormChange({ ...formData, ...cleaned })
          resolve(cleaned)
        } catch (err) {
          console.error('history submit error', err)
          reject(err)
        }
      }, (errs) => {
        // populate errors and reject; trigger() above should have handled most
        reject(errs)
      })()
    })
  }))

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <SectionCard 
         title="General Health"  
         icon={<Stethoscope className="h-4 w-4" />}
         className="mb-3 mt-4"
      >
        <div>
          <Label className="mb-2  block">How would you describe your general health?</Label>
              <Controller
            control={control}
            name="general_health"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={(v) => field.onChange(v)}
              >
                    {errors.general_health && (
                      <p className="text-sm mt-1 text-red-600">{errors.general_health.message}</p>
                    )}
                <SelectTrigger className="w-full focus-visible:ring-[#0077B6] cursor-pointer h-7">
                  <SelectValue placeholder="Select general health status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </SectionCard>

      <SectionCard title="Inpatient Admission" icon={<Stethoscope className="h-4 w-4" />}  className="mb-3">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Have you ever been admitted as an inpatient?</Label>
        <Controller
              control={control}
              name="inpatient_admit"
              render={({ field }) => (
                <YesNoSegment
          value={!!field.value}
          onChange={(v) => field.onChange(!!v)}
          name="inpatient_admit"
                />
              )}
            />
          </div>

              {inpatientAdmit && !readOnly && (
            <div className="mt-3">
              <Label htmlFor="inpatient_details">Please provide details about your inpatient admission(s)</Label>
              <Textarea
                id="inpatient_details"
                {...register('inpatient_details')}
                className="mt-1 focus-visible:ring-[#0077B6]"
                placeholder="Include dates, reasons, hospitals, treatments received..."
              />
                  {errors.inpatient_details && (
                    <p className="text-sm mt-1 text-red-600">{errors.inpatient_details.message}</p>
                  )}
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Family Medical History" icon={<Activity className="h-4 w-4" />}  className="mb-3">
        <div>
          <Label htmlFor="family_history">Please describe any significant medical conditions in your family</Label>
          <Textarea
            id="family_history"
            {...register('family_history')}
            readOnly={readOnly}
            className="mt-1 focus-visible:ring-[#0077B6] h-10 text-small"
            placeholder="e.g., Hypertension in parents, diabetes in grandparents, heart disease in siblings..."
          />
          {errors.family_history && (
            <p className="text-sm mt-1 text-red-600">{errors.family_history.message}</p>
          )}
        </div>
      </SectionCard>

    </form>
  )
})

export default History