import Vue from 'vue'
import axios from 'axios'

const axiosConfig = axios.create({
  baseURL: 'https://api.nasa.gov/mars-photos/api/v1/',
  params: {
    api_key: 'cUirMiJfQ4FqNXAlaK8VKvgwIvdfEdEeJaBO0Xq7'
  }
})

Vue.prototype.$axios = axiosConfig
