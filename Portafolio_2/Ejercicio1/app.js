document.addEventListener('DOMContentLoaded', () => {
  const statusElement = document.getElementById('permission-status');
  const btnLocation = document.getElementById('btn-location');
  const coordsBox = document.getElementById('coords-box');
  const latElement = document.getElementById('latitude');
  const lngElement = document.getElementById('longitude');
  const accElement = document.getElementById('accuracy');

  let map = null;
  let marker = null;

  // 1. Verificación del estado de permisos con navigator.permissions.query
  async function checkGeolocationPermission() {
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        updatePermissionUI(permissionStatus.state);

        // Escuchar cambios de permiso dinámicamente
        permissionStatus.onchange = () => {
          updatePermissionUI(permissionStatus.state);
        };
      } catch (error) {
        statusElement.textContent = 'Error al consultar';
        console.error('Error en Permissions API:', error);
      }
    } else {
      statusElement.textContent = 'Permissions API no soportada';
    }
  }

  function updatePermissionUI(state) {
    statusElement.textContent = state.toUpperCase();
    statusElement.className = 'badge';

    if (state === 'granted') {
      statusElement.classList.add('granted');
    } else if (state === 'prompt') {
      statusElement.classList.add('prompt');
    } else if (state === 'denied') {
      statusElement.classList.add('denied');
    }
  }

  // 2. Solicitud de acceso al GPS mediante navigator.geolocation.getCurrentPosition
  function getLocation() {
    if ('geolocation' in navigator) {
      btnLocation.textContent = 'Obteniendo coordenadas...';
      btnLocation.disabled = true;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          // Desplegar datos en la vista
          latElement.textContent = latitude.toFixed(6);
          lngElement.textContent = longitude.toFixed(6);
          accElement.textContent = accuracy.toFixed(2);
          coordsBox.style.display = 'block';

          // Mostrar o actualizar mapa
          renderMap(latitude, longitude);

          btnLocation.textContent = 'Actualizar mi ubicación';
          btnLocation.disabled = false;
        },
        (error) => {
          btnLocation.textContent = 'Obtener mi ubicación GPS';
          btnLocation.disabled = false;
          handleError(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('La geolocalización no está soportada por este navegador.');
    }
  }

  // 3. Renderizar mapa interactivo con Leaflet
  function renderMap(lat, lng) {
    if (!map) {
      map = L.map('map').setView([lat, lng], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      marker = L.marker([lat, lng]).addTo(map)
        .bindPopup('<b>Ubicación Actual</b>')
        .openPopup();
    } else {
      map.setView([lat, lng], 16);
      marker.setLatLng([lat, lng])
        .bindPopup('<b>Ubicación Actualizada</b>')
        .openPopup();
    }
  }

  function handleError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        alert('Permiso de ubicación denegado.');
        break;
      case error.POSITION_UNAVAILABLE:
        alert('Ubicación no disponible.');
        break;
      case error.TIMEOUT:
        alert('Tiempo de espera agotado al consultar GPS.');
        break;
      default:
        alert('Error desconocido.');
        break;
    }
  }

  checkGeolocationPermission();
  btnLocation.addEventListener('click', getLocation);
});