function Header({ onNewTask }) {
    return (
        <header className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
            <h1 className="h3"><i className="bi bi-check2-square me-2"></i>Agenda de Tareas</h1>
            <button onClick={onNewTask} className="btn btn-primary">
                <i className="bi bi-plus-lg me-1"></i> Nueva Tarea
            </button>
        </header>
    );
}

export default Header;
