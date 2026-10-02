<template>
  <q-page class="qn-page qn-stack">
    <header class="qn-page-head">
      <p class="qn-overline qn-overline--ignition">Fleet</p>
      <h1 class="display-l">Meet the rovers</h1>
    </header>

    <div v-if="error" class="qn-banner qn-banner--error" role="alert">
      <q-icon name="sym_o_error" class="qn-banner__icon" size="24px" />
      <div class="qn-banner__body">
        <p class="qn-banner__title">Rover data unavailable</p>
        <p class="qn-banner__text">{{ error }}</p>
      </div>
      <q-btn flat no-caps class="qn-btn qn-btn--ghost qn-btn--sm" label="Try again" @click="load" />
    </div>

    <div v-else-if="loading" class="qn-fleet" aria-busy="true">
      <div v-for="n in 4" :key="n" class="qn-skeleton" style="height: 280px" />
    </div>

    <div v-else class="qn-fleet">
      <article v-for="rover in rovers" :key="rover.id" class="qn-fleet__card">
        <RoverBadge :status="rover.status" />
        <h2 class="title">{{ rover.name }}</h2>
        <dl class="qn-fleet__facts">
          <div>
            <dt class="qn-overline">Landed</dt>
            <dd class="data">{{ rover.landing_date }}</dd>
          </div>
          <div>
            <dt class="qn-overline">{{ rover.status === 'active' ? 'Current sol' : 'Last sol' }}</dt>
            <dd class="data">{{ rover.max_sol }}</dd>
          </div>
          <div>
            <dt class="qn-overline">Photos</dt>
            <dd class="data">{{ formatNumber(rover.total_photos) }}</dd>
          </div>
          <div>
            <dt class="qn-overline">Cameras</dt>
            <dd class="data">{{ rover.cameras.length }}</dd>
          </div>
        </dl>
        <q-btn
          flat
          no-caps
          class="qn-btn qn-btn--outline"
          icon="sym_o_photo_library"
          :label="`Browse ${rover.name} photos`"
          :to="{ name: 'photos', query: { rover: roverSlug(rover.name) } }"
        />
      </article>
    </div>

    <p class="qn-credit">
      Rover data from the open source <a class="qn-link" href="https://marsvista.dev" target="_blank" rel="noopener">Mars Vista API</a>.
    </p>
  </q-page>
</template>

<script>
import RoverBadge from 'components/RoverBadge.vue'
import { getRovers, errorMessage } from 'src/services/marsvista'
import { formatNumber, roverSlug } from 'src/utils/format'

export default {
  name: 'PageRovers',
  components: { RoverBadge },
  data () {
    return {
      rovers: [],
      loading: true,
      error: ''
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    formatNumber,
    roverSlug,
    async load () {
      this.error = ''
      this.loading = true
      try {
        this.rovers = await getRovers()
      } catch (error) {
        this.error = errorMessage(error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style>
.qn-fleet {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}

.qn-fleet__card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--space-900);
  border: 1px solid var(--line);
}

.qn-fleet__facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3) var(--space-4);
  width: 100%;
  margin: 0 0 var(--space-2);
}

.qn-fleet__facts dd {
  margin: 2px 0 0;
  font-variant-numeric: tabular-nums;
}
</style>
