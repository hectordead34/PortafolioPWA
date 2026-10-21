document.addEventListener('DOMContentLoaded', () => {
  const swStatus = document.getElementById('sw-status');
  const btnFetch = document.getElementById('btn-fetch');
  const resultBox = document.getElementById('result-box');

  // Registrar Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => {
        swStatus.textContent = 'ACTIVO';
        swStatus.className = 'badge active';
      })
      .catch((err) => {
        swStatus.textContent = 'ERROR';
        console.error('Error en SW:', err);
      });
  }
  // Consulta a la API
  btnFetch.addEventListener('click', async () => {
    resultBox.textContent = 'Consultando datos...';
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      const data = await res.json();
      resultBox.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      resultBox.textContent = 'Sin conexión a internet ni datos guardados en caché.';
    }
  });
});