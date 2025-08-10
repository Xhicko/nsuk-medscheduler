'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DatePickerWithTime } from './date-picker-with-time'
import { addMinutes, format, parseISO } from 'date-fns'
import { Loader2 } from 'lucide-react'

export function ScheduleAppointmentModal({ isOpen, onOpenChange, student, onSchedule, onCancel }) {
  const [selectedDate, setSelectedDate] = useState(undefined)
  const [selectedTime, setSelectedTime] = useState(undefined)
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && student) {
      if ('appointmentDate' in student && 'startTime' in student) {
        setSelectedDate(parseISO(student.appointmentDate))
        setSelectedTime(student.startTime)
      } else {
        setSelectedDate(undefined)
        setSelectedTime(undefined)
      }
    }
  }, [isOpen, student])

  useEffect(() => {
    setIsFormValid(!!selectedDate && !!selectedTime)
  }, [selectedDate, selectedTime])

  const getTakenSlots = (date) => {
    const taken = []
    if (format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
      taken.push('09:00', '09:15', '10:30', '13:00')
    }
    return taken
  }

  const disabledTimes = useMemo(() => {
    if (!selectedDate) return []
    return getTakenSlots(selectedDate)
  }, [selectedDate])

  const calculateEndTime = (time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    const endTime = addMinutes(date, 15)
    return format(endTime, 'HH:mm')
  }

  const handleConfirm = async () => {
    if (student && selectedDate && selectedTime) {
      try {
        setIsSubmitting(true)
        const endTime = calculateEndTime(selectedTime)
        await onSchedule(student, selectedDate, selectedTime, endTime)
      } finally {
        // Parent will close on success; if it doesn't, remove loading so user can retry
        setIsSubmitting(false)
      }
    }
  }

  const handleOpenChange = (open) => {
    if (isSubmitting) return // Block closing while submitting
    onOpenChange(open)
  }

  const displayStartTime = selectedDate && selectedTime ? format(selectedDate, 'EEEE, MM-dd-yyyy') + ` ${selectedTime}` : ''
  const displayEndTime = selectedDate && selectedTime ? format(selectedDate, 'EEEE, MM-dd-yyyy') + ` ${calculateEndTime(selectedTime)}` : ''

  return (
  <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-2xl shadow-lg">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {student && 'appointmentDate' in student ? 'Edit Appointment' : 'Schedule New Appointment'}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {student?.fullName} ({student?.matricNumber})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <DatePickerWithTime
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
            disabledTimes={disabledTimes}
            initialDate={student && 'appointmentDate' in student ? parseISO(student.appointmentDate) : undefined}
            initialTime={student && 'startTime' in student ? student.startTime : undefined}
          />

          {selectedDate && selectedTime && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
              <p className="text-sm font-medium text-gray-700">Selected Slot:</p>
              <p className="text-gray-900 font-semibold">Start: {displayStartTime}</p>
              <p className="text-gray-900 font-semibold">End: {displayEndTime}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className={`rounded-lg bg-transparent hover:bg-[#0077B6]/20 text-[#0077B6] hover:text-[#0077B6] border-[#0077B6] ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isFormValid || isSubmitting}
              className={`bg-[#0077B6] hover:bg-[#00659a] text-white rounded-lg ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
