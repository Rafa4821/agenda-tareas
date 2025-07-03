import { db } from '../firebase-config';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

const tasksCollectionRef = collection(db, 'tasks');

// API pública del servicio
export function streamTasks(uid, callback) {
    if (!uid) return () => {}; // Devuelve una función de desuscripción vacía si no hay usuario
    const q = query(tasksCollectionRef, where("uid", "==", uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasks = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));
        callback(tasks);
    });

    return unsubscribe; // Devuelve la función para dejar de escuchar los cambios
}

export async function saveTask(taskData, uid) {
    const dataWithUser = { ...taskData, uid };

    if (taskData.id) {
        // Actualizar tarea existente
        const taskDoc = doc(db, 'tasks', taskData.id);
        const { id, ...dataToUpdate } = dataWithUser;
        await updateDoc(taskDoc, dataToUpdate);
        return dataWithUser; // Devuelve el objeto completo con el id
    } else {
        // Crear nueva tarea
        const docRef = await addDoc(tasksCollectionRef, dataWithUser);
        return { ...dataWithUser, id: docRef.id };
    }
}

export async function updateTask(taskId, dataToUpdate) {
    const taskDoc = doc(db, 'tasks', taskId);
    await updateDoc(taskDoc, dataToUpdate);
}

export async function deleteTask(taskId) {
    const taskDoc = doc(db, 'tasks', taskId);
    await deleteDoc(taskDoc);
}

export async function bulkDeleteTasks(taskIds) {
    const batch = writeBatch(db);
    taskIds.forEach(id => {
        const taskDoc = doc(db, 'tasks', id);
        batch.delete(taskDoc);
    });
    await batch.commit();
}
