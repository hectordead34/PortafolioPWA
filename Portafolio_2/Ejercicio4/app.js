document.addEventListener('DOMContentLoaded', () => {
  const dbStatus = document.getElementById('db-status');
  const todoForm = document.getElementById('todo-form');
  const taskList = document.getElementById('task-list');

  let db = null;
  const DB_NAME = 'PWA_Portfolio_DB';
  const STORE_NAME = 'tasks';

  // Inicialización y Apertura de IndexedDB
  const request = indexedDB.open(DB_NAME, 1);

  request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }
  };

  request.onsuccess = (e) => {
    db = e.target.result;
    dbStatus.textContent = 'CONECTADO';
    dbStatus.className = 'badge active';
    renderTasks();
  };

  request.onerror = (e) => {
    dbStatus.textContent = 'ERROR';
    dbStatus.className = 'badge error';
    console.error('Error IndexedDB:', e.target.error);
  };

  // Guardar un nuevo registro (Transaction WRITE)
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const desc = document.getElementById('task-desc').value;

    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    store.add({ title, desc, date: new Date().toLocaleString() });

    tx.oncomplete = () => {
      todoForm.reset();
      renderTasks();
    };
  });

  // Leer y Renderizar todos los registros (Transaction READONLY)
  function renderTasks() {
    taskList.innerHTML = '';
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const tasks = getAllRequest.result;

      if (tasks.length === 0) {
        taskList.innerHTML = '<li class="task-info"><p>No hay registros guardados en IndexedDB.</p></li>';
        return;
      }

      tasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
          <div class="task-info">
            <h3>${task.title}</h3>
            <p>${task.desc} — <small>${task.date}</small></p>
          </div>
          <button class="btn-delete" onclick="deleteTask(${task.id})">Eliminar</button>
        `;
        taskList.appendChild(li);
      });
    };
  }

  // Eliminar un registro por id
  window.deleteTask = (id) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);

    tx.oncomplete = () => {
      renderTasks();
    };
  };
});