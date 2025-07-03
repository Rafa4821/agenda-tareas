function FilterControls({ filters, setFilters, allTags, sortOptions, setSortOptions }) {
        const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    };

    const handleSortChange = (e) => {
        const { name, value } = e.target;
        setSortOptions(prev => ({ ...prev, [name]: value }));
    };

        return (
                <div className="filters-container mb-3">
            <div className="row g-3">
                <div className="col-12 col-lg-3">
                    <input
                        type="text"
                        name="cliente"
                        value={filters.cliente}
                        onChange={handleFilterChange}
                        className="form-control form-control-sm"
                        placeholder="Filtrar por cliente..."
                    />
                </div>
                <div className="col-12 col-sm-6 col-lg-2">
                    <select name="prioridad" value={filters.prioridad} onChange={handleFilterChange} className="form-select form-select-sm">
                        <option value="all">Toda Prioridad</option>
                        <option value="Muy alta">Muy alta</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                    </select>
                </div>
                <div className="col-12 col-sm-6 col-lg-2">
                    <select name="tag" value={filters.tag} onChange={handleFilterChange} className="form-select form-select-sm">
                        <option value="all">Todas las etiquetas</option>
                        {allTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                </div>
                <div className="col-12 col-sm-6 col-lg-2">
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="form-select form-select-sm">
                        <option value="all">Todos los estados</option>
                        <option value="Por hacer">Por hacer</option>
                        <option value="En curso">En curso</option>
                        <option value="Completada">Completada</option>
                    </select>
                </div>
                 <div className="col-12 col-sm-6 col-lg-3">
                    <select name="dateRange" value={filters.dateRange} onChange={handleFilterChange} className="form-select form-select-sm">
                        <option value="all">Cualquier fecha</option>
                        <option value="overdue">Vencidas</option>
                        <option value="today">Para hoy</option>
                        <option value="week">Esta semana</option>
                    </select>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="input-group input-group-sm">
                        <span className="input-group-text">Ordenar por</span>
                        <select name="sortBy" value={sortOptions.sortBy} onChange={handleSortChange} className="form-select form-select-sm">
                            <option value="fechaLimite">Fecha Límite</option>
                            <option value="prioridad">Prioridad</option>
                            <option value="createdAt">Fecha Creación</option>
                        </select>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                     <div className="input-group input-group-sm">
                        <span className="input-group-text">Dirección</span>
                        <select name="direction" value={sortOptions.direction} onChange={handleSortChange} className="form-select form-select-sm">
                            <option value="asc">Ascendente</option>
                            <option value="desc">Descendente</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FilterControls;
