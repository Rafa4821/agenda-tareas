function ViewToggles({ currentView, setView }) {
    const views = [
        { id: 'list', name: 'Lista' },
        { id: 'kanban', name: 'Kanban' },
        { id: 'calendar', name: 'Calendario' },
    ];

    return (
        <ul className="nav nav-pills">
            {views.map(view => (
                <li className="nav-item" key={view.id}>
                    <a
                        href="#"
                        className={`nav-link ${currentView === view.id ? 'active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            setView(view.id);
                        }}
                    >
                        {view.name}
                    </a>
                </li>
            ))}
        </ul>
    );
}

export default ViewToggles;
