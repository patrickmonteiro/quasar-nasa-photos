import { api } from 'boot/axios'

export const ROVERS = ['perseverance', 'curiosity', 'opportunity', 'spirit']

// Shared by Home, Rovers and Photos; cached for the session, retried after a failure
let roversRequest = null

export function getRovers () {
  if (!roversRequest) {
    roversRequest = api.get('rovers')
      .then(({ data }) => data.rovers)
      .catch(error => {
        roversRequest = null
        throw error
      })
  }
  return roversRequest
}

// Rover metadata, including cameras[] with { name, full_name }
export async function getRover (rover) {
  const { data } = await api.get(`rovers/${rover}`)
  return data.rover
}

// Sols that have photos, each with { sol, earth_date, total_photos, cameras[] }
export async function getManifest (rover) {
  const { data } = await api.get(`manifests/${rover}`)
  return data.photo_manifest
}

// Returns { photos, pagination: { total_count, page, per_page, total_pages } }
export async function getPhotos (rover, { sol, camera, page = 1, perPage = 24 } = {}) {
  const { data } = await api.get(`rovers/${rover}/photos`, {
    params: { sol, camera: camera || undefined, page, per_page: perPage }
  })
  return data
}

export async function getLatestPhotos (rover, { page = 1, perPage = 24 } = {}) {
  const { data } = await api.get(`rovers/${rover}/latest`, {
    params: { page, per_page: perPage }
  })
  return data
}

export function errorMessage (error) {
  const status = error.response && error.response.status
  if (status === 401) return 'The Mars Vista API rejected the API key. Check MARSVISTA_API_KEY in .env.'
  if (status === 429) return 'Too many requests to the Mars Vista API. Wait a moment and try again.'
  if (!error.response) return 'Could not reach the Mars Vista API. Check your connection.'
  return `Mars Vista API error ${status}: ${error.message}`
}
