<template>
  <q-page class="qn-page qn-stack">
    <header class="qn-page-head">
      <p class="qn-overline qn-overline--ignition">Mission control</p>
      <h1 class="display-l">Rover photos</h1>
    </header>

    <!-- RoverPicker -->
    <div
      class="qn-rovers"
      role="radiogroup"
      aria-label="Rover"
      @keydown.left.prevent="moveRover(-1)"
      @keydown.up.prevent="moveRover(-1)"
      @keydown.right.prevent="moveRover(1)"
      @keydown.down.prevent="moveRover(1)"
    >
      <template v-if="rovers.length">
        <button
          v-for="item in rovers"
          :key="item.id"
          ref="roverButtons"
          type="button"
          role="radio"
          :aria-checked="String(rover === roverSlug(item.name))"
          :tabindex="rover === roverSlug(item.name) ? 0 : -1"
          :class="['qn-rover', { 'qn-rover--selected': rover === roverSlug(item.name) }]"
          @click="selectRover(roverSlug(item.name))"
        >
          <q-icon
            v-if="rover === roverSlug(item.name)"
            name="sym_o_check_circle"
            class="qn-rover__check"
            aria-hidden="true"
          />
          <RoverBadge :status="item.status" />
          <span class="qn-rover__name">{{ item.name }}</span>
          <span class="qn-rover__meta">Sol {{ item.max_sol }} · {{ missionYears(item) }}</span>
        </button>
      </template>
      <template v-else>
        <div v-for="n in 4" :key="n" class="qn-skeleton" style="height: 112px" />
      </template>
    </div>

    <!-- Sol / Camera -->
    <div v-if="loadingManifest" class="qn-filters" aria-busy="true">
      <div class="qn-skeleton" style="height: 52px; border-radius: var(--radius-md)" />
      <div class="qn-skeleton" style="height: 52px; border-radius: var(--radius-md)" />
    </div>
    <div v-else-if="manifest" class="qn-filters">
      <q-select
        v-model="sol"
        :options="filteredSols"
        label="Sol"
        stack-label
        emit-value
        map-options
        outlined
        use-input
        fill-input
        hide-selected
        input-debounce="150"
        :suffix="`/ ${manifest.max_sol}`"
        class="qn-field"
        @filter="filterSols"
        @input="onSolChange"
      >
        <template v-slot:prepend>
          <q-icon name="sym_o_wb_sunny" />
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
            <q-item-section>
              <q-item-label>Sol {{ scope.opt.value }}</q-item-label>
              <q-item-label caption>{{ scope.opt.earthDate }}</q-item-label>
            </q-item-section>
            <q-item-section side class="qn-tabular">{{ formatNumber(scope.opt.total) }}</q-item-section>
          </q-item>
        </template>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="qn-muted">No sol with photos starts with that number</q-item-section>
          </q-item>
        </template>
      </q-select>

      <q-select
        v-model="camera"
        :options="cameraOptions"
        label="Camera"
        stack-label
        emit-value
        map-options
        outlined
        clearable
        :display-value="camera ? undefined : 'All cameras'"
        class="qn-field"
        @input="onCameraChange"
      >
        <template v-slot:prepend>
          <q-icon name="sym_o_photo_camera" />
        </template>
      </q-select>
    </div>

    <!-- Image settings (Netlify Image CDN) -->
    <div class="qn-settings">
      <q-btn
        flat
        no-caps
        class="qn-btn qn-btn--ghost qn-btn--sm"
        icon="sym_o_tune"
        label="Image settings"
        :aria-expanded="String(showSettings)"
        aria-controls="image-settings"
        @click="showSettings = !showSettings"
      />
      <q-slide-transition>
        <div v-show="showSettings" id="image-settings" class="qn-settings__panel">
          <p class="qn-overline">Image settings</p>
          <div class="qn-banner">
            <q-icon name="sym_o_info" class="qn-banner__icon" size="24px" />
            <div class="qn-banner__body">
              <p class="qn-banner__title">Thumbnails are resized on the fly</p>
              <p class="qn-banner__text">
                The Netlify Image CDN re-encodes each rover image with these settings. The viewer always shows the original.
              </p>
            </div>
          </div>

          <div class="qn-settings__fields">
            <q-input v-model.number="imageSettings.width" type="number" label="Width" stack-label outlined suffix="px" class="qn-field" />
            <q-input v-model.number="imageSettings.height" type="number" label="Height" stack-label outlined suffix="px" class="qn-field" />
            <q-input
              v-model.number="imageSettings.quality"
              type="number"
              label="Quality (1–100)"
              stack-label
              outlined
              class="qn-field"
              :error="!qualityValid"
              error-message="Must be between 1 and 100"
              hint="Default is 75"
            />
          </div>

          <div v-for="group in chipGroups" :key="group.key" class="qn-settings__group">
            <p class="qn-overline" :id="`chips-${group.key}`">{{ group.label }}</p>
            <div class="qn-chips" role="group" :aria-labelledby="`chips-${group.key}`">
              <button
                v-for="option in group.options"
                :key="option.value"
                type="button"
                :class="['qn-chip', { 'qn-chip--selected': imageSettings[group.key] === option.value }]"
                :aria-pressed="String(imageSettings[group.key] === option.value)"
                @click="imageSettings[group.key] = option.value"
              >
                <q-icon v-if="imageSettings[group.key] === option.value" name="sym_o_check" aria-hidden="true" />
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </q-slide-transition>
    </div>

    <div v-if="error" class="qn-banner qn-banner--error" role="alert">
      <q-icon name="sym_o_error" class="qn-banner__icon" size="24px" />
      <div class="qn-banner__body">
        <p class="qn-banner__title">Transmission failed</p>
        <p class="qn-banner__text">{{ error }}</p>
      </div>
      <q-btn flat no-caps class="qn-btn qn-btn--ghost qn-btn--sm" label="Try again" @click="retry" />
    </div>

    <!-- Results -->
    <section v-if="manifest && sol !== null" class="qn-stack" style="gap: var(--space-4)">
      <div class="qn-section-head">
        <div>
          <p class="qn-overline qn-overline--ignition">
            {{ sol === manifest.max_sol ? 'Latest transmission' : 'Transmissions' }}
          </p>
          <h2 class="qn-section-head__title">{{ manifest.name }} · Sol {{ sol }}</h2>
        </div>
        <p v-if="pagination && !loading" class="data qn-muted" aria-live="polite">
          {{ formatNumber(pagination.total_count) }} {{ pagination.total_count === 1 ? 'photo' : 'photos' }}<template v-if="pagination.total_pages > 1"> · Page {{ page }} of {{ pagination.total_pages }}</template>
        </p>
      </div>

      <div v-if="loading" class="qn-photos" aria-busy="true">
        <div v-for="n in perPage" :key="n" class="qn-skeleton" style="aspect-ratio: 4 / 3" />
      </div>

      <div v-else-if="photos.length" class="qn-photos">
        <PhotoCard
          v-for="(photo, index) in photos"
          :key="photo.id"
          :photo="photo"
          :src="thumbnailUrl(photo)"
          @open="openViewer(index)"
        />
      </div>

      <div v-else-if="!error" class="qn-empty">
        <q-icon name="sym_o_satellite_alt" class="qn-empty__icon" />
        <p class="qn-empty__title">
          No transmissions{{ camera ? ` from ${camera}` : '' }} on Sol {{ sol }}
        </p>
        <p class="qn-empty__text">
          {{ camera ? 'This camera sent nothing that day. Show every camera instead.' : `${manifest.name} didn't send photos that day. Try the sol before.` }}
        </p>
        <q-btn
          v-if="camera"
          flat
          no-caps
          class="qn-btn qn-btn--outline qn-btn--sm"
          icon="sym_o_photo_camera"
          label="Show all cameras"
          @click="camera = null; onCameraChange()"
        />
        <q-btn
          v-else-if="previousSol !== null"
          flat
          no-caps
          class="qn-btn qn-btn--outline qn-btn--sm"
          icon="sym_o_history"
          :label="`Go to Sol ${previousSol}`"
          @click="sol = previousSol; onSolChange()"
        />
      </div>

      <div v-if="pagination && pagination.total_pages > 1 && !loading" class="qn-pager">
        <q-pagination
          :value="page"
          :max="pagination.total_pages"
          :max-pages="$q.screen.lt.sm ? 5 : 7"
          boundary-numbers
          direction-links
          color="primary"
          :text-color="$q.dark.isActive ? 'dark' : 'white'"
          class="qn-pagination"
          @input="onPageChange"
        />
      </div>
    </section>

    <q-page-scroller position="bottom-right" :scroll-offset="600" :offset="[18, 18]">
      <q-btn flat class="qn-btn qn-btn--icon qn-scroll-top" icon="sym_o_keyboard_arrow_up" aria-label="Back to top" />
    </q-page-scroller>

    <PhotoViewer
      v-model="viewerOpen"
      :photos="photos"
      :index.sync="viewerIndex"
      :thumbnail-url="thumbnailUrl"
    />
  </q-page>
</template>

<script>
import PhotoCard from 'components/PhotoCard.vue'
import PhotoViewer from 'components/PhotoViewer.vue'
import RoverBadge from 'components/RoverBadge.vue'
import { ROVERS, getRovers, getManifest, getPhotos, errorMessage } from 'src/services/marsvista'
import { cdnUrl, DEFAULT_IMAGE_SETTINGS } from 'src/utils/image-cdn'
import { formatNumber, roverSlug, missionYears } from 'src/utils/format'

const PER_PAGE = 24

const chipOptions = values => values.map(value => ({ value, label: value }))

export default {
  name: 'PagePhotos',
  components: { PhotoCard, PhotoViewer, RoverBadge },
  data () {
    return {
      rover: ROVERS.includes(this.$route.query.rover) ? this.$route.query.rover : ROVERS[0],
      rovers: [],
      sol: null,
      camera: null,
      page: 1,
      perPage: PER_PAGE,
      manifest: null,
      solOptions: [],
      filteredSols: [],
      photos: [],
      pagination: null,
      loadingManifest: false,
      loading: false,
      error: '',
      requestId: 0,
      viewerOpen: false,
      viewerIndex: 0,
      showSettings: false,
      imageSettings: { ...DEFAULT_IMAGE_SETTINGS },
      chipGroups: [
        { key: 'format', label: 'Format', options: [{ value: '', label: 'Original' }, ...chipOptions(['avif', 'webp', 'jpg', 'png'])] },
        { key: 'fit', label: 'Fit', options: chipOptions(['cover', 'contain', 'fill']) },
        { key: 'position', label: 'Position', options: chipOptions(['center', 'top', 'bottom', 'left', 'right']) }
      ]
    }
  },
  computed: {
    selectedSol () {
      return this.solOptions.find(option => option.value === this.sol)
    },
    // solOptions is newest first, so the next entry is the previous sol with photos
    previousSol () {
      const index = this.solOptions.findIndex(option => option.value === this.sol)
      const previous = index === -1 ? null : this.solOptions[index + 1]
      return previous ? previous.value : null
    },
    cameraOptions () {
      if (!this.selectedSol) return []
      return this.selectedSol.cameras.map(value => ({ value, label: `${value} · ${this.cameraName(value)}` }))
    },
    qualityValid () {
      const quality = Number(this.imageSettings.quality)
      return Number.isInteger(quality) && quality >= 1 && quality <= 100
    }
  },
  watch: {
    // The page component is reused when only the query changes (back/forward, deep links)
    '$route.query' (query) {
      // Bare /photos (e.g. the nav item) keeps the current selection
      if (!query.rover) {
        if (this.sol !== null) this.syncQuery()
        return
      }
      const rover = ROVERS.includes(query.rover) ? query.rover : ROVERS[0]
      const sol = query.sol !== undefined ? Number(query.sol) : null
      const camera = query.camera || null
      const page = Number(query.page) || 1
      if (rover !== this.rover || !this.manifest) {
        this.rover = rover
        this.loadManifest({ sol, camera, page })
      } else if (sol !== this.sol || camera !== this.camera || page !== this.page) {
        if (sol === null) return this.syncQuery()
        this.sol = sol
        this.camera = camera
        this.page = page
        this.loadPhotos()
      }
    }
  },
  async mounted () {
    getRovers()
      .then(rovers => { this.rovers = rovers })
      .catch(error => { this.error = errorMessage(error) })
    const { sol, camera, page } = this.$route.query
    await this.loadManifest({
      sol: sol !== undefined ? Number(sol) : null,
      camera: camera || null,
      page: Number(page) || 1
    })
  },
  methods: {
    formatNumber,
    roverSlug,
    missionYears,
    cameraName (name) {
      const roverInfo = this.rovers.find(item => roverSlug(item.name) === this.rover)
      const camera = roverInfo && roverInfo.cameras.find(item => item.name === name)
      return camera ? camera.full_name : name.replace(/_/g, ' ')
    },
    thumbnailUrl (photo) {
      const settings = { ...this.imageSettings }
      if (!this.qualityValid) settings.quality = DEFAULT_IMAGE_SETTINGS.quality
      return cdnUrl(photo.img_src, settings)
    },
    async loadManifest ({ sol = null, camera = null, page = 1 } = {}) {
      const requestId = ++this.requestId
      this.loadingManifest = true
      this.error = ''
      this.manifest = null
      this.solOptions = []
      this.photos = []
      this.pagination = null
      try {
        const manifest = await getManifest(this.rover)
        if (requestId !== this.requestId) return
        this.manifest = manifest
        this.solOptions = manifest.photos
          .map(entry => ({
            value: entry.sol,
            label: `Sol ${entry.sol}`,
            earthDate: entry.earth_date,
            total: entry.total_photos,
            cameras: entry.cameras
          }))
          .reverse()
        this.filteredSols = this.solOptions
        const requested = this.solOptions.find(option => option.value === sol)
        this.sol = requested ? requested.value : (this.solOptions[0] ? this.solOptions[0].value : null)
        this.camera = requested && camera && requested.cameras.includes(camera) ? camera : null
        this.page = requested ? page : 1
      } catch (error) {
        if (requestId === this.requestId) this.error = errorMessage(error)
      } finally {
        if (requestId === this.requestId) this.loadingManifest = false
      }
      if (this.sol !== null) await this.loadPhotos()
    },
    async loadPhotos () {
      const requestId = ++this.requestId
      this.loading = true
      this.error = ''
      this.syncQuery()
      try {
        const data = await getPhotos(this.rover, {
          sol: this.sol,
          camera: this.camera,
          page: this.page,
          perPage: this.perPage
        })
        if (requestId !== this.requestId) return
        this.photos = data.photos
        this.pagination = data.pagination
      } catch (error) {
        if (requestId !== this.requestId) return
        this.photos = []
        this.pagination = null
        this.error = errorMessage(error)
      } finally {
        if (requestId === this.requestId) this.loading = false
      }
    },
    retry () {
      if (!this.manifest) this.loadManifest({ sol: this.sol, camera: this.camera, page: this.page })
      else this.loadPhotos()
    },
    syncQuery () {
      const query = { rover: this.rover, sol: String(this.sol), page: String(this.page) }
      if (this.camera) query.camera = this.camera
      const current = this.$route.query
      const same = Object.keys(query).length === Object.keys(current).length &&
        Object.keys(query).every(key => current[key] === query[key])
      if (!same) this.$router.replace({ query }).catch(() => {})
    },
    selectRover (slug) {
      if (slug === this.rover) return
      this.rover = slug
      this.loadManifest()
    },
    // Radio group keyboard support: arrows move and select
    moveRover (delta) {
      const slugs = this.rovers.map(item => roverSlug(item.name))
      if (!slugs.length) return
      const next = (slugs.indexOf(this.rover) + delta + slugs.length) % slugs.length
      this.selectRover(slugs[next])
      this.$nextTick(() => this.$refs.roverButtons[next].focus())
    },
    filterSols (value, update) {
      update(() => {
        const needle = String(value).trim()
        this.filteredSols = needle
          ? this.solOptions.filter(option => String(option.value).startsWith(needle))
          : this.solOptions
      })
    },
    onSolChange () {
      this.camera = null
      this.page = 1
      this.loadPhotos()
    },
    onCameraChange () {
      this.page = 1
      this.loadPhotos()
    },
    async onPageChange (page) {
      this.page = page
      window.scrollTo({ top: 0, behavior: 'smooth' })
      await this.loadPhotos()
    },
    openViewer (index) {
      this.viewerIndex = index
      this.viewerOpen = true
    }
  }
}
</script>

<style>
.qn-filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: var(--space-3);
}

.qn-settings {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  margin-top: calc(var(--space-4) * -1);
}

.qn-settings__panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--space-900);
  border: 1px solid var(--line);
}

.qn-settings__fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
}

.qn-settings__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.qn-pager {
  display: flex;
  justify-content: center;
}

.qn-scroll-top.q-btn {
  background: var(--space-800);
  border: 1px solid var(--line-strong);
  box-shadow: var(--shadow-raised);
}

@media (max-width: 599px) {
  .qn-filters,
  .qn-settings__fields {
    grid-template-columns: 1fr;
  }

  .qn-rovers {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
