import { TaskStore } from './store.js';
import { CommandManager, AddTaskCommand, DeleteTaskCommand, ToggleTaskCommand } from './commands.js';
import { Router } from './router.js';
import { UI } from './ui.js';
import { initDragAndDrop } from './dragDrop.js';

const store = new TaskStore();
const commandManager = new CommandManager(20);

// Elements
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskPriority = document.getElementById('taskPriority');
const taskDueDate = document.getElementById('taskDueDate');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const sortBy = document.getElementById('sortBy');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

let currentSearch = '';

function init() {
  // Sync URL Params
  const params = Router.getParams();
  filterStatus.value = params.status;
  filterPriority.value = params.priority;
  sortBy.value = params.sort;

  render();
  setupEventListeners();
  initDragAndDrop(taskList, handleReorder);
}

function getFilteredAndSortedTasks() {
  let tasks = store.getTasks();

  // Search
  if (currentSearch) {
    tasks = tasks.filter(t => t.title.toLowerCase().includes(currentSearch.toLowerCase()));
  }

  // Filter Status
  if (filterStatus.value !== 'all') {
    tasks = tasks.filter(t => t.status === filterStatus.value);
  }

  // Filter Priority
  if (filterPriority.value !== 'all') {
    tasks = tasks.filter(t => t.priority === filterPriority.value);
  }

  // Sort
  tasks.sort((a, b) => {
    if (sortBy.value === 'dueDate') {
      return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
    }
    if (sortBy.value === 'priority') {
      const pOrder = { high: 1, medium: 2, low: 3 };
      return pOrder[a.priority] - pOrder[b.priority];
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return tasks;
}

function render() {
  Router.updateParams({
    status: filterStatus.value,
    priority: filterPriority.value,
    sort: sortBy.value
  });

  const filteredTasks = getFilteredAndSortedTasks();
  UI.renderTasks(filteredTasks, currentSearch);
}

function setupEventListeners() {
  // Add Task Form
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTask = {
      id: Date.now().toString(),
      title: taskTitle.value.trim(),
      priority: taskPriority.value,
      dueDate: taskDueDate.value,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    if (!newTask.title) return;

    commandManager.execute(new AddTaskCommand(store, newTask));
    taskTitle.value = '';
    taskDueDate.value = '';
    render();
  });

  // Task List Delegation (Delete & Toggle)
  taskList.addEventListener('click', (e) => {
    const li = e.target.closest('.task-item');
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.classList.contains('delete-btn')) {
      commandManager.execute(new DeleteTaskCommand(store, id));
      render();
    } else if (e.target.classList.contains('toggle-btn')) {
      commandManager.execute(new ToggleTaskCommand(store, id));
      render();
    }
  });

  // Filters & Sorting
  filterStatus.addEventListener('change', render);
  filterPriority.addEventListener('change', render);
  sortBy.addEventListener('change', render);

  // Debounced Search
  searchInput.addEventListener('input', UI.debounce((e) => {
    currentSearch = e.target.value.trim();
    render();
  }, 300));

  // History Controls
  undoBtn.addEventListener('click', () => { commandManager.undo(); render(); });
  redoBtn.addEventListener('click', () => { commandManager.redo(); render(); });

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      taskTitle.focus();
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      commandManager.undo();
      render();
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      commandManager.redo();
      render();
    }
  });
}

function handleReorder(newOrderIds) {
  const currentTasks = store.getTasks();
  const taskMap = new Map(currentTasks.map(t => [t.id, t]));
  const reordered = newOrderIds.map(id => taskMap.get(id)).filter(Boolean);
  
  // Append remaining tasks not visible in filtered view
  currentTasks.forEach(t => {
    if (!newOrderIds.includes(t.id)) reordered.push(t);
  });

  store.setTasks(reordered);
}

init();
