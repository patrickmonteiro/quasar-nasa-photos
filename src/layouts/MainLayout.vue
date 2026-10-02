<template>
  <q-layout view="hHh Lpr lFf">
    <q-header class="qn-appbar-wrap">
      <div class="qn-appbar">
        <router-link :to="{ name: 'home' }" class="qn-wordmark" aria-label="Quasar NASA home">
          <q-icon name="sym_o_rocket" class="qn-wordmark__mark" aria-hidden="true" />
          Quasar NASA
        </router-link>
        <div class="qn-appbar__spacer" />
        <q-btn
          flat
          no-caps
          class="qn-btn qn-btn--icon"
          :icon="$q.dark.isActive ? 'sym_o_light_mode' : 'sym_o_dark_mode'"
          :aria-label="$q.dark.isActive ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="toggleTheme"
        />
      </div>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :breakpoint="1023"
      :width="220"
      class="qn-drawer"
      bordered
    >
      <nav class="qn-nav" aria-label="Main">
        <router-link
          v-for="link in links"
          :key="link.route"
          :to="{ name: link.route }"
          :exact="link.exact"
          class="qn-nav__item"
          active-class="qn-nav__item--active"
          exact-active-class="qn-nav__item--active"
        >
          <q-icon :name="link.icon" aria-hidden="true" />
          {{ link.label }}
        </router-link>
      </nav>
    </q-drawer>

    <q-footer v-if="$q.screen.lt.md">
      <nav class="qn-bottomnav" aria-label="Main">
        <router-link
          v-for="link in links"
          :key="link.route"
          :to="{ name: link.route }"
          :exact="link.exact"
          class="qn-tab"
          active-class="qn-tab--active"
          exact-active-class="qn-tab--active"
        >
          <span class="qn-tab__icon"><q-icon :name="link.icon" aria-hidden="true" /></span>
          {{ link.label }}
        </router-link>
      </nav>
    </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { setTheme } from 'boot/theme'

export default {
  name: 'MainLayout',
  data () {
    return {
      drawer: false,
      links: [
        { route: 'home', label: 'Home', icon: 'sym_o_home', exact: true },
        { route: 'photos', label: 'Photos', icon: 'sym_o_photo_library', exact: false },
        { route: 'rovers', label: 'Rovers', icon: 'sym_o_satellite_alt', exact: false }
      ]
    }
  },
  methods: {
    toggleTheme () {
      setTheme(!this.$q.dark.isActive)
    }
  }
}
</script>
