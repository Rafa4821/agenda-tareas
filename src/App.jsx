import { useState, useEffect } from 'react';
import Header from './components/Header';
import ViewToggles from './components/ViewToggles';
import FilterControls from './components/FilterControls';
import ListView from './components/ListView';
import KanbanView from './components/KanbanView';
import CalendarView from './components/CalendarView';
import TaskModal from './components/TaskModal';

function BulkActionsBar({ selectedCount, onBulkDelete }) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed-bottom bg-light p-2 border-top shadow-lg">
      <div className="container d-flex justify-content-between align-items-center">
        <span className="fw-bold">{selectedCount} tarea(s) seleccionada(s)</span>
        <div>
          <button className="btn btn-danger" onClick={onBulkDelete}>
            <i className="bi bi-trash-fill me-2"></i>
            Eliminar Seleccionadas
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationToast({ message, onClose }) {
    return (
        <div className="toast show align-items-center text-white bg-primary border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
                <div className="toast-body">
                    {message}
                </div>
                <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={onClose} aria-label="Close"></button>
            </div>
        </div>
    );
}

function App() {
    const [tasks, setTasks] = useState([]);
    const [view, setView] = useState('list');
    const [filters, setFilters] = useState({ cliente: '', prioridad: 'all' });
    const [editingTask, setEditingTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const showNotification = (title, options) => {
        const newNotification = { id: Date.now(), message: `${title}: ${options.body}` };
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, options);
        } else {
            setNotifications(prev => [...prev, newNotification]);
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
            }, 6000);
        }
    };

    useEffect(() => {
        const notifiedTasks = new Set();
        const intervalId = setInterval(() => {
            const now = new Date();
            tasks.forEach(task => {
                if (task.reminderDate) {
                    const reminderTime = new Date(task.reminderDate);
                    const reminderId = `${task.id}-reminder`;
                    if (now >= reminderTime && now - reminderTime < 60000 && !notifiedTasks.has(reminderId)) {
                        showNotification('Recordatorio de Tarea', { body: `Es hora de empezar: "${task.titulo}"` });
                        notifiedTasks.add(reminderId);
                    }
                }

                if (task.fechaLimite) {
                    const dueTime = new Date(task.fechaLimite);
                    const timeDiff = dueTime - now;
                    const oneHour = 60 * 60 * 1000;
                    const dueId = `${task.id}-due`;
                    const overdueId = `${task.id}-overdue`;

                    if (timeDiff > 0 && timeDiff < oneHour && !notifiedTasks.has(dueId)) {
                        showNotification('Tarea por Vencer', { body: `La tarea "${task.titulo}" vence en menos de una hora.` });
                        notifiedTasks.add(dueId);
                    } else if (timeDiff < 0 && timeDiff > -60000 && !notifiedTasks.has(overdueId)) {
                        showNotification('Tarea Vencida', { body: `La tarea "${task.titulo}" acaba de vencer.` });
                        notifiedTasks.add(overdueId);
                    }
                }
            });
        }, 30000);

        return () => clearInterval(intervalId);
    }, [tasks]);

    useEffect(() => {
        setLoading(true);
        fetch('/api/tasks')
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => { setTasks(data); setLoading(false); })
            .catch(err => { console.error("Error fetching tasks:", err); setLoading(false); });
    }, []);

    const handleOpenModal = (task = null) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleSaveTask = async (taskData) => {
        const isUpdating = !!taskData.id;
        const url = isUpdating ? `/api/tasks?id=${taskData.id}` : '/api/tasks';
        const method = isUpdating ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
        });

        const savedTask = await response.json();

        if (isUpdating) {
            setTasks(tasks.map(t => t.id === savedTask.id ? savedTask : t));
        } else {
            setTasks([...tasks, savedTask]);
        }
        handleCloseModal();
    };

    const handleDeleteTask = async (taskId) => {
        if (confirm('¿Estás seguro de que quieres borrar esta tarea?')) {
            await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
            setTasks(tasks.filter(t => t.id !== taskId));
        }
    };

    const handleBulkDelete = async () => {
        if (confirm(`¿Estás seguro de que quieres borrar ${selectedTaskIds.size} tareas?`)) {
            const deletePromises = Array.from(selectedTaskIds).map(id =>
                fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
            );
            await Promise.all(deletePromises);
            setTasks(tasks.filter(t => !selectedTaskIds.has(t.id)));
            setSelectedTaskIds(new Set());
        }
    };

    const filteredTasks = tasks.filter(task =>
        (filters.cliente === '' || task.cliente.toLowerCase().includes(filters.cliente.toLowerCase())) &&
        (filters.prioridad === 'all' || task.prioridad === filters.prioridad)
    );

    return (
        <div className="container my-4">
            <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1100 }}>
                {notifications.map(notif => (
                    <NotificationToast 
                        key={notif.id} 
                        message={notif.message} 
                        onClose={() => setNotifications(n => n.filter(item => item.id !== notif.id))} 
                    />
                ))}
            </div>

            <Header onNewTask={() => handleOpenModal(null)} />

            <div className="d-flex justify-content-between align-items-center my-3">
                <ViewToggles currentView={view} setView={setView} />
                <FilterControls filters={filters} setFilters={setFilters} />
            </div>

            <main className="pb-5">
                {loading && <p>Cargando tareas...</p>}
                {!loading && view === 'list' && 
                    <ListView 
                        tasks={filteredTasks} 
                        onEdit={handleOpenModal} 
                        onDelete={handleDeleteTask} 
                        selectedIds={selectedTaskIds}
                        onSelectionChange={setSelectedTaskIds}
                    />}
                {!loading && view === 'kanban' && <KanbanView tasks={filteredTasks} setTasks={setTasks} onEdit={handleOpenModal} />}
                {!loading && view === 'calendar' && <CalendarView tasks={tasks} onTaskClick={handleOpenModal} />}
            </main>

            <TaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTask}
                task={editingTask}
            />

            <BulkActionsBar 
                selectedCount={selectedTaskIds.size} 
                onBulkDelete={handleBulkDelete} 
            />
        </div>
    );
}

export default App;
