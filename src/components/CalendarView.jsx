import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';

function CalendarView({ tasks, onTaskClick }) {
    const events = tasks.map(task => ({
        id: task.id,
        title: task.titulo,
        start: task.fechaLimite,
        allDay: true, // Asumimos que las tareas duran todo el día
        extendedProps: { ...task },
        // Asignar colores basados en prioridad
        backgroundColor: getPriorityColor(task.prioridad),
        borderColor: getPriorityColor(task.prioridad)
    }));

    const handleEventClick = (clickInfo) => {
        // Usamos las props extendidas para pasar la tarea completa
        onTaskClick(clickInfo.event.extendedProps);
    };

    return (
        <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, bootstrap5Plugin]}
            initialView="dayGridMonth"
            themeSystem='bootstrap5'
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek,dayGridDay'
            }}
            events={events}
            eventClick={handleEventClick}
            locale='es' // Poner el calendario en español
            buttonText={{
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día'
            }}
        />
    );
}

function getPriorityColor(prioridad) {
    switch (prioridad) {
        case 'Muy alta': return '#dc3545'; // Rojo de Bootstrap (danger)
        case 'Alta': return '#ffc107'; // Amarillo de Bootstrap (warning)
        case 'Media': return '#0dcaf0'; // Azul de Bootstrap (info)
        case 'Baja': return '#198754'; // Verde de Bootstrap (success)
        default: return '#6c757d'; // Gris de Bootstrap (secondary)
    }
}

export default CalendarView;
