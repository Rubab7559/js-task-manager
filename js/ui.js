export class UI {
  static debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  static renderTasks(tasks, searchTerm = '') {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (tasks.length === 0) {
      taskList.innerHTML = '<li style="text-align:center; padding: 20px; color:#888;">No tasks found.</li>';
      return;
    }

    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.status === 'completed' ? 'completed' : ''}`;
      li.setAttribute('draggable', 'true');
      li.dataset.id = task.id;

      const titleHtml = UI.highlightText(task.title, searchTerm);

      li.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <input type="checkbox" class="toggle-btn" ${task.status === 'completed' ? 'checked' : ''}>
          <div>
            <span class="task-title" style="${task.status === 'completed' ? 'text-decoration: line-through; color: #888;' : ''}">${titleHtml}</span>
            <div style="font-size:12px; color:#666;">
              <span class="badge ${task.priority}">${task.priority.toUpperCase()}</span> | Due: ${task.dueDate || 'No Date'}
            </div>
          </div>
        </div>
        <button class="delete-btn" style="background:#dc3545; padding: 4px 8px; font-size:12px;">Delete</button>
      `;

      taskList.appendChild(li);
    });
  }

  static highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="highlight">$1</mark>');
  }
}
