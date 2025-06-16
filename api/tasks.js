// Usaremos una "base de datos" en memoria para simplicidad.
// En una app real, aquí conectarías a MongoDB, PostgreSQL, Firebase, etc.
let tasks = [];

export default function handler(request, response) {
    const { method } = request;

    switch (method) {
        case 'GET':
            response.status(200).json(tasks);
            break;
        case 'POST':
            const newTask = { ...request.body, id: Date.now().toString() };
            tasks.push(newTask);
            response.status(201).json(newTask);
            break;
        case 'PUT':
            const { id } = request.query;
            const updatedTaskData = request.body;
            tasks = tasks.map(task => (task.id === id ? { ...task, ...updatedTaskData } : task));
            const updatedTask = tasks.find(task => task.id === id);
            response.status(200).json(updatedTask);
            break;
        case 'DELETE':
            const { id: deleteId } = request.query;
            tasks = tasks.filter(task => task.id !== deleteId);
            response.status(204).send(); // No content
            break;
        default:
            response.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            response.status(405).end(`Method ${method} Not Allowed`);
    }
}
