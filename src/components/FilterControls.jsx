function FilterControls({ filters, setFilters }) {
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    };

    return (
        <div className="filters d-flex gap-2">
            <input
                type="text"
                name="cliente"
                value={filters.cliente}
                onChange={handleFilterChange}
                className="form-control form-control-sm"
                placeholder="Filtrar por cliente..."
            />
            <select
                name="prioridad"
                value={filters.prioridad}
                onChange={handleFilterChange}
                className="form-select form-select-sm"
            >
                <option value="all">Toda Prioridad</option>
                <option value="Muy alta">Muy alta</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
            </select>
        </div>
    );
}

export default FilterControls;
