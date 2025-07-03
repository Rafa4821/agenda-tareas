import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useTheme } from './context/ThemeContext.jsx';
import Header from './components/Header';
import ViewToggles from './components/ViewToggles';
import FilterControls from './components/FilterControls';
import ListView from './components/ListView';
import KanbanView from './components/KanbanView';
import CalendarView from './components/CalendarView';
import TaskModal from './components/TaskModal';
import { streamTasks, saveTask, deleteTask, bulkDeleteTasks, updateTask } from './services/taskService';
import { ToastContainer, toast } from 'react-toastify';

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
    const { currentUser, logout } = useAuth();
    const { theme } = useTheme();
    const [tasks, setTasks] = useState([]);
    const [view, setView] = useState('list');
        const [filters, setFilters] = useState({ cliente: '', prioridad: 'all', tag: 'all', status: 'all', dateRange: 'all' });
    const [sortOptions, setSortOptions] = useState({ sortBy: 'fechaLimite', direction: 'asc' });
    const [editingTask, setEditingTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notifiedTaskIds, setNotifiedTaskIds] = useState(new Set());
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
        }, 60000);

        return () => clearInterval(intervalId);
    }, [tasks]);

    useEffect(() => {
        if (currentUser) {
            setLoading(true);
            // streamTasks devuelve una función para desuscribirse
            const unsubscribe = streamTasks(currentUser.uid, (tasks) => {
                setTasks(tasks);
                setLoading(false);
            });

            // Limpiar la suscripción cuando el componente se desmonte o el usuario cambie
            return () => unsubscribe();
        } else {
            setTasks([]); // Limpiar tareas si el usuario cierra sesión
        }
    }, [currentUser]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            tasks.forEach(task => {
                if (task.reminderDate && !task.completed && !notifiedTaskIds.has(task.id)) {
                    const reminderDate = new Date(task.reminderDate);
                    if (now >= reminderDate) {
                        toast.info(`Recordatorio: ${task.titulo}`);
                        setNotifiedTaskIds(prev => new Set(prev).add(task.id));
                    }
                }
            });
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [tasks, notifiedTaskIds]);

    const handleOpenModal = (task = null) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleTaskUpdate = async (updatedTask) => {
        try {
            await updateTask(updatedTask.id, updatedTask);
        } catch (error) {
            console.error("Error updating subtask status: ", error);
            alert('Error al actualizar la tarea.');
        }
    };

        const getNextDueDate = (currentDueDate, recurrence) => {
        if (!currentDueDate || !recurrence) return null;
        const date = new Date(currentDueDate);
        const { frequency, interval } = recurrence;

        if (frequency === 'daily') {
            date.setDate(date.getDate() + interval);
        } else if (frequency === 'weekly') {
            date.setDate(date.getDate() + 7 * interval);
        } else if (frequency === 'monthly') {
            date.setMonth(date.getMonth() + interval);
        }
        return date;
    };

    const handleSaveTask = async (taskData) => {
        try {
            if (taskData.isRecurring && taskData.estado === 'Completada') {
                const nextDueDate = getNextDueDate(taskData.fechaLimite, taskData.recurring);
                const nextReminderDate = taskData.reminderDate && nextDueDate 
                    ? new Date(nextDueDate.getTime() - (new Date(taskData.fechaLimite).getTime() - new Date(taskData.reminderDate).getTime()))
                    : null;

                const newTask = {
                    ...taskData,
                    id: undefined, // Firestore will generate a new ID
                    fechaLimite: nextDueDate ? nextDueDate.toISOString() : null,
                    reminderDate: nextReminderDate ? nextReminderDate.toISOString() : null,
                    estado: 'Por hacer',
                    completed: false,
                    subtasks: taskData.subtasks.map(st => ({ ...st, completed: false }))
                };

                const completedTask = { ...taskData, isRecurring: false };
                await updateTask(completedTask.id, completedTask);
                await saveTask(newTask, currentUser.uid);

            } else {
                await saveTask(taskData, currentUser.uid);
            }
        } catch (error) {
            console.error("Error saving task:", error);
        }
        handleCloseModal();
    };

    const handleDeleteTask = async (taskId) => {
        if (confirm('¿Estás seguro de que quieres borrar esta tarea?')) {
            await deleteTask(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
        }
    };

    const handleBulkDelete = async () => {
        if (confirm(`¿Estás seguro de que quieres borrar ${selectedTaskIds.size} tareas?`)) {
            await bulkDeleteTasks(selectedTaskIds);
            setTasks(tasks.filter(t => !selectedTaskIds.has(t.id)));
            setSelectedTaskIds(new Set());
        }
    };

    const allTags = [...new Set(tasks.flatMap(task => task.tags || []))];

        const filteredAndSortedTasks = tasks.filter(task => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const taskDueDate = task.fechaLimite ? new Date(task.fechaLimite) : null;
        if (taskDueDate) {
            taskDueDate.setHours(0, 0, 0, 0);
        }

        const checkDateRange = () => {
            if (filters.dateRange === 'all') return true;
            if (!taskDueDate) return false;

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() - today.getDay() + 7);

            if (filters.dateRange === 'overdue') return taskDueDate < today;
            if (filters.dateRange === 'today') return taskDueDate.getTime() === today.getTime();
            if (filters.dateRange === 'week') return taskDueDate >= today && taskDueDate <= endOfWeek;
            return true;
        };

        return (
            (filters.cliente === '' || (task.cliente && task.cliente.toLowerCase().includes(filters.cliente.toLowerCase()))) &&
            (filters.prioridad === 'all' || task.prioridad === filters.prioridad) &&
            (filters.tag === 'all' || (task.tags && task.tags.includes(filters.tag))) &&
            (filters.status === 'all' || task.status === filters.status) &&
            checkDateRange()
        );
    }).sort((a, b) => {
        const priorityValues = { 'Muy alta': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 };
        const dir = sortOptions.direction === 'asc' ? 1 : -1;

        if (sortOptions.sortBy === 'prioridad') {
            return (priorityValues[a.prioridad] - priorityValues[b.prioridad]) * dir;
        }
        if (sortOptions.sortBy === 'fechaLimite') {
            const dateA = a.fechaLimite ? new Date(a.fechaLimite) : 0;
            const dateB = b.fechaLimite ? new Date(b.fechaLimite) : 0;
            return (dateA - dateB) * dir;
        }
        if (sortOptions.sortBy === 'createdAt') {
            const dateA = a.createdAt?.toDate() || 0;
            const dateB = b.createdAt?.toDate() || 0;
            return (dateA - dateB) * dir;
        }
        return 0;
    });

    return (
        <div className="container my-4">
             <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={theme}
            />
            
            <Header onNewTask={() => handleOpenModal(null)} onLogout={logout} userEmail={currentUser?.email} />

                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-3">
                <ViewToggles currentView={view} setView={setView} />
                                <div className="w-100 mt-3 mt-md-0">
                    <FilterControls filters={filters} setFilters={setFilters} allTags={allTags} sortOptions={sortOptions} setSortOptions={setSortOptions} />
                </div>
            </div>

            <main className="pb-5">
                {loading && <p>Cargando tareas...</p>}
                {!loading && view === 'list' && 
                    <ListView 
                        tasks={filteredAndSortedTasks} 
                        onEdit={handleOpenModal} 
                        onDelete={handleDeleteTask} 
                        selectedIds={selectedTaskIds}
                        onSelectionChange={setSelectedTaskIds}
                        onTaskUpdate={handleTaskUpdate}
                    />}
                {!loading && view === 'kanban' && <KanbanView tasks={filteredAndSortedTasks} setTasks={setTasks} onEdit={handleOpenModal} />}
                {!loading && view === 'calendar' && <CalendarView tasks={filteredAndSortedTasks} onTaskClick={handleOpenModal} onTaskUpdate={handleTaskUpdate} />}
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
