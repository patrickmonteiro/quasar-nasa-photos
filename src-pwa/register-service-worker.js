import { register } from 'register-service-worker'
import { Dialog } from 'quasar'

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    // console.log('Service worker is active.')
  },

  registered (/* registration */) {
    // console.log('Service worker has been registered.')
  },

  cached (/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound (/* registration */) {
    // console.log('New content is downloading.')
  },

  updated (/* registration */) {
    setTimeout(() => {
      Dialog.create({
        title: 'Atualizações Disponíveis',
        message: 'Por favor recarregue seu app para aplicar a atualização e ter os novos recursos disponíveis.',
        persistent: true,
        ok: {
          push: true,
          label: 'Atualizar',
          color: 'positive',
          icon: 'mdi-cellphone-arrow-down'
        }
      }).onOk(() => {
        location.reload(true)
      })
    }, 3000)
  },

  offline () {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error (/* err */) {
    // console.error('Error during service worker registration:', err)
  }
})
