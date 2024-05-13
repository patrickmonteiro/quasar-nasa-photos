<template>
  <q-page padding>
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-body1 q-mt-xs text-bold">
        Rover Settings
      </div>
      <q-select
        outlined
        v-model="model"
        :options="optionsSol"
        :loading="loadingSol"
        label="Sol"
        map-options
        option-label="sol"
        class="col-lg-3 col-md-3 col-xs-12"
        @input="setSolConfigurations"
        dense
      >
        <template v-slot:prepend>
          <q-icon name="brightness_high" />
        </template>
      </q-select>

      <q-select
        outlined
        v-model="rover"
        :options="optionsRover"
        label="Rover"
        map-options
        class="col-lg-3 col-md-3 col-xs-12"
        dense
        @input="getManifest()"
      >
        <template v-slot:prepend>
          <q-icon name="precision_manufacturing" />
        </template>
      </q-select>

      <div class="col-md-6 col-lg-6 col-xs-12">
        <q-banner class="bg-amber" dense>
          <span class="text-caption">
            The <strong>opportunity</strong> and <strong>spirit</strong> rovers appear to have had their photos removed from the api for now.
            <a href="https://github.com/corincerami/mars-photo-api/issues/197" target="_blank§">More information</a>
          </span>
        </q-banner>
      </div>
    </div>

    <div class="row q-col-gutter-sm">
      <div class="col-12 text-body1 q-mt-xs text-bold">
        Image Settings (Netlify Image CDN)
      </div>
      <q-input
        label="width"
        outlined
        v-model="width"
        class="col-lg-2 col-md-2 col-xs-12"
        dense
      />
      <q-input
        label="heigth"
        outlined
        v-model="height"
        class="col-lg-2 col-md-2 col-xs-12"
        dense
      />

      <q-select
        outlined
        v-model="fit"
        :options="['contain', 'cover', 'fill']"
        label="Fit"
        map-options
        class="col-lg-2 col-md-2 col-xs-12"
        dense
      >
      </q-select>

      <q-select
        outlined
        v-model="position"
        :options="['center', 'top', 'bottom', 'right', 'left']"
        label="Position"
        map-options
        class="col-lg-2 col-md-2 col-xs-12"
        dense
      >
      </q-select>

      <q-select
        outlined
        v-model="format"
        :options="['avif', 'jpg', 'png', 'webp', 'gif', 'blurhash']"
        label="Format"
        map-options
        class="col-lg-2 col-md-2 col-xs-12"
        dense
      >
      </q-select>

      <q-input
        label="Quality (0 - 100)"
        outlined
        v-model="quality"
        class="col-lg-2 col-md-2 col-xs-12"
        dense
      />
    </div>

    <div>
      <q-table
        grid
        :data="photoList"
        :columns="columns"
        row-key="id"
        hide-header
        :pagination.sync="pagination"
        hide-pagination
        binary-state-sort
        :loading="loading"
        class="row"
      >
        <template v-slot:item="props">
          <div
            class="col-xs-12 col-md-4 col-lg-3 q-pa-xs"
          >
            <q-card class="bg-primary text-white fit cursor-pointer custom-card q-pa-xs" @click="openModal(`https://quasar-nasa-photos.netlify.app/.netlify/images?url=${props.row.img_src}&w=${width}&h=${height}&fit=${fit}&position=${position}${format ? `&fm=${format}` : ''}${quality != 75 ? `&q=${quality}` : '' }`)">
              <img
                :src="`https://quasar-nasa-photos.netlify.app/.netlify/images?url=${props.row.img_src}&w=${width}&h=${height}&fit=${fit}&position=${position}${format ? `&fm=${format}` : ''}${quality != 75 ? `&q=${quality}` : '' }`"
              >
              <!-- <q-img
                :src="`https://quasar-nasa-photos.netlify.app/.netlify/images?url=${props.row.img_src}&w=${width}&h=${height}&fit=${fit}&position=${position}`"
              >
                <template v-slot:loading>
                  <q-skeleton dark height="200px" class="full-width full-height" />
                </template>
              </q-img> -->

              <q-card-section class="q-pt-">
                <q-separator color="negative" />
                <div class="text-subtitle2">
                  <q-icon name="brightness_high"/> Sol: {{props.row.sol}}
                </div>
                <div class="text-subtitle2">
                  <q-icon name="electric_rickshaw"/> Rover: {{props.row.rover.name}}
                </div>
                <div class="text-subtitle2">
                  <q-icon name="electric_rickshaw"/> Camera: {{props.row.camera.full_name}}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
    </div>
    <div class="row justify-center">
      <q-pagination
        v-if="photoList.length > 0"
        v-model="pagination.page"
        @input="getPhotos"
        color="primary"
        :max="pagesNumber"
        :max-pages="6"
        :boundary-numbers="false"
        direction-links
        size="16px"
      />
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]" v-if="photoList.length > 0">
      <q-btn fab icon="expand_less" color="white" text-color="primary" @click="scrollToTop" />
    </q-page-sticky>
    <Modal
      :modal="modal"
      :imageUrl="imageUrl"
      @close="modal=false"
    />
  </q-page>
</template>

<script>
import Modal from 'src/components/Modal.vue'
export default {
  name: 'PagePhotos',
  components: {
    Modal
  },
  data () {
    return {
      modal: false,
      width: '200',
      height: '200',
      fit: 'contain',
      quality: 75,
      format: '',
      position: 'center',
      model: '',
      manifest: {},
      optionsSol: [],
      photoList: [],
      solSelected: null,
      columns: [
        {
          name: 'id',
          field: 'id'
        }
      ],
      rover: 'curiosity',
      optionsRover: ['curiosity'],
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 25,
        rowsNumber: 300
      },
      loadingSol: true,
      loading: false,
      imageUrl: ''
    }
  },
  computed: {
    pagesNumber () {
      return Math.ceil(this.pagination.rowsNumber / this.pagination.rowsPerPage)
    }
  },
  async mounted () {
    await this.getManifest()
  },
  methods: {
    async getManifest () {
      this.loadingSol = true
      try {
        const { data } = await this.$axios.get(`manifests/${this.rover}`)
        this.manifest = data.photo_manifest
        this.optionsSol = data.photo_manifest.photos.reverse()
        this.loadingSol = false
        this.photoList = []
        this.model = ''
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `${error}`
        })
        console.error(error)
      }
    },
    async getPhotos () {
      this.photoList = []
      this.loading = true
      try {
        const { data } = await this.$axios.get(`rovers/${this.rover}/photos?sol=${this.solSelected}&page=${this.pagination.page}`)
        this.photoList = data.photos
        this.loading = false
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `${error}`
        })
        console.error(error)
      }
    },
    setSolConfigurations (val) {
      this.solSelected = val.sol
      this.pagination.page = 1
      this.pagination.rowsNumber = val.total_photos
      this.getPhotos()
    },
    scrollToTop () {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    openModal (url) {
      this.modal = true
      this.imageUrl = url
    }
  }
}
</script>

<style>
.custom-card:hover {
  opacity: 0.9;
}
</style>
