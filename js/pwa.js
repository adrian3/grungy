(function () {
  var button = document.getElementById('install-button');
  var status = document.getElementById('offline-status');
  var installPrompt;
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    installPrompt = event;
    button.hidden = false;
  });
  button.addEventListener('click', async function () {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    button.hidden = true;
  });
  window.addEventListener('appinstalled', function () { button.hidden = true; });
  if (!('serviceWorker' in navigator)) {
    status.textContent = 'Offline use is not supported by this browser. You can still use Grungy online.';
    return;
  }
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    status.textContent = 'Ready for offline use. Your photos are edited on this device.';
  });
  navigator.serviceWorker.register('service-worker.js', {scope: './'}).then(function (registration) {
    if (registration.active) status.textContent = 'Ready for offline use. Your photos are edited on this device.';
    function watch(worker) {
      if (!worker) return;
      worker.addEventListener('statechange', function () {
        if (worker.state === 'redundant') status.textContent = 'Offline download could not finish. Reopen Grungy online to try again.';
      });
    }
    watch(registration.installing);
    registration.addEventListener('updatefound', function () { watch(registration.installing); });
  }).catch(function () {
    status.textContent = 'Offline download could not finish. Reopen Grungy online to try again.';
  });
})();
