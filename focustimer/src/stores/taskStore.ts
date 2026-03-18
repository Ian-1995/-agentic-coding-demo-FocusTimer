import { create } from 'zustand';
import api from '../services/api';

export interface Task {
  id: string;
  name: string;
  is_archived: boolean;
  created_at: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;

  fetchTasks: (archived?: boolean) => Promise<void>;
  createTask: (name: string) => Promise<Task>;
  updateTask: (id: string, data: { name?: string; is_archived?: boolean }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async (archived = false) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/tasks', { params: { archived: String(archived) } });
      set({ tasks: data.data.tasks });
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (name) => {
    const { data } = await api.post('/tasks', { name });
    const task = data.data.task;
    set({ tasks: [task, ...get().tasks] });
    return task;
  },

  updateTask: async (id, updates) => {
    const { data } = await api.patch(`/tasks/${id}`, updates);
    set({
      tasks: get().tasks.map((t) => (t.id === id ? data.data.task : t)),
    });
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },
}));
