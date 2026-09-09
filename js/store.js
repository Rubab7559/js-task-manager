const STORAGE_KEY = 'js_task_manager_data_v1';
const CURRENT_SCHEMA_VERSION = 1;

export class TaskStore {
  constructor() {
    this.tasks = [];
    this.loadFromStorage();
  }

  loadFromStorage() {
    const dataRaw = localStorage.getItem(STORAGE_KEY);
    if (!dataRaw) {
      this.tasks = [];
      this.saveToStorage();
      return;
    }

    try {
      const parsedData = JSON.parse(dataRaw);
      // Schema Migration Logic
      if (!parsedData.version || parsedData.version < CURRENT_SCHEMA_VERSION) {
        this.tasks = this.migrateSchema(parsedData);
      } else {
        this.tasks = parsedData.tasks || [];
      }
    } catch (e) {
      console.error("Error loading tasks from localStorage:", e);
      this.tasks = [];
    }
  }

  migrateSchema(oldData) {
    // Migration logic for future schema upgrades
    const oldTasks = Array.isArray(oldData) ? oldData : (oldData.tasks || []);
    return oldTasks.map(task => ({
      id: task.id || Date.now().toString(),
      title: task.title || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      dueDate: task.dueDate || '',
      createdAt: task.createdAt || new Date().toISOString()
    }));
  }

  saveToStorage() {
    const payload = {
      version: CURRENT_SCHEMA_VERSION,
      tasks: this.tasks
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  getTasks() {
    return [...this.tasks];
  }

  setTasks(newTasks) {
    this.tasks = [...newTasks];
    this.saveToStorage();
  }
}
