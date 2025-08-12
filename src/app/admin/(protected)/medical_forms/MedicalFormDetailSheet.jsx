"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FloatingLabelInput } from "@/components/custom/floating-label-input"
import { SectionCard } from "@/components/custom/section-card"
import { YesNoSegment } from "@/components/custom/yes-no-segment"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { ShieldCheck, User2, Stethoscope, Activity, HeartPulse, Info, Syringe } from "lucide-react"

export default function MedicalFormDetailSheet({ 
  isOpen,
  onOpenChange,
  formData,
  focusStates,
  errors,
  onFormChange,
  onSelectChange,
  setFocusState,
  isFieldValid,
  onSubmit,
  saveLoading,
  readOnly = false,
  title,
}) {
  if (!formData) return null

  // wrapper for textarea/input onChange to match onFormChange signature
  const handleTextChange = (field) => (e) => onFormChange({ target: { id: field, value: e.target.value } })
  const handleSegmentChange = (val, field) => onSelectChange(val, field)
  const gender = (formData?.students?.gender || formData?.gender || '').toString().toLowerCase()

  // groups
  const previousConditions = [
    { key: 'prev_tuberculosis', label: 'Tuberculosis' },
    { key: 'prev_hypertension', label: 'Hypertension' },
    { key: 'prev_epilepsy', label: 'Epilepsy' },
    { key: 'prev_mental_illness', label: 'Mental illness' },
    { key: 'prev_cardiovascular', label: 'Cardiovascular disease' },
    { key: 'prev_arthritis', label: 'Arthritis' },
    { key: 'prev_asthma', label: 'Asthma' },
    { key: 'prev_bronchitis', label: 'Bronchitis' },
    { key: 'prev_hay_fever', label: 'Hay fever' },
    { key: 'prev_diabetes', label: 'Diabetes' },
    { key: 'prev_eye_ear_nose', label: 'Eye/Ear/Nose issues' },
    { key: 'prev_throat_trouble', label: 'Throat trouble' },
    { key: 'prev_drug_sensitivity', label: 'Drug sensitivity' },
    { key: 'prev_dysentery', label: 'Dysentery' },
    { key: 'prev_dizziness', label: 'Dizziness' },
    { key: 'prev_jaundice', label: 'Jaundice' },
    { key: 'prev_kidney_disease', label: 'Kidney disease' },
    { key: 'prev_gonorrhea', label: 'Gonorrhea' },
    { key: 'prev_parasitic_disease', label: 'Parasitic disease' },
    { key: 'prev_heart_disease', label: 'Heart disease' },
    { key: 'prev_ulcer', label: 'Ulcer' },
    { key: 'prev_haemorrhoids', label: 'Haemorrhoids' },
    { key: 'prev_skin_disease', label: 'Skin disease' },
    { key: 'prev_schistosomiasis', label: 'Schistosomiasis' },
    { key: 'prev_other_condition', label: 'Other condition' },
  ]

  const immunizations = [
    { key: 'imm_yellow_fever', label: 'Yellow fever' },
    { key: 'imm_smallpox', label: 'Smallpox' },
    { key: 'imm_typhoid', label: 'Typhoid' },
    { key: 'imm_tetanus', label: 'Tetanus' },
    { key: 'imm_tuberculosis', label: 'Tuberculosis (BCG)' },
    { key: 'imm_cholera', label: 'Cholera' },
    { key: 'imm_polio', label: 'Polio' },
    { key: 'imm_others', label: 'Others' },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className={cn("w-full sm:max-w-3xl rounded-none p-0 flex flex-col", "data-[state=open]:animate-in")} side="right">
        <div className="h-1 w-full bg-[#0077B6]" />
        <div className="sticky top-0  bg-white/90 backdrop-blur border-b">
          <SheetHeader className="px-6 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-[#0077B6]/10 p-2 text-[#0077B6]">
                  <User2 className="h-4 w-4" />
                </div>
                <div>
                  <SheetTitle className="text-xl font-extrabold text-[#0077B6]">{title || (readOnly ? "View Medical Form" : "Edit Medical Form")}</SheetTitle>
                  <SheetDescription className="text-gray-600">
                    Update medical details for <span className="font-medium text-[#0077B6]">{formData?.student_name || "the student"}</span>
                  </SheetDescription>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "shrink-0",
                  String(formData.completed) === "true"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200",
                )}
              >
                {String(formData.completed) === "true" ? "Completed" : "Pending"}
              </Badge>
            </div>
          </SheetHeader>
        </div>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <SectionCard title="Overview" icon={<ShieldCheck className="h-4 w-4" />} description="High-level status and general health.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1 block">Status</Label>
                <Select value={String(formData.completed)} onValueChange={(v) => onSelectChange(v, "completed")} disabled={readOnly}>
                  <SelectTrigger className={cn("w-full focus-visible:ring-[#0077B6]", readOnly && "opacity-60 cursor-not-allowed hover:bg-gray-50") }>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Completed</SelectItem>
                    <SelectItem value="false">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FloatingLabelInput
                id="general_health"
                label="General health status"
                type="text"
                value={formData.general_health || ""}
                onChange={onFormChange}
                disabled={readOnly}
                isFocused={focusStates.general_health || false}
                setIsFocused={(f) => setFocusState("general_health", f)}
                errors={errors.general_health}
                isValid={isFieldValid("general_health")}
              />
            </div>
          </SectionCard>

          <SectionCard title="Inpatient admission" icon={<Stethoscope className="h-4 w-4" />}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm text-muted-foreground">Admitted as inpatient?</Label>
                <YesNoSegment value={formData.inpatient_admit} onChange={handleSegmentChange} name="inpatient_admit" disabled={readOnly} />
              </div>
              <div>
                <Label htmlFor="inpatient_details">Inpatient details</Label>
                <Textarea id="inpatient_details" value={formData.inpatient_details || ""} onChange={handleTextChange("inpatient_details")} disabled={readOnly} className={cn("mt-1 focus-visible:ring-[#0077B6]", readOnly && "opacity-60 cursor-not-allowed hover:bg-gray-50 disabled:hover:bg-gray-50")} />
                {errors.inpatient_details && (<p className="mt-1 text-sm text-red-600">{errors.inpatient_details.message}</p>)}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Family medical history" icon={<Activity className="h-4 w-4" />}>
            <Label htmlFor="family_history" className="sr-only">Family medical history</Label>
            <Textarea id="family_history" value={formData.family_history || ""} onChange={handleTextChange("family_history")} disabled={readOnly} className={cn("focus-visible:ring-[#0077B6]", readOnly && "opacity-60 cursor-not-allowed hover:bg-gray-50 disabled:hover:bg-gray-50")} placeholder="e.g., Hypertension in parents, diabetes in grandparents…" />
            {errors.family_history && <p className="mt-1 text-sm text-red-600">{errors.family_history.message}</p>}
          </SectionCard>

          {/* Collapsible sections per new UI */}
          <Accordion type="multiple" defaultValue={["prev", "life", ...(gender === "female" ? ["female"] : []), "breast", "imm"]} className="space-y-4">
            <AccordionItem value="prev" className="border border-[#0077B6]/20 rounded-xl px-2">
              <AccordionTrigger className="px-4">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#0077B6]" />
                  <span className="font-semibold text-[#0b3c5d]">Previous medical conditions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-4">
                <div className="divide-y">
                  {previousConditions.map((c) => (
                    <div key={c.key} className="grid grid-cols-1 items-center gap-2 py-3 sm:grid-cols-[1fr,auto]">
                      <Label className="text-sm">{c.label}</Label>
                      <div className="sm:justify-self-end">
                        <YesNoSegment value={formData[c.key]} onChange={handleSegmentChange} name={c.key} disabled={readOnly} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
                {formData.prev_other_condition && (
                  <div className="mt-4">
                    <Label htmlFor="prev_other_details">Other condition details</Label>
                    <Textarea id="prev_other_details" value={formData.prev_other_details || ""} onChange={handleTextChange("prev_other_details")} disabled={readOnly} className={cn("mt-1 focus-visible:ring-[#0077B6]", readOnly && "opacity-60 cursor-not-allowed hover:bg-gray-50 disabled:hover:bg-gray-50")} />
                    {errors.prev_other_details && (<p className="mt-1 text-sm text-red-600">{errors.prev_other_details.message}</p>)}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="life" className="border border-[#0077B6]/20 rounded-xl px-2">
              <AccordionTrigger className="px-4">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-[#0077B6]" />
                  <span className="font-semibold text-[#0b3c5d]">Lifestyle</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-4">
                <div className="divide-y">
                  <div className="grid grid-cols-1 items-center gap-2 py-3 sm:grid-cols-[1fr,auto]">
                    <Label className="text-sm">Smokes?</Label>
                    <div className="sm:justify-self-end">
                      <YesNoSegment value={formData.smoke} onChange={handleSegmentChange} name="smoke" disabled={readOnly} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 items-center gap-2 py-3 sm:grid-cols-[1fr,auto]">
                    <Label className="text-sm">Consumes alcohol?</Label>
                    <div className="sm:justify-self-end">
                      <YesNoSegment value={formData.alcohol} onChange={handleSegmentChange} name="alcohol" disabled={readOnly} />
                    </div>
                  </div>
                </div>

                {formData.alcohol && (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FloatingLabelInput id="alcohol_since" label="Alcohol since (year or age)" type="text" value={formData.alcohol_since || ""} onChange={onFormChange} disabled={readOnly} isFocused={focusStates.alcohol_since || false} setIsFocused={(f) => setFocusState("alcohol_since", f)} errors={errors.alcohol_since} isValid={isFieldValid("alcohol_since")} />
                    <FloatingLabelInput id="alcohol_qty_per_day" label="Alcohol quantity per day" type="text" value={formData.alcohol_qty_per_day || ""} onChange={onFormChange} disabled={readOnly} isFocused={focusStates.alcohol_qty_per_day || false} setIsFocused={(f) => setFocusState("alcohol_qty_per_day", f)} errors={errors.alcohol_qty_per_day} isValid={isFieldValid("alcohol_qty_per_day")} />
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="leisure_activities">Leisure activities</Label>
                    <Textarea id="leisure_activities" value={formData.leisure_activities || ""} onChange={handleTextChange("leisure_activities")} disabled={readOnly} className={cn("mt-1 focus-visible:ring-[#0077B6]", readOnly && "opacity-60 cursor-not-allowed hover:bg-gray-50 disabled:hover:bg-gray-50")} />
                  </div>
                  <div>
                    <Label htmlFor="current_treatments">Current treatments</Label>
                    <Textarea id="current_treatments" value={formData.current_treatments || ""} onChange={handleTextChange("current_treatments")} disabled={readOnly} className={cn("mt-1 focus-visible:ring-[#0077B6]", readOnly && "opacity-60 cursor-not-allowed hover:bg-gray-50 disabled:hover:bg-gray-50")} />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {gender === "female" && (
              <AccordionItem value="female" className="border border-[#0077B6]/20 rounded-xl px-2">
                <AccordionTrigger className="px-4">
                  <div className="flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-[#0077B6]" />
                    <span className="font-semibold text-[#0b3c5d]">Menstrual history</span>
                    <Badge className="ml-2 bg-[#0077B6] hover:bg-[#00629a]">Female</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr,auto]">
                      <Label className="text-sm">Regular?</Label>
                      <div className="sm:justify-self-end">
                        <YesNoSegment value={formData.menses_regular} onChange={handleSegmentChange} name="menses_regular" disabled={readOnly} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr,auto]">
                      <Label className="text-sm">Painful?</Label>
                      <div className="sm:justify-self-end">
                        <YesNoSegment value={formData.menses_painful} onChange={handleSegmentChange} name="menses_painful" disabled={readOnly} />
                      </div>
                    </div>
                    <FloatingLabelInput id="menses_duration_days" label="Duration (days)" type="number" value={formData.menses_duration_days || ""} onChange={onFormChange} disabled={readOnly} isFocused={focusStates.menses_duration_days || false} setIsFocused={(f) => setFocusState("menses_duration_days", f)} errors={errors.menses_duration_days} isValid={isFieldValid("menses_duration_days")} />
                    <FloatingLabelInput id="last_period_date" label="Last period date" type="date" value={formData.last_period_date || ""} onChange={onFormChange} disabled={readOnly} isFocused={focusStates.last_period_date || false} setIsFocused={(f) => setFocusState("last_period_date", f)} errors={errors.last_period_date} isValid={isFieldValid("last_period_date")} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="breast" className="border border-[#0077B6]/20 rounded-xl px-2">
              <AccordionTrigger className="px-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#0077B6]" />
                  <span className="font-semibold text-[#0b3c5d]">Breast/Sexual disease</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-4">
                <div className="grid grid-cols-1 items-center gap-2 py-3 sm:grid-cols-[1fr,auto]">
                  <Label className="text-sm">Has disease?</Label>
                  <div className="sm:justify-self-end">
                    <YesNoSegment value={formData.breast_sexual_disease} onChange={handleSegmentChange} name="breast_sexual_disease" disabled={readOnly} />
                  </div>
                </div>
                {gender === "female" && formData.breast_sexual_disease && (
                  <div className="mt-2">
                    <Label htmlFor="breast_sexual_details">Details</Label>
                    <Textarea id="breast_sexual_details" value={formData.breast_sexual_details || ""} onChange={handleTextChange("breast_sexual_details")} disabled={readOnly} className={cn("mt-1 focus-visible:ring-[#0077B6]", readOnly && "opacity-60 cursor-not-allowed hover:bg-gray-50 disabled:hover:bg-gray-50")} />
                    {errors.breast_sexual_details && (<p className="mt-1 text-sm text-red-600">{errors.breast_sexual_details.message}</p>)}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="imm" className="border border-[#0077B6]/20 rounded-xl px-2">
              <AccordionTrigger className="px-4">
                <div className="flex items-center gap-2">
                  <Syringe className="h-4 w-4 text-[#0077B6]" />
                  <span className="font-semibold text-[#0b3c5d]">Immunizations</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-4">
                <div className="divide-y">
                  {immunizations.map((imm) => (
                    <div key={imm.key} className="grid grid-cols-1 items-center gap-2 py-3 sm:grid-cols-[1fr,auto]">
                      <Label className="text-sm">{imm.label}</Label>
                      <div className="sm:justify-self-end">
                        <YesNoSegment value={formData[imm.key]} onChange={handleSegmentChange} name={imm.key} disabled={readOnly} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
                {formData.imm_others && (
                  <div className="mt-4">
                    <Label htmlFor="imm_others_details">Other immunizations details</Label>
                    <Textarea id="imm_others_details" value={formData.imm_others_details || ""} onChange={handleTextChange("imm_others_details")} disabled={readOnly} className={cn("mt-1 focus-visible:ring-[#0077B6]", readOnly && "opacity-60 cursor-not-allowed hover:bg-gray-50 disabled:hover:bg-gray-50")} />
                    {errors.imm_others_details && (<p className="mt-1 text-sm text-red-600">{errors.imm_others_details.message}</p>)}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator />

          {!readOnly && (
            <div className="pt-2">
              <Button type="submit" disabled={saveLoading} className="w-full bg-[#0077B6] hover:bg-[#00629a] text-white cursor-pointer h-13">
                {saveLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </form>

        <SheetFooter className="border-t bg-white px-6 py-3">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="text-xs text-gray-500">Secure and confidential</div>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6]/10 hover:text-[#0077B6] cursor-pointer">
              Close
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
