import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Header({ onNewTask, onLogout, userEmail }) {
    const { theme, toggleTheme } = useTheme();
    const { handleLogout } = useAuth();

    return (
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <div>
                <h1 className="h3">Mi Agenda de Tareas</h1>
                {userEmail && <span className="text-muted fs-6">{userEmail}</span>}
            </div>
            <div>
                <button className="btn btn-primary me-2" onClick={onNewTask}>
                    <i className="bi bi-plus-lg me-2"></i>
                    Nueva Tarea
                </button>
                <button onClick={toggleTheme} className="btn btn-outline-secondary me-2">
                    <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
                </button>
                <button onClick={handleLogout} className="btn btn-outline-secondary">
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
