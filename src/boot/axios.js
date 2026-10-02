import Vue from 'vue'
import axios from 'axios'

// Mars Vista API — open source drop-in replacement for the archived NASA Mars Rover Photos API
// Docs: https://api.marsvista.dev/swagger/index.html
const api = axios.create({
  baseURL: 'https://api.marsvista.dev/api/v1/',
  headers: {
    'X-API-Key': process.env.MARSVISTA_API_KEY
  }
})

Vue.prototype.$axios = api

export { api }
