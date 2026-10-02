// Design system: Earth dates stay ISO (2026-09-30), straight from the API.

export function formatNumber (value) {
  return Number(value || 0).toLocaleString('en-US')
}

export function roverSlug (name) {
  return String(name).toLowerCase()
}

// "2012–2026" from landing_date and max_date
export function missionYears (rover) {
  const start = rover.landing_date.slice(0, 4)
  const end = rover.max_date.slice(0, 4)
  return start === end ? start : `${start}–${end}`
}
