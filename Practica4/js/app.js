if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrado correctamente:', registration.scope);
      })
      .catch((error) => {
        console.error('Error al registrar el SW:', error);
      });
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const statusText = document.getElementById('status');
  const testBtn = document.getElementById('btn-test');

  const updateOnlineStatus = () => {
    if (navigator.onLine) {
      statusText.textContent = '🟢 Conectado a la red';
      statusText.style.color = '#2e7d32';
    } else {
      statusText.textContent = '🔴 Modo Offline (Sirviendo desde caché)';
      statusText.style.color = '#c62828';
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  testBtn.addEventListener('click', () => {
    alert('¡El App Shell está funcionando!');
  });
});