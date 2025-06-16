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

const getDaysRemaining = (dueDate) => {
    if (!dueDate) return { text: 'N/A', class: '' };
    const diffTime = new Date(dueDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Vencida hace ${Math.abs(diffDays)} días`, class: 'text-danger fw-bold' };
    if (diffDays === 0) return { text: 'Vence hoy', class: 'text-warning fw-bold' };
    return { text: `${diffDays} días`, class: '' };
};

function ListView({ tasks, onEdit, onDelete, selectedIds, onSelectionChange }) {
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
        <div className="table-responsive">
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
                            <tr key={task.id} className={selectedIds.has(task.id) ? 'table-primary' : ''}>
                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectedIds.has(task.id)}
                                        onChange={(e) => handleSelectOne(e, task.id)}
                                    />
                                </td>
                                <td>{task.titulo}</td>
                                <td>{task.cliente}</td>
                                <td>
                                    {task.fechaLimite ? new Date(task.fechaLimite).toLocaleDateString() : 'N/A'}
                                    <br />
                                    <small className={daysRemaining.class}>{daysRemaining.text}</small>
                                </td>
                                <td><span className={`badge bg-light ${priorityClass}`}>{task.prioridad}</span></td>
                                <td>{task.estado}</td>
                                <td className="text-end">
                                    {task.brief && <a href={task.brief} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary me-2" title="Ver brief"><i className="bi bi-link-45deg"></i></a>}
                                    <button onClick={() => onEdit(task)} className="btn btn-sm btn-outline-primary me-2" title="Editar"><i className="bi bi-pencil"></i></button>
                                    <button onClick={() => onDelete(task.id)} className="btn btn-sm btn-outline-danger" title="Eliminar"><i className="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default ListView;
