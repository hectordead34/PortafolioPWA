document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const photo = document.getElementById('photo');
  const btnStart = document.getElementById('btn-start');
  const btnCapture = document.getElementById('btn-capture');
  const btnStop = document.getElementById('btn-stop');
  const cameraStatus = document.getElementById('camera-status');

  let stream = null;

  async function checkCameraPermission() {
    if ('permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'camera' });
        updateStatusUI(status.state);

        status.onchange = () => {
          updateStatusUI(status.state);
        };
      } catch (e) {
        updateStatusUI('Inactivo');
      }
    }
  }

  function updateStatusUI(state) {
    cameraStatus.textContent = state.toUpperCase();
    cameraStatus.className = 'badge ' + (state === 'granted' || state === 'Activo' ? 'active' : 'inactive');
  }

  async function startCamera() {
    if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
      alert('Tu navegador no soporta el acceso a la cámara.');
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      video.srcObject = stream;
      updateStatusUI('Activo');

      btnStart.disabled = true;
      btnCapture.disabled = false;
      btnStop.disabled = false;
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara. Revisa los permisos de tu navegador.');
      updateStatusUI('denied');
    }
  }

  function capturePhoto() {
    if (!stream) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/png');
    photo.src = imageDataUrl;
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
      stream = null;

      updateStatusUI('Inactivo');
      btnStart.disabled = false;
      btnCapture.disabled = true;
      btnStop.disabled = true;
    }
  }

  checkCameraPermission();
  btnStart.addEventListener('click', startCamera);
  btnCapture.addEventListener('click', capturePhoto);
  btnStop.addEventListener('click', stopCamera);
});