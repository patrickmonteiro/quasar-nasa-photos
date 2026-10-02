<template>
  <span :class="['qn-badge', active ? 'qn-badge--active' : 'qn-badge--complete']">
    <q-icon :name="active ? 'sym_o_sensors' : 'sym_o_inventory_2'" aria-hidden="true" />
    {{ active ? 'Active' : 'Complete' }}
  </span>
</template>

<script>
// Status is always icon + word, never color alone
export default {
  name: 'RoverBadge',
  props: {
    status: {
      type: String,
      required: true
    }
  },
  computed: {
    active () {
      return this.status === 'active'
    }
  }
}
</script>
