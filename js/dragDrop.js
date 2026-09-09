export function initDragAndDrop(container, onReorder) {
  let draggedItem = null;

  container.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('task-item')) {
      draggedItem = e.target;
      e.target.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    }
  });

  container.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('task-item')) {
      e.target.classList.remove('dragging');
      draggedItem = null;
      
      const newOrderIds = Array.from(container.querySelectorAll('.task-item')).map(item => item.dataset.id);
      onReorder(newOrderIds);
    }
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    if (draggedItem) {
      if (afterElement == null) {
        container.appendChild(draggedItem);
      } else {
        container.insertBefore(draggedItem, afterElement);
      }
    }
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}
