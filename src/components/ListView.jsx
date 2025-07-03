import React from 'react';

const getPriorityClass = (priority) => {
    switch (priority) {
        case 'Muy alta': return 'text-danger';
        case 'Alta': return 'text-warning';
        case 'Media': return 'text-primary';
        case 'Baja': return 'text-success';
        default: return '';
    }
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

const getTagColor = (tag) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'];
    const index = Math.abs(hash % colors.length);
    return `bg-${colors[index]}`;
};

const getDaysRemaining = (dueDate) => {
    if (!dueDate) return { text: 'N/A', class: '' };
    const diffTime = new Date(dueDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Vencida hace ${Math.abs(diffDays)} días`, class: 'text-danger fw-bold' };
    if (diffDays === 0) return { text: 'Vence hoy', class: 'text-warning fw-bold' };
    return { text: `${diffDays} días`, class: '' };
};

function ListView({ tasks, onEdit, onDelete, selectedIds, onSelectionChange, onTaskUpdate }) {
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            onSelectionChange(new Set(tasks.map(t => t.id)));
        } else {
            onSelectionChange(new Set());
        }
    };

    const handleSelectOne = (e, taskId) => {
        const newSelection = new Set(selectedIds);
        if (e.target.checked) {
            newSelection.add(taskId);
        } else {
            newSelection.delete(taskId);
        }
        onSelectionChange(newSelection);
    };

    return (
        <div className="list-view-container">
                        {/* Desktop View: Table */}
            <div className="table-responsive d-none d-md-block">
                <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th scope="col" className="text-center" style={{ width: '5%' }}>
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={tasks.length > 0 && selectedIds.size === tasks.length}
                                onChange={handleSelectAll}
                                title="Seleccionar todo"
                            />
                        </th>
                        <th scope="col">Título</th>
                        <th scope="col">Cliente/Campaña</th>
                        <th scope="col">Fecha Límite</th>
                        <th scope="col">Prioridad</th>
                        <th scope="col">Estado</th>
                        <th scope="col" className="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => {
                        const priorityClass = getPriorityClass(task.prioridad);
                        const daysRemaining = getDaysRemaining(task.fechaLimite);
                        return (
                            <React.Fragment key={task.id}>
                                <tr className={selectedIds.has(task.id) ? 'table-primary' : ''}>
                                    <td className="text-center align-middle">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={selectedIds.has(task.id)}
                                            onChange={(e) => handleSelectOne(e, task.id)}
                                        />
                                    </td>
                                    <td className="align-middle">
                                        {task.titulo}
                                    </td>
                                    <td className="align-middle">{task.cliente}</td>
                                    <td className="align-middle">
                                        {formatDateTime(task.fechaLimite)}
                                        <br />
                                        <small className={daysRemaining.class}>{daysRemaining.text}</small>
                                    </td>
                                    <td className="align-middle"><span className={`badge bg-light ${priorityClass}`}>{task.prioridad}</span></td>
                                    <td className="align-middle">{task.estado}</td>
                                    <td className="align-middle text-end">
                                        {task.brief && <a href={task.brief} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary me-2" title="Ver brief"><i className="bi bi-link-45deg"></i></a>}
                                        <button onClick={() => onEdit(task)} className="btn btn-sm btn-outline-primary me-2" title="Editar"><i className="bi bi-pencil"></i></button>
                                        <button onClick={() => onDelete(task.id)} className="btn btn-sm btn-outline-danger" title="Eliminar"><i className="bi bi-trash"></i></button>
                                    </td>
                                </tr>
                                {task.subtasks && task.subtasks.length > 0 && (
                                    <tr className={selectedIds.has(task.id) ? 'table-primary-subtask' : ''}>
                                        <td></td>
                                        <td colSpan="6" className="p-0">
                                            <div className="px-4 py-2">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <small className="fw-bold">Sub-tareas ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})</small>
                                                </div>
                                                <div className="progress" style={{ height: '5px' }}>
                                                    <div 
                                                        className="progress-bar bg-success"
                                                        role="progressbar" 
                                                        style={{ width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%` }}
                                                        aria-valuenow={(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}
                                                        aria-valuemin="0" 
                                                        aria-valuemax="100">
                                                    </div>
                                                </div>
                                                <ul className="list-unstyled mt-2 mb-0">
                                                    {task.subtasks.map(subtask => (
                                                        <li key={subtask.id} className="d-flex align-items-center">
                                                            <input 
                                                                type="checkbox" 
                                                                className="form-check-input me-2"
                                                                checked={!!subtask.completed}
                                                                onChange={() => {
                                                                    const updatedSubtasks = task.subtasks.map(st => 
                                                                        st.id === subtask.id ? { ...st, completed: !st.completed } : st
                                                                    );
                                                                    onTaskUpdate({ ...task, subtasks: updatedSubtasks });
                                                                }}
                                                            />
                                                            <span style={{ textDecoration: subtask.completed ? 'line-through' : 'none' }}>
                                                                {subtask.title}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
                            </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="d-md-none">
                {tasks.map(task => {
                    const priorityClass = getPriorityClass(task.prioridad);
                    const daysRemaining = getDaysRemaining(task.fechaLimite);
                    const progress = task.subtasks && task.subtasks.length > 0 ? (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100 : 0;

                    return (
                        <div key={task.id} className={`card task-card mb-3 ${selectedIds.has(task.id) ? 'selected' : ''}`}>
                            <div className="card-body">
                                <div className="d-flex">
                                    <input
                                        type="checkbox"
                                        className="form-check-input me-3 mt-1"
                                        checked={selectedIds.has(task.id)}
                                        onChange={(e) => handleSelectOne(e, task.id)}
                                    />
                                    <div className="flex-grow-1">
                                        <h5 className="card-title mb-1">{task.titulo}</h5>
                                        {task.cliente && <p className="card-subtitle mb-2 text-muted">{task.cliente}</p>}
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <button onClick={() => onEdit(task)} className="btn btn-sm btn-outline-primary me-2" title="Editar"><i className="bi bi-pencil"></i></button>
                                        <button onClick={() => onDelete(task.id)} className="btn btn-sm btn-outline-danger" title="Eliminar"><i className="bi bi-trash"></i></button>
                                    </div>
                                </div>
                                
                                <div className="task-details mt-3">
                                    <div className="row">
                                        <div className="col-6"><strong className="d-block">Estado:</strong> {task.estado}</div>
                                        <div className="col-6"><strong className="d-block">Prioridad:</strong> <span className={priorityClass}>{task.prioridad}</span></div>
                                        <div className="col-12 mt-2"><strong className="d-block">Vencimiento:</strong> <span className={daysRemaining.class}>{daysRemaining.text}</span></div>
                                    </div>
                                </div>

                                {task.subtasks && task.subtasks.length > 0 && (
                                    <div className="subtasks-section mt-3">
                                        <small className="fw-bold">Sub-tareas ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})</small>
                                        <div className="progress mt-1" style={{ height: '5px' }}>
                                            <div className="progress-bar bg-success" role="progressbar" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <ul className="list-unstyled mt-2 mb-0">
                                            {task.subtasks.map(subtask => (
                                                <li key={subtask.id} className="d-flex align-items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="form-check-input me-2"
                                                        checked={!!subtask.completed}
                                                        onChange={() => {
                                                            const updatedSubtasks = task.subtasks.map(st => 
                                                                st.id === subtask.id ? { ...st, completed: !st.completed } : st
                                                            );
                                                            onTaskUpdate({ ...task, subtasks: updatedSubtasks });
                                                        }}
                                                    />
                                                    <span style={{ textDecoration: subtask.completed ? 'line-through' : 'none' }}>
                                                        {subtask.title}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ListView;
