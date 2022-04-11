if ('serviceWorker' in navigator) {
  {{#showLog}}
  window.addEventListener('custom:sw', function(event) {
    var eventName = event.detail.eventName;
    switch (eventName) {
      case 'ready':
        console.log(
          'App is being served from cache by a service worker.\n' +
            'For more details, visit https://goo.gl/AFskqB',
        );
        break;
      case 'registered':
        console.log('Service worker has been registered.');
        break;
      case 'cached':
        console.log('Content has been cached for offline use.');
        break;
      case 'updatefound':
        console.log('New content is downloading.');
        break;
      case 'updated':
        console.log('New content is available; please refresh.');
        break;
      case 'offline':
        console.log(
          'No internet connection found. App is running in offline mode.',
        );
        break;
      case 'error':
        console.error(
          'Error during service worker registration:',
          event.detail.info,
        );
        break;
    }
  });
  {{/showLog}}

  window.addEventListener('load', function() {
    navigator.serviceWorker
      .register('{{{publicPath}}}service-worker.js')
      .then(function(registration) {
        emit('registered', registration);
        if (registration.waiting) {
          emit('updated', registration);
          return;
        }
        registration.onupdatefound = function() {
          emit('updatefound', registration);
          const installingWorker = registration.installing;
          installingWorker.onstatechange = function() {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                emit('updated', registration);
                {{#autoRefresh}}
                console.log('Auto refresh is triggered.');
                location.reload();
                {{/autoRefresh}}
              } else {
                emit('cached', registration);
              }
            }
          };
        };
      })
      .catch(function(error) {
        handleError(error);
      });
    navigator.serviceWorker.ready
      .then(function(registration) {
        emit('ready', registration);
      })
      .catch(function(error) {
        handleError(error);
      });
  });

  function emit(eventName, info) {
    var event = new CustomEvent('custom:sw', { detail: { eventName, info } });
    window.dispatchEvent(event);
  }

  function handleError(error) {
    if (!navigator.onLine) {
      emit('offline');
    }
    emit('error', error);
  }
}
