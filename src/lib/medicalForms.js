import { z } from 'zod'

export const SECTION_ORDER = [
  'history',
  'lifestyle',
  'womens-health',
  'conditions-1',
  'conditions-2',
  'conditions-3',
  'conditions-4',
  'conditions-5',
  'conditions-6',
  'immunizations-1',
  'immunizations-2',
]

export const parseBoolean = (rawValue) => {
  if (typeof rawValue === 'boolean') return rawValue
  if (typeof rawValue === 'string') {
    const lower = rawValue.toLowerCase().trim()
    if (['true', '1', 'yes'].includes(lower)) return true
    if (['false', '0', 'no'].includes(lower)) return false
  }
  return undefined
}

export const parseInteger = (rawValue) => {
  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) return Math.floor(rawValue)
  if (typeof rawValue === 'string' && rawValue.trim() !== '') {
    const parsedInteger = Number.parseInt(rawValue, 10)
    return Number.isNaN(parsedInteger) ? undefined : parsedInteger
  }
  return undefined
}

export const formatDateToISO = (rawValue) => {
  if (!rawValue) return undefined
  const date = new Date(rawValue)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString().slice(0, 10)
}

/* -------------------- Section schemas (zod) -------------------- */
export const historySectionSchema = z.object({
  // allow nullability to match client-side form where field may be null
  general_health: z.enum(['Good', 'Fair', 'Poor']).optional().nullable(),
  inpatient_admit: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  inpatient_details: z.string().nullable().optional(),
  family_history: z.string().nullable().optional(),
})

export const lifestyleSectionSchema = z.object({
  smoke: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  alcohol: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  alcohol_since: z.string().optional().transform((v) => formatDateToISO(v)),
  alcohol_qty_per_day: z.union([z.string(), z.number()]).nullable().optional(),
  leisure_activities: z.string().nullable().optional(),
  current_treatments: z.string().nullable().optional(),
})

export const womensHealthSectionSchema = z.object({
  menses_regular: z.boolean().nullable().optional().transform((v) => (v === undefined ? undefined : parseBoolean(v))),
  menses_painful: z.boolean().nullable().optional().transform((v) => (v === undefined ? undefined : parseBoolean(v))),
  menses_duration_days: z.number().int().nullable().optional().transform((v) => (v === undefined ? undefined : parseInteger(v))),
  last_period_date: z.string().nullable().optional().transform((v) => (v ? formatDateToISO(v) : undefined)),
  breast_sexual_disease: z.boolean().nullable().optional().transform((v) => (v === undefined ? undefined : parseBoolean(v))),
  breast_sexual_details: z.string().nullable().optional(),
})

export const conditions1Schema = z.object({
  prev_tuberculosis: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_hypertension: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_epilepsy: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_mental_illness: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
})

export const conditions2Schema = z.object({
  prev_cardiovascular: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_arthritis: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_asthma: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_bronchitis: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
})

export const conditions3Schema = z.object({
  prev_hay_fever: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_diabetes: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_eye_ear_nose: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_throat_trouble: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
})

export const conditions4Schema = z.object({
  prev_drug_sensitivity: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_dysentery: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_dizziness: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_jaundice: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
})

export const conditions5Schema = z.object({
  prev_kidney_disease: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_gonorrhea: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_parasitic_disease: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_heart_disease: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
})

export const conditions6Schema = z.object({
  prev_ulcer: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_haemorrhoids: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_skin_disease: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_schistosomiasis: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_other_condition: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_other_details: z.string().nullable().optional(),
})

export const immunizations1Schema = z.object({
  imm_yellow_fever: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_smallpox: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_typhoid: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_tetanus: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
})

export const immunizations2Schema = z.object({
  imm_tuberculosis: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_cholera: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_polio: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_others: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_others_details: z.string().nullable().optional(),
})

export const SECTION_SCHEMAS = {
  history: historySectionSchema,
  lifestyle: lifestyleSectionSchema,
  'womens-health': womensHealthSectionSchema,
  'conditions-1': conditions1Schema,
  'conditions-2': conditions2Schema,
  'conditions-3': conditions3Schema,
  'conditions-4': conditions4Schema,
  'conditions-5': conditions5Schema,
  'conditions-6': conditions6Schema,
  'immunizations-1': immunizations1Schema,
  'immunizations-2': immunizations2Schema,
}
