<template>
  <q-page class="qn-page qn-stack">
    <section class="qn-hero">
      <div class="qn-hero__orbit" aria-hidden="true" />
      <div class="qn-hero__planet" aria-hidden="true" />
      <p class="qn-overline qn-overline--ignition">Explore Mars</p>
      <h1 class="qn-hero__title">Latest from Mars</h1>
      <p class="qn-hero__text">
        Raw images from the rovers, sol by sol. Pick a rover, choose a day and launch.
      </p>
      <div class="qn-hero__actions">
        <q-btn
          unelevated
          no-caps
          class="qn-btn qn-btn--primary"
          icon="sym_o_rocket_launch"
          label="Launch search"
          :to="{ name: 'photos', query: newest ? { rover: roverSlug(newest.name) } : {} }"
        />
        <q-btn
          flat
          no-caps
          class="qn-btn qn-btn--outline"
          icon="sym_o_satellite_alt"
          label="Meet the rovers"
          :to="{ name: 'rovers' }"
        />
      </div>
    </section>

    <div v-if="error" class="qn-banner qn-banner--error" role="alert">
      <q-icon name="sym_o_error" class="qn-banner__icon" size="24px" />
      <div class="qn-banner__body">
        <p class="qn-banner__title">Mission data unavailable</p>
        <p class="qn-banner__text">{{ error }}</p>
      </div>
      <q-btn flat no-caps class="qn-btn qn-btn--ghost qn-btn--sm" label="Try again" @click="load" />
    </div>

    <section v-if="!error" class="qn-stats" :aria-busy="loadingRovers ? 'true' : 'false'">
      <template v-if="loadingRovers">
        <div v-for="n in 4" :key="n" class="qn-skeleton" style="height: 118px" />
      </template>
      <template v-else-if="newest">
        <div class="qn-stat">
          <span class="qn-overline">Current sol</span>
          <span class="qn-stat__value">{{ newest.max_sol }}</span>
          <span class="qn-stat__note">{{ newest.name }} · {{ newest.max_date }}</span>
        </div>
        <div class="qn-stat">
          <span class="qn-overline">Photos archived</span>
          <span class="qn-stat__value">{{ formatNumber(totalPhotos) }}</span>
          <span class="qn-stat__note">From {{ rovers.length }} rovers</span>
        </div>
        <div class="qn-stat">
          <span class="qn-overline">Active rovers</span>
          <span class="qn-stat__value">{{ activeRovers.length }}<span class="qn-stat__unit">of {{ rovers.length }}</span></span>
          <span class="qn-stat__note">{{ activeRovers.map(rover => rover.name).join(' and ') }}</span>
        </div>
        <div class="qn-stat">
          <span class="qn-overline">Cameras</span>
          <span class="qn-stat__value">{{ totalCameras }}</span>
          <span class="qn-stat__note">Across all rovers</span>
        </div>
      </template>
    </section>

    <section v-if="!error" class="qn-stack" style="gap: var(--space-4)">
      <div class="qn-section-head">
        <div>
          <p class="qn-overline qn-overline--ignition">Latest transmission</p>
          <h2 class="qn-section-head__title">
            <template v-if="newest">{{ newest.name }} · Sol {{ latestSol }}</template>
            <template v-else>Waiting for data</template>
          </h2>
        </div>
        <router-link
          v-if="newest && latestSol !== null"
          class="qn-link"
          :to="{ name: 'photos', query: { rover: roverSlug(newest.name), sol: String(latestSol) } }"
        >
          See all
        </router-link>
      </div>

      <div v-if="loadingLatest" class="qn-photos" aria-busy="true">
        <div v-for="n in 8" :key="n" class="qn-skeleton" style="aspect-ratio: 4 / 3" />
      </div>
      <div v-else-if="latest.length" class="qn-photos">
        <PhotoCard
          v-for="(photo, index) in latest"
          :key="photo.id"
          :photo="photo"
          :src="thumbnail(photo)"
          @open="openViewer(index)"
        />
      </div>
    </section>

    <p class="qn-credit">
      Photo data from the open source <a class="qn-link" href="https://marsvista.dev" target="_blank" rel="noopener">Mars Vista API</a>.
      Image credit: NASA/JPL-Caltech.
    </p>

    <PhotoViewer
      v-model="viewerOpen"
      :photos="latest"
      :index.sync="viewerIndex"
      :thumbnail-url="thumbnail"
    />
  </q-page>
</template>

<script>
import PhotoCard from 'components/PhotoCard.vue'
import PhotoViewer from 'components/PhotoViewer.vue'
import { getRovers, getLatestPhotos, errorMessage } from 'src/services/marsvista'
import { cdnUrl, DEFAULT_IMAGE_SETTINGS } from 'src/utils/image-cdn'
import { formatNumber, roverSlug } from 'src/utils/format'

// Navigation/hazard cameras usually show terrain; Mastcam often shoots the sky or the Sun
const PREFERRED_CAMERAS = ['NAVCAM_LEFT', 'NAVCAM', 'FRONT_HAZCAM_LEFT_A', 'FHAZ', 'MCZ_RIGHT', 'MCZ_LEFT', 'MAST']

export default {
  name: 'PageIndex',
  components: { PhotoCard, PhotoViewer },
  data () {
    return {
      rovers: [],
      latest: [],
      loadingRovers: true,
      loadingLatest: true,
      error: '',
      viewerOpen: false,
      viewerIndex: 0
    }
  },
  computed: {
    activeRovers () {
      return this.rovers.filter(rover => rover.status === 'active')
    },
    // The active rover with the most recent downlink
    newest () {
      return this.activeRovers.slice().sort((a, b) => b.max_date.localeCompare(a.max_date))[0] || null
    },
    totalPhotos () {
      return this.rovers.reduce((sum, rover) => sum + rover.total_photos, 0)
    },
    totalCameras () {
      return this.rovers.reduce((sum, rover) => sum + rover.cameras.length, 0)
    },
    latestSol () {
      return this.latest.length ? this.latest[0].sol : (this.newest ? this.newest.max_sol : null)
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    formatNumber,
    roverSlug,
    thumbnail (photo) {
      return cdnUrl(photo.img_src, { ...DEFAULT_IMAGE_SETTINGS, width: 640, height: 480 })
    },
    async load () {
      this.error = ''
      this.loadingRovers = true
      this.loadingLatest = true
      try {
        this.rovers = await getRovers()
        this.loadingRovers = false
        if (!this.newest) return
        const { photos } = await getLatestPhotos(roverSlug(this.newest.name), { perPage: 50 })
        const rank = photo => {
          const index = PREFERRED_CAMERAS.indexOf(photo.camera.name)
          return index === -1 ? PREFERRED_CAMERAS.length : index
        }
        this.latest = photos.slice().sort((a, b) => rank(a) - rank(b)).slice(0, 8)
      } catch (error) {
        this.error = errorMessage(error)
      } finally {
        this.loadingRovers = false
        this.loadingLatest = false
      }
    },
    openViewer (index) {
      this.viewerIndex = index
      this.viewerOpen = true
    }
  }
}
</script>
