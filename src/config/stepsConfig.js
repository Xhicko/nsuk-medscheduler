export const FORM_STEP_IDS = [
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

// Helper that maps index -> id safely
export function getStepIdByIndex(index) {
  const indexNumber = Number(index)
  if (Number.isNaN(indexNumber) || indexNumber < 0 || indexNumber >= FORM_STEP_IDS.length) return FORM_STEP_IDS[0]
  return FORM_STEP_IDS[indexNumber]
}