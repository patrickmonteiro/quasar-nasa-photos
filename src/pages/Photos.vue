<template>
  <q-page padding>
    <div class="row">
      <q-select
        outlined
        v-model="model"
        :options="optionsSol"
        :loading="loadingSol"
        label="Sol"
        map-options
        option-label="sol"
        class="col-12"
        @input="setSolConfigurations"
      >
        <template v-slot:prepend>
          <q-icon name="brightness_high" />
        </template>
      </q-select>
    </div>
    <div class="row q-mt-sm">
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
      >
        <template v-slot:item="props">
          <div
            class="col-xs-12 col-md-3 q-pa-sm"
          >
            <q-card class="bg-primary text-white">
              <q-img
                :src="props.row.img_src"
                :ratio="4/3"
              >
                <template v-slot:loading>
                  <q-skeleton dark height="200px" class="full-width full-height" />
                </template>
              </q-img>

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
        color="black"
        :max="pagesNumber"
        :max-pages="6"
        :boundary-numbers="false"
      />
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PagePhotos',
  data () {
    return {
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
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 25,
        rowsNumber: 300
      },
      loadingSol: true,
      loading: false
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
        const { data } = await this.$axios.get('manifests/curiosity')
        this.manifest = data.photo_manifest
        this.optionsSol = data.photo_manifest.photos.reverse()
        this.loadingSol = false
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
        const { data } = await this.$axios.get(`rovers/curiosity/photos?sol=${this.solSelected}&page=${this.pagination.page}`)
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
    }
  }
}
</script>
