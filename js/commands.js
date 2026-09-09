export class CommandManager {
  constructor(limit = 20) {
    this.undoStack = [];
    this.redoStack = [];
    this.limit = limit;
  }

  execute(command) {
    command.execute();
    this.undoStack.push(command);
    if (this.undoStack.length > this.limit) {
      this.undoStack.shift(); // 20-action history limit
    }
    this.redoStack = []; // Clear redo stack on new action
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const command = this.undoStack.pop();
    command.undo();
    this.redoStack.push(command);
    return true;
  }

  redo() {
    if (this.redoStack.length === 0) return false;
    const command = this.redoStack.pop();
    command.execute();
    this.undoStack.push(command);
    return true;
  }
}

// Command Objects
export class AddTaskCommand {
  constructor(store, task) {
    this.store = store;
    this.task = task;
  }
  execute() {
    const tasks = this.store.getTasks();
    this.store.setTasks([this.task, ...tasks]);
  }
  undo() {
    const tasks = this.store.getTasks().filter(t => t.id !== this.task.id);
    this.store.setTasks(tasks);
  }
}

export class DeleteTaskCommand {
  constructor(store, taskId) {
    this.store = store;
    this.taskId = taskId;
    this.deletedTask = null;
  }
  execute() {
    const tasks = this.store.getTasks();
    this.deletedTask = tasks.find(t => t.id === this.taskId);
    this.store.setTasks(tasks.filter(t => t.id !== this.taskId));
  }
  undo() {
    if (this.deletedTask) {
      const tasks = this.store.getTasks();
      this.store.setTasks([...tasks, this.deletedTask]);
    }
  }
}

export class ToggleTaskCommand {
  constructor(store, taskId) {
    this.store = store;
    this.taskId = taskId;
  }
  execute() {
    this.toggle();
  }
  undo() {
    this.toggle();
  }
  toggle() {
    const tasks = this.store.getTasks().map(task => {
      if (task.id === this.taskId) {
        return { ...task, status: task.status === 'completed' ? 'pending' : 'completed' };
      }
      return task;
    });
    this.store.setTasks(tasks);
  }
}
