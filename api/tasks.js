import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    const { method } = request;

    try {
        switch (method) {
            case 'GET': {
                const tasks = await kv.get('tasks') || [];
                return response.status(200).json(tasks);
            }
            case 'POST': {
                const newTask = { ...request.body, id: `task_${Date.now()}` };
                const tasks = await kv.get('tasks') || [];
                tasks.push(newTask);
                await kv.set('tasks', tasks);
                return response.status(201).json(newTask);
            }
            case 'PUT': {
                const { id } = request.query;
                if (!id) {
                    return response.status(400).json({ message: 'Task ID is required' });
                }
                const updatedTaskData = request.body;
                let tasks = await kv.get('tasks') || [];
                let taskFound = false;
                tasks = tasks.map(task => {
                    if (task.id === id) {
                        taskFound = true;
                        return { ...task, ...updatedTaskData, id }; // Ensure id is not overwritten
                    }
                    return task;
                });

                if (!taskFound) {
                    return response.status(404).json({ message: `Task with id ${id} not found` });
                }

                await kv.set('tasks', tasks);
                const updatedTask = tasks.find(task => task.id === id);
                return response.status(200).json(updatedTask);
            }
            case 'DELETE': {
                 const { id } = request.query;
                 if (!id) {
                    return response.status(400).json({ message: 'Task ID is required' });
                 }
                let tasks = await kv.get('tasks') || [];
                const initialLength = tasks.length;
                tasks = tasks.filter(task => task.id !== id);

                if (tasks.length === initialLength) {
                     return response.status(404).json({ message: `Task with id ${id} not found` });
                }

                await kv.set('tasks', tasks);
                return response.status(204).send();
            }
            default:
                response.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return response.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('API Error:', error);
        return response.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
