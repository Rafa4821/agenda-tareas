import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';

function TaskModal({ isOpen, onClose, onSave, task }) {
    const [formData, setFormData] = useState({});
    const modalRef = useRef(null);
    const bsModalRef = useRef(null);

    useEffect(() => {
        if (modalRef.current && !bsModalRef.current) {
            bsModalRef.current = new Modal(modalRef.current, {
                backdrop: 'static',
                keyboard: false
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
        if (task) {
            const formatForInput = (dateStr) => dateStr ? new Date(dateStr).toISOString().slice(0, 16) : '';
            setFormData({ 
                ...task, 
                fechaLimite: formatForInput(task.fechaLimite),
                reminderDate: formatForInput(task.reminderDate)
            });
        } else {
            setFormData({
                titulo: '',
                descripcion: '',
                fechaLimite: '',
                prioridad: 'Media',
                estado: 'Por hacer',
                cliente: '',
                brief: '',
                reminderDate: ''
            });
        }
    }, [task, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal fade" ref={modalRef} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{task ? 'Editar Tarea' : 'Nueva Tarea'}</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
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
                                    <input type="datetime-local" name="fechaLimite" value={formData.fechaLimite || ''} onChange={handleChange} className="form-control" />
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
                                <label htmlFor="brief" className="form-label">URL de Brief/Referencia</label>
                                <input type="url" name="brief" value={formData.brief || ''} onChange={handleChange} className="form-control" placeholder="https://..." />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="reminderDate" className="form-label">Avisar en (Opcional)</label>
                                <input type="datetime-local" name="reminderDate" value={formData.reminderDate || ''} onChange={handleChange} className="form-control" />
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
