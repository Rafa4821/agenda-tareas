const STORAGE_KEY = 'agendaAppTasks';

// Funciones privadas para interactuar con localStorage
function _getTasks() {
  try {
    const tasks = localStorage.getItem(STORAGE_KEY);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error("Error al leer tareas de localStorage", error);
    return [];
  }
}

function _saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error al guardar tareas en localStorage", error);
  }
}

// API pública del servicio (async para imitar a fetch y minimizar cambios en App.jsx)
export async function getTasks() {
  return Promise.resolve(_getTasks());
}

export async function saveTask(taskData) {
  let tasks = _getTasks();
  let savedTask;
  if (taskData.id) {
    // Actualizar tarea existente
    tasks = tasks.map(t =>
      t.id === taskData.id ? { ...t, ...taskData } : t
    );
    savedTask = tasks.find(t => t.id === taskData.id);
  } else {
    // Crear nueva tarea
    savedTask = { ...taskData, id: `task_${Date.now()}` };
    tasks.push(savedTask);
  }
  _saveTasks(tasks);
  return Promise.resolve(savedTask);
}

export async function deleteTask(taskId) {
  let tasks = _getTasks();
  tasks = tasks.filter(t => t.id !== taskId);
  _saveTasks(tasks);
  return Promise.resolve();
}

export async function bulkDeleteTasks(taskIds) {
    let tasks = _getTasks();
    // taskIds es un Set en App.jsx
    tasks = tasks.filter(t => !taskIds.has(t.id));
    _saveTasks(tasks);
    return Promise.resolve();
}
