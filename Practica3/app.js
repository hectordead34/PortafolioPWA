
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('Service Worker registrado con éxito:', reg.scope);
      })
      .catch((err) => {
        console.error('Error al registrar Service Worker:', err);
      });
  });
}

let db;
const requestDB = indexedDB.open('PWA_Practica_DB', 1);

// Creación de la base de datos y almacén de objetos
requestDB.onupgradeneeded = (e) => {
  db = e.target.result;
  if (!db.objectStoreNames.contains('registros')) {
    db.createObjectStore('registros', { keyPath: 'id', autoIncrement: true });
  }
};

requestDB.onsuccess = (e) => {
  db = e.target.result;
  console.log('Base de datos IndexedDB abierta correctamente.');
  mostrarRegistros();
};

requestDB.onerror = (e) => {
  console.error('Error en IndexedDB:', e.target.errorCode);
};

// Guardar un nuevo registro
function guardarRegistro(texto) {
  if (!db) return;

  const tx = db.transaction(['registros'], 'readwrite');
  const store = tx.objectStore('registros');
  const nuevoDato = {
    titulo: texto,
    fecha: new Date().toLocaleString()
  };

  store.add(nuevoDato);

  tx.oncomplete = () => {
    console.log('Registro guardado en IndexedDB:', nuevoDato);
    mostrarRegistros();
  };
}

// Consultar y mostrar los registros en el HTML
function mostrarRegistros() {
  if (!db) return;

  const tx = db.transaction(['registros'], 'readonly');
  const store = tx.objectStore('registros');
  const request = store.getAll();

  request.onsuccess = () => {
    const lista = document.getElementById('data-container');
    const items = request.result;

    if (!lista) return;

    if (items.length === 0) {
      lista.innerHTML = '<p>No hay registros guardados aún.</p>';
      return;
    }

    let html = '<ul style="list-style: none; padding: 0; margin-top: 10px;">';
    items.forEach((item) => {
      html += `
        <li style="background: #f0f4f8; padding: 8px; margin-bottom: 6px; border-radius: 4px;">
          <strong>${item.titulo}</strong> <br>
          <small style="color: #666;">${item.fecha}</small>
        </li>
      `;
    });
    html += '</ul>';

    lista.innerHTML = html;
  };
}

// Evento del formulario / botón para agregar un registro
document.addEventListener('DOMContentLoaded', () => {
  const btnAgregar = document.getElementById('btn-agregar');
  const inputTexto = document.getElementById('input-registro');

  if (btnAgregar && inputTexto) {
    btnAgregar.addEventListener('click', () => {
      const valor = inputTexto.value.trim();
      if (valor) {
        guardarRegistro(valor);
        inputTexto.value = '';
      }
    });
  }
});