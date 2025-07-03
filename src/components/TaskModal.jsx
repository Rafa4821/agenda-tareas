import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';

registerLocale('es', es);

const defaultFormData = {
    titulo: '',
    descripcion: '',
    fechaLimite: null,
    prioridad: 'Media',
    estado: 'Por hacer',
    cliente: '',
    brief: '',
    reminderDate: null,
    tags: [],
    subtasks: [],
    isRecurring: false,
    recurring: {
        frequency: 'daily',
        interval: 1
    }
};

function TaskModal({ isOpen, onClose, onSave, task }) {
    const [formData, setFormData] = useState(defaultFormData);
    const modalRef = useRef(null);
    const bsModalRef = useRef(null);

    useEffect(() => {
        const modalElement = modalRef.current;
        if (modalElement && !bsModalRef.current) {
            bsModalRef.current = new Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });

            // Accessibility fix: blur focused element inside modal before it hides
            modalElement.addEventListener('hide.bs.modal', () => {
                if (document.activeElement && modalElement.contains(document.activeElement)) {
                    document.activeElement.blur();
                }
            });
        }
    }, []);

    useEffect(() => {
        if (bsModalRef.current) {
            if (isOpen) {
                bsModalRef.current.show();
            } else if (bsModalRef.current._isShown) {
                bsModalRef.current.hide();
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (task) {
                setFormData({
                    ...defaultFormData,
                    ...task,
                    fechaLimite: task.fechaLimite ? new Date(task.fechaLimite) : null,
                    reminderDate: task.reminderDate ? new Date(task.reminderDate) : null,
                    tags: task.tags || [],
                    subtasks: task.subtasks || []
                });
            } else {
                setFormData(defaultFormData);
            }
        }
    }, [task, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
                if (name === 'tags') {
            const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
            setFormData(prev => ({ ...prev, [name]: tagsArray }));
        } else if (name.startsWith('recurring.')) {
            const key = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                recurring: { ...prev.recurring, [key]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleDateChange = (date, name) => {
        setFormData(prev => ({ ...prev, [name]: date }));
    };

    const handleAddSubtask = () => {
        const newSubtask = { id: `sub-${Date.now()}-${Math.random()}`, title: '', completed: false, fechaLimite: null, prioridad: 'Media', estado: 'Por hacer' };
        setFormData(prev => ({
            ...prev,
            subtasks: [...(prev.subtasks || []), newSubtask]
        }));
    };

    const handleRemoveSubtask = (subtaskId) => {
        setFormData(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter(sub => sub.id !== subtaskId)
        }));
    };

    const handleSubtaskTitleChange = (subtaskId, newTitle) => {
        setFormData(prev => ({
            ...prev,
            subtasks: prev.subtasks.map(sub =>
                sub.id === subtaskId ? { ...sub, title: newTitle } : sub
            )
        }));
    };

    const handleSubtaskCompletionChange = (subtaskId) => {
        setFormData(prev => ({
            ...prev,
            subtasks: prev.subtasks.map(sub =>
                sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
            )
        }));
    };

    const handleSubtaskChange = (e, index) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            subtasks: prev.subtasks.map((subtask, i) => i === index ? { ...subtask, [name]: type === 'checkbox' ? checked : value } : subtask)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            fechaLimite: formData.fechaLimite ? formData.fechaLimite.toISOString() : null,
            reminderDate: formData.reminderDate ? formData.reminderDate.toISOString() : null,
            tags: formData.tags.join(', '),
            subtasks: formData.subtasks.map(subtask => ({
                ...subtask,
                fechaLimite: subtask.fechaLimite ? subtask.fechaLimite.toISOString() : null
            }))
        };
        onSave(submissionData);
    };

    return (
        <div className="modal fade" ref={modalRef} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{task ? 'Editar Tarea' : 'Nueva Tarea'}</h5>
                        <button type="button" className="btn-close" onClick={() => onClose()} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit} id="task-form">
                            <div className="mb-3">
                                <label htmlFor="titulo" className="form-label">Título</label>
                                <input type="text" name="titulo" value={formData.titulo || ''} onChange={handleChange} className="form-control" required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="descripcion" className="form-label">Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} className="form-control" rows="3"></textarea>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="fechaLimite" className="form-label">Fecha límite</label>
                                    <DatePicker
                                        selected={formData.fechaLimite}
                                        onChange={date => handleDateChange(date, 'fechaLimite')}
                                        showTimeSelect
                                        dateFormat="dd/MM/yyyy h:mm aa"
                                        timeFormat="h:mm aa"
                                        locale="es"
                                        className="form-control"
                                        placeholderText="Selecciona fecha y hora"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="prioridad" className="form-label">Prioridad</label>
                                    <select name="prioridad" value={formData.prioridad || 'Media'} onChange={handleChange} className="form-select">
                                        <option>Baja</option><option>Media</option><option>Alta</option><option>Muy alta</option>
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="estado" className="form-label">Estado</label>
                                    <select name="estado" value={formData.estado || 'Por hacer'} onChange={handleChange} className="form-select">
                                        <option>Por hacer</option><option>En progreso</option><option>Hecho</option>
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="cliente" className="form-label">Cliente/Campaña</label>
                                    <input type="text" name="cliente" value={formData.cliente || ''} onChange={handleChange} className="form-control" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="tags" className="form-label">Etiquetas (separadas por coma)</label>
                                <input type="text" name="tags" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''} onChange={handleChange} className="form-control" placeholder="Ej: trabajo, urgente, casa" />
                            </div>

                            {/* Sub-tareas */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">Sub-tareas</label>
                                {formData.subtasks && formData.subtasks.map((subtask, index) => (
                                    <div key={subtask.id} className="input-group mb-2">
                                        <div className="input-group-text">
                                            <input
                                                className="form-check-input mt-0"
                                                type="checkbox"
                                                checked={!!subtask.completed}
                                                onChange={() => handleSubtaskCompletionChange(subtask.id)}
                                                aria-label="Checkbox for subtask"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={subtask.title}
                                            onChange={(e) => handleSubtaskTitleChange(subtask.id, e.target.value)}
                                            placeholder="Describe la sub-tarea..."
                                            style={{ textDecoration: subtask.completed ? 'line-through' : 'none' }}
                                        />
                                        <button className="btn btn-outline-danger" type="button" onClick={() => handleRemoveSubtask(subtask.id)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                ))}
                                <button className="btn btn-sm btn-outline-primary mt-2" type="button" onClick={handleAddSubtask}>
                                    <i className="bi bi-plus-lg me-1"></i>
                                    Añadir Sub-tarea
                                </button>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="brief" className="form-label">URL de Brief/Referencia</label>
                                <input type="url" name="brief" value={formData.brief || ''} onChange={handleChange} className="form-control" placeholder="https://..." />
                            </div>
                                                        {/* Recurrencia */}
                            <div className="mb-3">
                                <div className="form-check">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        name="isRecurring"
                                        id="isRecurring"
                                        checked={formData.isRecurring}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="isRecurring">
                                        Tarea Recurrente
                                    </label>
                                </div>
                            </div>

                            {formData.isRecurring && (
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="recurring-frequency" className="form-label">Frecuencia</label>
                                        <select 
                                            name="recurring.frequency"
                                            id="recurring-frequency"
                                            className="form-select"
                                            value={formData.recurring?.frequency || 'daily'}
                                            onChange={handleChange}
                                        >
                                            <option value="daily">Diaria</option>
                                            <option value="weekly">Semanal</option>
                                            <option value="monthly">Mensual</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="recurring-interval" className="form-label">Intervalo</label>
                                        <input 
                                            type="number"
                                            name="recurring.interval"
                                            id="recurring-interval"
                                            className="form-control"
                                            value={formData.recurring?.interval || 1}
                                            onChange={handleChange}
                                            min="1"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mb-3">
                                <label htmlFor="reminderDate" className="form-label">Avisar en (Opcional)</label>
                                <DatePicker
                                    selected={formData.reminderDate}
                                    onChange={date => handleDateChange(date, 'reminderDate')}
                                    showTimeSelect
                                    dateFormat="dd/MM/yyyy h:mm aa"
                                    timeFormat="h:mm aa"
                                    locale="es"
                                    className="form-control"
                                    placeholderText="Selecciona fecha y hora"
                                />
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                        <button type="submit" form="task-form" className="btn btn-primary">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskModal;
