import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';

registerLocale('es', es);

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
        if (isOpen) {
            if (task) {
                setFormData({
                    ...task,
                    fechaLimite: task.fechaLimite ? new Date(task.fechaLimite) : null,
                    reminderDate: task.reminderDate ? new Date(task.reminderDate) : null
                });
            } else {
                setFormData({
                    titulo: '',
                    descripcion: '',
                    fechaLimite: null,
                    prioridad: 'Media',
                    estado: 'Por hacer',
                    cliente: '',
                    brief: '',
                    reminderDate: null
                });
            }
        }
    }, [task, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date, name) => {
        setFormData(prev => ({ ...prev, [name]: date }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            fechaLimite: formData.fechaLimite ? formData.fechaLimite.toISOString() : null,
            reminderDate: formData.reminderDate ? formData.reminderDate.toISOString() : null,
        };
        onSave(submissionData);
    };

    return (
        <div className="modal fade" ref={modalRef} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{task ? 'Editar Tarea' : 'Nueva Tarea'}</h5>
                        <button type="button" className="btn-close" onClick={(e) => { e.target.blur(); onClose(); }} aria-label="Close"></button>
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
                                <label htmlFor="brief" className="form-label">URL de Brief/Referencia</label>
                                <input type="url" name="brief" value={formData.brief || ''} onChange={handleChange} className="form-control" placeholder="https://..." />
                            </div>
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
                        <button type="button" className="btn btn-secondary" onClick={(e) => { e.target.blur(); onClose(); }}>Cerrar</button>
                        <button type="submit" form="task-form" className="btn btn-primary">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskModal;
