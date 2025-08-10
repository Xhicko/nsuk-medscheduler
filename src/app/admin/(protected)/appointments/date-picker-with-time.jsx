'use client'

import { useEffect, useMemo, useState } from 'react'
import { addDays, addMinutes, format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon } from 'lucide-react'

function formatDateDisplay(date) {
  if (!date) return ''
  try {
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

function isValidDate(value) {
  return value instanceof Date && !isNaN(value.getTime())
}

export function DatePickerWithTime({
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  disabledTimes = [],
  initialDate,
  initialTime,
}) {
  // Popover calendar state and input value
  const [isOpen, setIsOpen] = useState(false)
  const today = useMemo(() => new Date(), [])
  const endDate = useMemo(() => addDays(new Date(today), 30), [today])

  const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6
  const isWithinNextThirtyDays = (date) => date >= new Date(today.setHours(0, 0, 0, 0)) && date <= endDate
  const isAllowedDate = (date) => isWithinNextThirtyDays(date) && !isWeekend(date)

  const getFirstAllowedDate = () => {
    let probe = new Date()
    probe.setHours(0, 0, 0, 0)
    let steps = 0
    while (steps <= 31) {
      if (isAllowedDate(probe)) return new Date(probe)
      probe = addDays(probe, 1)
      steps += 1
    }
    return new Date() // fallback to today
  }

  const defaultAllowedDate = useMemo(() => getFirstAllowedDate(), [])

  const [monthInView, setMonthInView] = useState(selectedDate || defaultAllowedDate)
  const [dateInputValue, setDateInputValue] = useState(formatDateDisplay(selectedDate || defaultAllowedDate))

  // Ensure default to current date when none is selected
  useEffect(() => {
    if (!selectedDate && typeof onSelectDate === 'function') {
      onSelectDate(defaultAllowedDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep input and month in sync with external selectedDate changes
  useEffect(() => {
  const effectiveDate = (selectedDate && isAllowedDate(selectedDate)) ? selectedDate : defaultAllowedDate
    setMonthInView(effectiveDate)
    setDateInputValue(formatDateDisplay(effectiveDate))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const timeOptions = useMemo(() => {
    // Generate 15-min interval times 08:00 - 17:00
    const startOfDay = new Date()
    startOfDay.setHours(8, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(17, 0, 0, 0)
    const options = []
    let currentPointer = new Date(startOfDay)
    while (currentPointer <= endOfDay) {
      options.push(format(currentPointer, 'HH:mm'))
      currentPointer = addMinutes(currentPointer, 15)
    }
    return options
  }, [])

  const isTimeDisabled = (timeValue) => disabledTimes.includes(timeValue)

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="appointment-date" className="px-1">Select appointment Date</Label>
        <div className="relative flex gap-2">
          <Input
            id="appointment-date"
            value={dateInputValue}
            placeholder={formatDateDisplay(today)}
            className="bg-background pr-10 h-14"
            onChange={(event) => {
              const inputValue = event.target.value
              setDateInputValue(inputValue)
              const parsedDate = new Date(inputValue)
              if (isValidDate(parsedDate) && isAllowedDate(parsedDate)) {
                setMonthInView(parsedDate)
                onSelectDate?.(parsedDate)
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setIsOpen(true)
              }
            }}
          />
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button id="date-picker" variant="ghost" className="absolute top-1/2 right-2 size-6 -translate-y-1/2 cursor-pointer">
                <CalendarIcon className="size-3.5" />
                <span className="sr-only">Select date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0 cursor-pointer" align="end" alignOffset={-8} sideOffset={10}>
              <Calendar
                mode="single"
                selected={(selectedDate && isAllowedDate(selectedDate)) ? selectedDate : defaultAllowedDate}
                captionLayout="dropdown"
                month={monthInView}
                onMonthChange={setMonthInView}
                fromDate={defaultAllowedDate}
                toDate={endDate}
                disabled={(date) => isWeekend(date) || !isWithinNextThirtyDays(date)}
                onSelect={(newDate) => {
                  if (!newDate) return
                  if (!isAllowedDate(newDate)) return
                  onSelectDate?.(newDate)
                  setDateInputValue(formatDateDisplay(newDate))
                  setIsOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-full">
          <Select value={selectedTime} onValueChange={onSelectTime} disabled={!selectedDate}>
            <SelectTrigger className="w-full rounded-xl bg-white border-gray-200">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((timeValue) => (
                <SelectItem key={timeValue} value={timeValue} disabled={isTimeDisabled(timeValue)}>
                  <span className={isTimeDisabled(timeValue) ? 'text-gray-300' : ''}>{timeValue}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
