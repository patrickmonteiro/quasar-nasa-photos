<template>
  <button type="button" class="qn-photo" @click="$emit('open')">
    <img
      :src="src"
      :alt="`${photo.rover.name} ${photo.camera.full_name}, Sol ${photo.sol}`"
      loading="lazy"
      @error="useOriginal"
    >
    <span class="qn-photo__caption">
      <span>
        <span class="qn-photo__title">{{ photo.camera.full_name }}</span>
        <span class="qn-photo__meta">Sol {{ photo.sol }} · {{ photo.earth_date }}</span>
      </span>
      <q-icon name="sym_o_open_in_full" class="qn-photo__action" aria-hidden="true" />
    </span>
  </button>
</template>

<script>
export default {
  name: 'PhotoCard',
  props: {
    photo: {
      type: Object,
      required: true
    },
    // Usually a Netlify Image CDN URL built from photo.img_src
    src: {
      type: String,
      required: true
    }
  },
  methods: {
    useOriginal (event) {
      // The CDN only proxies hosts allow-listed in netlify.toml; fall back to the source image
      if (event.target.src !== this.photo.img_src) event.target.src = this.photo.img_src
    }
  }
}
</script>

<style>
button.qn-photo {
  width: 100%;
  padding: 0;
  font: inherit;
  text-align: left;
  cursor: zoom-in;
}

.qn-photo__title,
.qn-photo__meta {
  display: block;
}
</style>
