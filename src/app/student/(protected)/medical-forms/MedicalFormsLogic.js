'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import STUDENT_ENDPOINTS from '@/config/studentConfig'
import { getApiErrorMessage } from '@/lib/api/client'

export const SECTION_ORDER = [
  'history','lifestyle','womens-health',
  'conditions-1','conditions-2','conditions-3',
  'conditions-4','conditions-5','conditions-6',
  'immunizations-1','immunizations-2'
]

export const FORM_STEPS = SECTION_ORDER.map((id) => ({
  id,
  title: {
    history: "Medical History",
    lifestyle: "Lifestyle",
    'womens-health': "Women's Health",
    'conditions-1': "Previous Conditions (1/6)",
    'conditions-2': "Previous Conditions (2/6)",
    'conditions-3': "Previous Conditions (3/6)",
    'conditions-4': "Previous Conditions (4/6)",
    'conditions-5': "Previous Conditions (5/6)",
    'conditions-6': "Previous Conditions (6/6)",
    'immunizations-1': "Immunizations (1/2)",
    'immunizations-2': "Immunizations (2/2)",
  }[id],
  completed: false,
}))

/**
 * Minimal helper utilities
 */
const pick = (obj = {}, keys = []) => {
  const out = {}
  for (const k of keys) if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k]
  return out
}
const emptyToNull = (obj = {}) => {
  const out = {}
  for (const [k,v] of Object.entries(obj)) out[k] = (typeof v === 'string' ? (v.trim() === '' ? null : v.trim()) : v)
  return out
}
const removeUndefined = (obj = {}) => {
  const out = {}
  for (const [k,v] of Object.entries(obj)) if (v !== undefined) out[k] = v
  return out
}
const enforceDeps = (payload) => {
  const copy = { ...payload }
  if ('inpatient_admit' in copy && copy.inpatient_admit !== true) copy.inpatient_details = null
  if ('alcohol' in copy && copy.alcohol !== true) { copy.alcohol_since = null; copy.alcohol_qty_per_day = null }
  if ('breast_sexual_disease' in copy && copy.breast_sexual_disease !== true) copy.breast_sexual_details = null
  if ('prev_other_condition' in copy && copy.prev_other_condition !== true) copy.prev_other_details = null
  if ('imm_others' in copy && copy.imm_others !== true) copy.imm_others_details = null
  return copy
}

/**
 * useMedicalFormSegment
 * - initialData: optional { student }
 * - sectionComponents: optional map { sectionId: ReactComponent }
 */
export default function MedicalFormLogic(initialData = {}, sectionComponents = {}) {
  const [student, setStudent] = useState(initialData?.student ?? null)
  const [loading, setLoading] = useState(!initialData?.student)
  const [error, setError] = useState(null)
  const [currentSection, setCurrentSection] = useState(SECTION_ORDER[0])
  const [filteredSteps, setFilteredSteps] = useState(FORM_STEPS)
  const [saving, setSaving] = useState(false)

  const submitFnRef = useRef(null)

  // load student if not provided
  useEffect(() => {
    let mounted = true
    if (initialData?.student) {
      const s = initialData.student
      setStudent(s)
      const stepNumber = Number(s?.medical_form_status?.current_step ?? 0)
      setCurrentSection(SECTION_ORDER[stepNumber] ?? SECTION_ORDER[0])
      if ((s.gender || '').toLowerCase() === 'male') setFilteredSteps(FORM_STEPS.filter(s => s.id !== 'womens-health'))
      else setFilteredSteps(FORM_STEPS)
      setLoading(false)
      return
    }

    ;(async () => {
      try {
        setLoading(true)
        const res = await axios.get(STUDENT_ENDPOINTS.DASHBOARD)
        if (!mounted) return
        if (res?.status === 200 && res.data) {
          setStudent(res.data)
          const stepNumber = Number(res.data?.medical_form_status?.current_step ?? 0)
          setCurrentSection(SECTION_ORDER[stepNumber] ?? SECTION_ORDER[0])
          if ((res.data.gender || '').toLowerCase() === 'male') setFilteredSteps(FORM_STEPS.filter(s => s.id !== 'womens-health'))
          else setFilteredSteps(FORM_STEPS)
        } else {
          setError('Failed to fetch student')
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to fetch student'))
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [initialData])

  // get default values for a section (pull from student object where sensible)
  const getSectionDefaultValues = useCallback((sectionId) => {
    // naive defaults: null for all keys — child components handle their own fields
    return {}
  }, [])

  // saveSection: client does minimal cleanup, server does validation
  // returns structured result: { success: true, nextSection, completed } or { success:false, issues:[{path:[],message}], status }
  const saveSection = useCallback(async (sectionId, rawValues, allowedKeys = null) => {
    setSaving(true)
    try {
      // If caller passes allowedKeys, pick them; otherwise send everything except control fields
      const payloadBase = allowedKeys ? pick(rawValues || {}, allowedKeys) : { ...rawValues }
      let payload = emptyToNull(payloadBase)
      payload = enforceDeps(payload)
      payload = removeUndefined(payload)

      const serverPayload = { section: sectionId, ...payload }
      const res = await axios.post(STUDENT_ENDPOINTS.MEDICAL_FORMS, serverPayload)

      if (res.status !== 200 && res.status !== 201) {
        return { success: false, issues: [{ message: res.data?.error || 'Server rejected' }], status: res.status }
      }

      // server may return nextSection/completed
      if (res.data?.nextSection) setCurrentSection(res.data.nextSection)
      else if (res.data?.completed) setCurrentSection(null)

      return { success: true, nextSection: res.data?.nextSection ?? null, completed: !!res.data?.completed }
    } catch (err) {
      const body = err?.response?.data
      if (body && Array.isArray(body.issues)) {
        const issues = body.issues.map(it =>
          typeof it === 'string'
            ? { path: [it.split(':')[0].trim()], message: it.split(':').slice(1).join(':').trim() }
            : { path: it.path || [], message: it.message || String(it) }
        )
        return { success: false, issues, status: err?.response?.status }
      }
      if (err?.response?.status === 409) {
        return { success: false, issues: [{ message: 'Conflict: concurrent update' }], status: 409 }
      }
      const message = getApiErrorMessage(err, 'Failed to submit section')
      toast.error(message)
      return { success: false, issues: [{ message }], status: err?.response?.status ?? 500 }
    } finally {
      setSaving(false)
    }
  }, [])

  // children can register a submit function (no zod/react-hook-form required)
  const registerCurrentSubmit = useCallback((submitFn) => {
    submitFnRef.current = submitFn
    return () => { if (submitFnRef.current === submitFn) submitFnRef.current = null }
  }, [])

  // parent Next triggers child submit if registered, else advance locally
  const handleNext = useCallback(async () => {
    setSaving(true)
    try {
      if (typeof submitFnRef.current === 'function') {
        const result = await submitFnRef.current()
        if (!result || !result.success) {
          // display main message or first issue
          if (result?.status === 409) toast.error('Conflict: another update happened — refresh or retry.')
          else {
            const message = result?.issues?.[0]?.message || 'Failed to save section'
            toast.error(message)
          }
          return
        }
        // success: child or saveSection already moved currentSection as needed
        return
      }
      // no registered submit: just go to next UI step if possible
      const idx = filteredSteps.findIndex(s => s.id === currentSection)
      if (idx >= 0 && idx < filteredSteps.length - 1) setCurrentSection(filteredSteps[idx + 1].id)
    } finally {
      setSaving(false)
    }
  }, [currentSection, filteredSteps])

  const handlePrevious = useCallback(() => {
    const idx = filteredSteps.findIndex(s => s.id === currentSection)
    if (idx > 0) setCurrentSection(filteredSteps[idx - 1].id)
  }, [currentSection, filteredSteps])

  // render current step using provided components map
  const renderCurrentStep = useCallback(() => {
    const Component = sectionComponents?.[currentSection] ?? null
    if (!Component) return null
    const props = {
      defaultValues: getSectionDefaultValues(currentSection),
      registerCurrentSubmit,
      saveSection,
      sectionId: currentSection,
    }
    return (Component ? <Component {...props} /> : null)
  }, [sectionComponents, currentSection, getSectionDefaultValues, registerCurrentSubmit, saveSection])

  const currentIndex = filteredSteps.findIndex(s => s.id === currentSection)
  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === filteredSteps.length - 1
  const progressPercentage = Math.round(((Math.max(0, currentIndex) + 1) / filteredSteps.length) * 100)

  return {
    student,
    loading,
    error,
    currentSection,
    filteredSteps,
    saving,

    getSectionDefaultValues,
    saveSection,
    registerCurrentSubmit,

    renderCurrentStep,
    handleNext,
    handlePrevious,

    currentIndex,
    isFirstStep,
    isLastStep,
    progressPercentage,

    setCurrentSection
  }
}
