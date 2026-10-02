<template>
  <q-dialog
    :value="value"
    maximized
    transition-show="fade"
    transition-hide="fade"
    @input="$emit('input', $event)"
  >
    <div v-if="photo" class="qn-viewer">
      <div class="qn-viewer__stage">
        <img :key="photo.id" :src="photo.img_src" :alt="`${photo.rover.name} ${photo.camera.full_name}, Sol ${photo.sol}`">

        <q-btn
          v-if="index > 0"
          flat
          class="qn-btn qn-btn--icon qn-viewer__nav qn-viewer__nav--prev"
          icon="sym_o_chevron_left"
          aria-label="Previous photo"
          @click="step(-1)"
        />
        <q-btn
          v-if="index < photos.length - 1"
          flat
          class="qn-btn qn-btn--icon qn-viewer__nav qn-viewer__nav--next"
          icon="sym_o_chevron_right"
          aria-label="Next photo"
          @click="step(1)"
        />
      </div>

      <aside class="qn-viewer__info">
        <div class="qn-viewer__top">
          <span class="qn-overline">{{ index + 1 }} of {{ photos.length }}</span>
          <q-btn v-close-popup flat class="qn-btn qn-btn--icon" icon="sym_o_close" aria-label="Close" />
        </div>

        <div>
          <span class="qn-badge qn-badge--camera">{{ photo.camera.name }}</span>
          <h2 class="title q-mt-sm">{{ photo.camera.full_name }}</h2>
        </div>

        <dl class="qn-viewer__facts">
          <dt class="qn-overline">Rover</dt>
          <dd class="data">{{ photo.rover.name }}</dd>
          <dt class="qn-overline">Sol</dt>
          <dd class="data">{{ photo.sol }}</dd>
          <dt class="qn-overline">Earth date</dt>
          <dd class="data">{{ photo.earth_date }}</dd>
          <dt class="qn-overline">Photo ID</dt>
          <dd class="data">{{ photo.id }}</dd>
        </dl>

        <q-btn
          unelevated
          no-caps
          class="qn-btn qn-btn--primary"
          icon="sym_o_open_in_new"
          label="Open original image"
          type="a"
          :href="photo.img_src"
          target="_blank"
          rel="noopener"
        />

        <p class="qn-credit">Image credit: NASA/JPL-Caltech</p>

        <div class="qn-viewer__cdn">
          <p class="qn-overline">Thumbnail URL (Netlify Image CDN)</p>
          <code>{{ thumbnailUrl(photo) }}</code>
        </div>
      </aside>
    </div>
  </q-dialog>
</template>

<script>
export default {
  name: 'PhotoViewer',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    photos: {
      type: Array,
      default: () => []
    },
    index: {
      type: Number,
      default: 0
    },
    thumbnailUrl: {
      type: Function,
      required: true
    }
  },
  computed: {
    photo () {
      return this.photos[this.index]
    }
  },
  watch: {
    value (open) {
      window[open ? 'addEventListener' : 'removeEventListener']('keydown', this.onKeydown)
    }
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    onKeydown (event) {
      if (event.key === 'ArrowLeft') this.step(-1)
      if (event.key === 'ArrowRight') this.step(1)
    },
    step (delta) {
      const next = this.index + delta
      if (next >= 0 && next < this.photos.length) this.$emit('update:index', next)
    }
  }
}
</script>

<style>
.qn-viewer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  width: 100vw;
  height: 100vh;
  background: var(--scrim);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: var(--ink);
}

.qn-viewer__stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-5);
  min-height: 0;
}

.qn-viewer__stage img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--radius-lg);
}

.qn-viewer__nav.q-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--scrim);
  color: #eef2f8;
}

.qn-viewer__nav--prev {
  left: var(--space-4);
}

.qn-viewer__nav--next {
  right: var(--space-4);
}

.qn-viewer__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5) var(--space-5);
  border-left: 1px solid var(--line);
  background: var(--space-900);
  box-shadow: var(--shadow-raised);
  overflow-y: auto;
}

.qn-viewer__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qn-viewer__facts {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  gap: var(--space-2) var(--space-4);
  margin: 0;
}

.qn-viewer__facts dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.qn-viewer__cdn {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.qn-viewer__cdn code {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--space-800);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 18px;
  word-break: break-all;
}

@media (max-width: 1023px) {
  .qn-viewer {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .qn-viewer__stage {
    padding: var(--space-3);
  }

  .qn-viewer__info {
    border-left: 0;
    border-top: 1px solid var(--line);
    max-height: 45vh;
  }
}
</style>
