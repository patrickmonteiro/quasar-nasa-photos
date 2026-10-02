<template>
  <div class="fullscreen flex flex-center qn-lost">
    <div class="qn-empty">
      <q-icon name="sym_o_satellite_alt" class="qn-empty__icon" />
      <p class="qn-overline">Error 404</p>
      <h1 class="qn-empty__title">Signal lost</h1>
      <p class="qn-empty__text">This page isn't on any rover's route.</p>
      <q-btn
        unelevated
        no-caps
        class="qn-btn qn-btn--primary"
        icon="sym_o_home"
        label="Back to Home"
        :to="{ name: 'home' }"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error404'
}
</script>

<style>
.qn-lost {
  padding: var(--space-4);
  background: var(--space-950);
}
</style>
