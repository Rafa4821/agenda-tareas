import React from 'react';

const getPriorityClass = (prioridad) => {
    switch (prioridad) {
        case 'Muy alta': return 'text-bg-danger';
        case 'Alta': return 'text-bg-warning';
        case 'Media': return 'text-bg-info';
        case 'Baja': return 'text-bg-success';
        default: return 'text-bg-secondary';
    }
};

function KanbanCard({ task, onEdit }) {
    const priorityClass = getPriorityClass(task.prioridad);

    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData("taskId", taskId);
    };

    return (
        <div
            className="card kanban-card mb-2"
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
            onClick={() => onEdit(task)}
        >
            <div className="card-body p-2">
                <div className="d-flex justify-content-between">
                    <h6 className="card-title mb-1">{task.titulo}</h6>
                    <span className={`badge ${priorityClass} ms-2`}>{task.prioridad}</span>
                </div>
                <p className="card-subtitle mb-0 text-muted small">{task.cliente || 'Sin cliente'}</p>
            </div>
        </div>
    );
}

function KanbanColumn({ status, tasks, onEdit, onDrop }) {
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className="col-md-4">
            <div className="kanban-col p-2 rounded bg-light" onDragOver={handleDragOver} onDrop={(e) => onDrop(e, status)}>
                <h4 className="h6 mb-3 text-center">{status}</h4>
                <div className="kanban-tasks">
                    {tasks.map(task => (
                        <KanbanCard key={task.id} task={task} onEdit={onEdit} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function KanbanView({ tasks, setTasks, onEdit }) {
    const statuses = ['Por hacer', 'En progreso', 'Hecho'];

    const handleDrop = (e, newStatus) => {
        const taskId = e.dataTransfer.getData("taskId");
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, estado: newStatus } : task
            )
        );
    };

    return (
        <div className="row g-3">
            {statuses.map(status => (
                <KanbanColumn
                    key={status}
                    status={status}
                    tasks={tasks.filter(t => t.estado === status)}
                    onEdit={onEdit}
                    onDrop={handleDrop}
                />
            ))}
        </div>
    );
}

export default KanbanView;
