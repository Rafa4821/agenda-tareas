import { kv } from '@vercel/kv';

// Base de datos en memoria para desarrollo local
let localTasks = [];

const useKV = !!process.env.KV_REST_API_URL;

export default async function handler(request, response) {
    const { method } = request;

    try {
        switch (method) {
            case 'GET': {
                const tasks = useKV ? (await kv.get('tasks') || []) : localTasks;
                return response.status(200).json(tasks);
            }
            case 'POST': {
                const newTask = { ...request.body, id: `task_${Date.now()}` };
                if (useKV) {
                    const tasks = await kv.get('tasks') || [];
                    tasks.push(newTask);
                    await kv.set('tasks', tasks);
                } else {
                    localTasks.push(newTask);
                }
                return response.status(201).json(newTask);
            }
            case 'PUT': {
                const { id } = request.query;
                if (!id) return response.status(400).json({ message: 'Task ID is required' });

                const updatedTaskData = request.body;
                let taskFound = false;
                let updatedTask;

                if (useKV) {
                    let tasks = await kv.get('tasks') || [];
                    tasks = tasks.map(task => {
                        if (task.id === id) {
                            taskFound = true;
                            updatedTask = { ...task, ...updatedTaskData, id };
                            return updatedTask;
                        }
                        return task;
                    });
                    if (taskFound) await kv.set('tasks', tasks);
                } else {
                    localTasks = localTasks.map(task => {
                        if (task.id === id) {
                            taskFound = true;
                            updatedTask = { ...task, ...updatedTaskData, id };
                            return updatedTask;
                        }
                        return task;
                    });
                }

                if (!taskFound) return response.status(404).json({ message: `Task with id ${id} not found` });
                return response.status(200).json(updatedTask);
            }
            case 'DELETE': {
                const { id } = request.query;
                if (!id) return response.status(400).json({ message: 'Task ID is required' });

                let taskFound = false;
                if (useKV) {
                    let tasks = await kv.get('tasks') || [];
                    const initialLength = tasks.length;
                    tasks = tasks.filter(task => task.id !== id);
                    if (tasks.length < initialLength) {
                        taskFound = true;
                        await kv.set('tasks', tasks);
                    }
                } else {
                    const initialLength = localTasks.length;
                    localTasks = localTasks.filter(task => task.id !== id);
                    if (localTasks.length < initialLength) taskFound = true;
                }

                if (!taskFound) return response.status(404).json({ message: `Task with id ${id} not found` });
                return response.status(204).send();
            }
            default: {
                response.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return response.status(405).end(`Method ${method} Not Allowed`);
            }
        }
    } catch (error) {
        console.error('API Error:', error);
        return response.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
