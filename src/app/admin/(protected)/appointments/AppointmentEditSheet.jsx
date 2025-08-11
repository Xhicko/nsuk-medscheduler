"use client"

import { useMemo, useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { DatePickerWithTime } from './date-picker-with-time'
import { Loader2 } from 'lucide-react'

function addMinutesToTimeString(timeStr, minutesToAdd = 30) {
  if (!timeStr) return ''
  const [h, m] = String(timeStr).split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return ''
  const base = new Date()
  base.setHours(h || 0, m || 0, 0, 0)
  base.setMinutes(base.getMinutes() + minutesToAdd)
  const hh = String(base.getHours()).padStart(2, '0')
  const mm = String(base.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function formatRangePreview(date, start, end) {
  if (!date || !start || !end) return ''
  try {
    const dateStr = date.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    return `${dateStr} • ${start} – ${end}`
  } catch {
    return ''
  }
}

export default function AppointmentEditSheet({
  isOpen,
  onOpenChange,
  student, // { id, fullName, matricNumber, department, faculty }
  initialRange, // { date, start, end }
  onReschedule, // async (student, date, start, end)
  onMarkMissed, // async ()
  onRevertPending, // async ()
  loadingAction = null, // 'reschedule' | 'missed' | 'pending' | null
}) {
  const [selectedDate, setSelectedDate] = useState(initialRange?.date || null)
  const [selectedTime, setSelectedTime] = useState(initialRange?.start || '')

  const endTime = useMemo(() => addMinutesToTimeString(selectedTime, 30), [selectedTime])
  const disabled = loadingAction !== null
  const canSubmit = useMemo(() => Boolean(selectedDate && selectedTime && endTime), [selectedDate, selectedTime, endTime])

  const handleReschedule = async () => {
    if (!canSubmit) return
    await onReschedule?.(student, selectedDate, selectedTime, endTime)
  }

  const currentPreview = formatRangePreview(initialRange?.date, initialRange?.start, initialRange?.end)
  const newPreview = formatRangePreview(selectedDate, selectedTime, endTime)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!disabled) onOpenChange?.(open) }}>
      <SheetContent side="right" className="sm:max-w-lg p-0">
        <div className="flex flex-col h-full">
          <div className="px-6 pt-5 pb-4 border-b">
            <SheetHeader>
              <SheetTitle>Update Appointment</SheetTitle>
              <SheetDescription>
                {student ? `Edit appointment for ${student.fullName} (${student.matricNumber})` : 'Edit appointment'}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
            {/* Student summary */}
            <div className="rounded-xl border bg-white">
              <div className="p-4 grid grid-cols-2 gap-y-2 text-sm text-gray-700">
                <div className="font-medium">Student</div>
                <div className="truncate">{student?.fullName || '—'}</div>
                <div className="font-medium">Matric</div>
                <div className="truncate">{student?.matricNumber || '—'}</div>
                <div className="font-medium">Faculty</div>
                <div className="truncate">{student?.faculty || '—'}</div>
                <div className="font-medium">Department</div>
                <div className="truncate">{student?.department || '—'}</div>
              </div>
              {currentPreview && (
                <div className="px-4 py-2 border-t text-xs text-gray-600 bg-gray-50">
                  Current: {currentPreview}
                </div>
              )}
            </div>

            {/* Picker */}
            <div className="rounded-xl border p-4">
              <DatePickerWithTime
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
              />
              {newPreview && (
                <div className="mt-3 text-sm text-gray-700">
                  New time: <span className="font-medium">{newPreview}</span>
                </div>
              )}
              <div className="mt-3 rounded-lg border bg-blue-50 text-blue-800 text-xs p-3">
                The student will be notified via email about any changes you apply here.
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t bg-white">
            <div className="grid grid-cols-1 gap-2">
              <Button
                className="w-full h-11 bg-[#0077B6] hover:bg-[#0077B6]/90 cursor-pointer"
                onClick={handleReschedule}
                disabled={!canSubmit || disabled}
              >
                {loadingAction === 'reschedule' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Reschedule
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 border-red-600 text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={() => onMarkMissed?.()}
                disabled={disabled}
              >
                {loadingAction === 'missed' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Mark missed + Notify
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                onClick={() => onRevertPending?.()}
                disabled={disabled}
              >
                {loadingAction === 'pending' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Revert to pending
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
