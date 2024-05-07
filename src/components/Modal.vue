<template>
<q-dialog :value="modal" @hide="$emit('close')">
      <q-layout view="Lhh lpR fff" container class="bg-white">
        <q-header class="bg-primary">
          <q-toolbar>
            <q-toolbar-title>Header</q-toolbar-title>
            <q-btn flat round dense icon="close" @click="$emit('close')" />
          </q-toolbar>
        </q-header>

        <q-page-container>
          <q-page padding>
            <div class="bg-primary text-caption text-white q-mb-md q-pa-md" style="word-wrap: break-word; border-radius: 10px;">
              {{ imageUrl }}
            </div>

            <img
              :src="imageUrl"
            />
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>
</template>

<script>
export default {
  name: 'PagePhotos',
  props: {
    modal: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  data () {
  }
}
</script>
