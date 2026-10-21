document.addEventListener('DOMContentLoaded', async () => {
  const $ = id => document.getElementById(id);
  const swStatus = $('sw-status'), notifStatus =$('notif-status');
  const btnRequest = $('btn-request'), btnNotify = $('btn-notify'), logBox =$('log-box');
  let reg = null;

  const log = msg => {
    logBox.innerHTML += `<p class="log-item">[${new Date().toLocaleTimeString()}] ${msg}</p>`;
    logBox.scrollTop = logBox.scrollHeight;
  };

  const updateNotifUI = (perm) => {
    notifStatus.textContent = perm.toUpperCase();
    notifStatus.className = `badge ${perm === 'granted' ? 'granted' : perm === 'denied' ? 'denied' : 'prompt'}`;
    btnNotify.disabled = perm !== 'granted';
  };

  // 1. Registro de Service Worker
  if ('serviceWorker' in navigator) {
    try {
      reg = await navigator.serviceWorker.register('sw.js');
      swStatus.textContent = 'ACTIVO';
      swStatus.className = 'badge granted';
      log('Service Worker registrado.');
    } catch (e) {
      swStatus.textContent = 'ERROR';
      swStatus.className = 'badge denied';
    }
  }

  // 2. Estado inicial de permisos
  if ('Notification' in window) updateNotifUI(Notification.permission);

  // 3. Solicitud de Permisos (Notification.requestPermission)
  btnRequest.addEventListener('click', async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    updateNotifUI(perm);
    log(`Estado de permiso: ${perm}`);
  });

  // 4. Disparo de Notificación Local vía Service Worker
  btnNotify.addEventListener('click', () => {
    if (reg && Notification.permission === 'granted') {
      reg.showNotification('PWA: Notificación Local', {
        body: '¡Notificación enviada con éxito desde el Service Worker!',
        icon: 'https://cdn-icons-png.flaticon.com/512/2523/2523185.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/2523/2523185.png',
        vibrate: [200, 100, 200],
        actions: [{ action: 'explore', title: 'Ver' }, { action: 'close', title: 'Cerrar' }]
      });
      log('Notificación disparada desde self.registration');
    }
  });
});