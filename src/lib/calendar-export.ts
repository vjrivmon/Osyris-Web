/**
 * Calendar Export Utilities
 *
 * Provides functions to export events to Google Calendar and generate ICS files
 * for compatibility with any calendar application.
 */

export interface CalendarExportEvent {
  title: string
  date: string // Format: YYYY-MM-DD
  time?: string // Format: HH:MM or HH:MM - HH:MM
  location?: string
  description?: string
  section?: string
}

/**
 * Parse time string to get start and end times
 * Handles formats like "17:00", "17:00 - 19:00", "10:00-12:00"
 */
function parseTimeRange(time?: string): { startTime: string; endTime: string } {
  if (!time) {
    return { startTime: '09:00', endTime: '10:00' }
  }

  // Try to extract time range (e.g., "17:00 - 19:00" or "10:00-12:00")
  const rangeMatch = time.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/)
  if (rangeMatch) {
    const startTime = `${rangeMatch[1].padStart(2, '0')}:${rangeMatch[2]}`
    const endTime = `${rangeMatch[3].padStart(2, '0')}:${rangeMatch[4]}`
    return { startTime, endTime }
  }

  // Single time (e.g., "17:00")
  const singleMatch = time.match(/(\d{1,2}):(\d{2})/)
  if (singleMatch) {
    const startTime = `${singleMatch[1].padStart(2, '0')}:${singleMatch[2]}`
    // Default duration: 2 hours
    const startHour = parseInt(singleMatch[1])
    const endHour = (startHour + 2) % 24
    const endTime = `${String(endHour).padStart(2, '0')}:${singleMatch[2]}`
    return { startTime, endTime }
  }

  return { startTime: '09:00', endTime: '10:00' }
}

/**
 * Format date and time for Google Calendar URL
 * Google Calendar expects: YYYYMMDDTHHmmssZ or YYYYMMDDTHHmmss (local time)
 */
function formatGoogleCalendarDate(date: string, time: string): string {
  const [year, month, day] = date.split('-')
  const [hours, minutes] = time.split(':')
  return `${year}${month}${day}T${hours}${minutes}00`
}

/**
 * Format date and time for ICS file
 * ICS expects: YYYYMMDDTHHMMSS
 */
function formatICSDate(date: string, time: string): string {
  const [year, month, day] = date.split('-')
  const [hours, minutes] = time.split(':')
  return `${year}${month}${day}T${hours}${minutes}00`
}

/**
 * Escape special characters for ICS format
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Generate Google Calendar URL for an event
 * Opens Google Calendar with pre-filled event details
 */
export function generateGoogleCalendarUrl(event: CalendarExportEvent): string {
  const { startTime, endTime } = parseTimeRange(event.time)

  const startDate = formatGoogleCalendarDate(event.date, startTime)
  const endDate = formatGoogleCalendarDate(event.date, endTime)

  // Build description with section info if available
  let description = event.description || ''
  if (event.section) {
    description = `[${event.section}] ${description}`.trim()
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: description,
    location: event.location || '',
    trp: 'false' // Don't show busy status in results
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generate ICS file content for an event
 * Compatible with any calendar application (Outlook, Apple Calendar, etc.)
 */
export function generateICSContent(event: CalendarExportEvent): string {
  const { startTime, endTime } = parseTimeRange(event.time)

  const dtStart = formatICSDate(event.date, startTime)
  const dtEnd = formatICSDate(event.date, endTime)

  // Build description with section info if available
  let description = event.description || ''
  if (event.section) {
    description = `[${event.section}] ${description}`.trim()
  }

  // Generate a unique ID for the event
  const uid = `${event.date}-${event.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}@grupoosyris.es`

  // Current timestamp for DTSTAMP
  const now = new Date()
  const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Grupo Scout Osyris//Calendario de Actividades//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(event.title)}`,
    description ? `DESCRIPTION:${escapeICS(description)}` : '',
    event.location ? `LOCATION:${escapeICS(event.location)}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line !== '').join('\r\n')

  return icsContent
}

/**
 * Download ICS file for an event
 * Creates a blob and triggers download
 */
export function downloadICSFile(event: CalendarExportEvent): void {
  const icsContent = generateICSContent(event)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })

  // Create filename from event title
  const filename = `${event.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()}.ics`

  // Create download link and trigger download
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  URL.revokeObjectURL(link.href)
}
