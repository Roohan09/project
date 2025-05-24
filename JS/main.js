// Selectors
const toDoInput = document.querySelector('.todo-input');
const prioritySelect = document.querySelector('.priority-select');
const dueDateInput = document.querySelector('.due-date-input');
const categoryInput = document.querySelector('.category-input');
const toDoBtn = document.querySelector('.todo-btn');
const toDoList = document.querySelector('.todo-list');
const standardTheme = document.querySelector('.standard-theme');
const lightTheme = document.querySelector('.light-theme');
const darkerTheme = document.querySelector('.darker-theme');

// Filter elements
const priorityFilter = document.getElementById('priority-filter');
const categoryFilter = document.getElementById('category-filter');
const statusFilter = document.getElementById('status-filter');

// Event Listeners
toDoBtn.addEventListener('click', addToDo);
toDoList.addEventListener('click', deletecheck);
document.addEventListener("DOMContentLoaded", getTodos);
standardTheme.addEventListener('click', () => changeTheme('standard'));
lightTheme.addEventListener('click', () => changeTheme('light'));
darkerTheme.addEventListener('click', () => changeTheme('darker'));

// Filter event listeners
priorityFilter.addEventListener('change', filterTodos);
categoryFilter.addEventListener('change', filterTodos);
statusFilter.addEventListener('change', filterTodos);

// Global variables
let todos = [];
let savedTheme = localStorage.getItem('savedTheme');
savedTheme === null ? changeTheme('standard') : changeTheme(localStorage.getItem('savedTheme'));

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
}

function isOverdue(dueDate) {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date().setHours(0,0,0,0);
}

// Main functions
function addToDo(event) {
    event.preventDefault();

    if (toDoInput.value.trim() === '') {
        alert("You must write something!");
        return;
    }

    const newTodo = {
        id: generateId(),
        text: toDoInput.value.trim(),
        priority: prioritySelect.value,
        dueDate: dueDateInput.value,
        category: categoryInput.value.trim() || 'Uncategorized',
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(newTodo);
    saveToLocal();
    createTodoElement(newTodo);
    updateCategoryFilter();
    
    // Clear inputs
    toDoInput.value = '';
    dueDateInput.value = '';
    categoryInput.value = '';
    prioritySelect.value = 'medium';
}

function createTodoElement(todo) {
    const toDoDiv = document.createElement("div");
    toDoDiv.classList.add('todo', `${savedTheme}-todo`);
    toDoDiv.setAttribute('data-id', todo.id);
    
    if (todo.completed) {
        toDoDiv.classList.add('completed');
    }
    
    if (isOverdue(todo.dueDate) && !todo.completed) {
        toDoDiv.classList.add('overdue');
    }

    // Priority indicator
    const priorityIndicator = document.createElement('span');
    priorityIndicator.classList.add('priority-indicator', `priority-${todo.priority}`);
    const priorityIcons = { high: '🔴', medium: '🟡', low: '🟢' };
    priorityIndicator.innerHTML = priorityIcons[todo.priority];
    
    // Main task text
    const newToDo = document.createElement('li');
    newToDo.innerText = todo.text;
    newToDo.classList.add('todo-item');
    
    // Task metadata
    const metadata = document.createElement('div');
    metadata.classList.add('todo-metadata');
    
    if (todo.category !== 'Uncategorized') {
        const categorySpan = document.createElement('span');
        categorySpan.classList.add('category-tag');
        categorySpan.innerText = todo.category;
        metadata.appendChild(categorySpan);
    }
    
    if (todo.dueDate) {
        const dueDateSpan = document.createElement('span');
        dueDateSpan.classList.add('due-date-tag');
        dueDateSpan.innerHTML = `📅 ${formatDate(todo.dueDate)}`;
        if (isOverdue(todo.dueDate) && !todo.completed) {
            dueDateSpan.classList.add('overdue-tag');
        }
        metadata.appendChild(dueDateSpan);
    }

    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('todo-buttons');
    
    // Check button
    const checked = document.createElement('button');
    checked.innerHTML = '<i class="fas fa-check"></i>';
    checked.classList.add('check-btn', `${savedTheme}-button`);
    checked.setAttribute('data-action', 'check');
    
    // Delete button
    const deleted = document.createElement('button');
    deleted.innerHTML = '<i class="fas fa-trash"></i>';
    deleted.classList.add('delete-btn', `${savedTheme}-button`);
    deleted.setAttribute('data-action', 'delete');
    
    buttonsContainer.appendChild(checked);
    buttonsContainer.appendChild(deleted);

    // Assemble the todo item
    toDoDiv.appendChild(priorityIndicator);
    toDoDiv.appendChild(newToDo);
    toDoDiv.appendChild(metadata);
    toDoDiv.appendChild(buttonsContainer);
    
    toDoList.appendChild(toDoDiv);
}

function deletecheck(event) {
    const item = event.target.closest('button');
    if (!item) return;
    
    const todoDiv = item.closest('.todo');
    const todoId = todoDiv.getAttribute('data-id');
    const action = item.getAttribute('data-action');

    if (action === 'delete') {
        todoDiv.classList.add("fall");
        
        // Remove from todos array
        todos = todos.filter(todo => todo.id !== todoId);
        saveToLocal();
        updateCategoryFilter();
        
        todoDiv.addEventListener('transitionend', function() {
            todoDiv.remove();
        });
    }

    if (action === 'check') {
        const todo = todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = !todo.completed;
            todoDiv.classList.toggle("completed");
            saveToLocal();
        }
    }
}

function getTodos() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
        todos.forEach(todo => createTodoElement(todo));
        updateCategoryFilter();
    }
}

function saveToLocal() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function updateCategoryFilter() {
    const categories = [...new Set(todos.map(todo => todo.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        if (category !== 'Uncategorized') {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    });
}

function filterTodos() {
    const priorityValue = priorityFilter.value;
    const categoryValue = categoryFilter.value;
    const statusValue = statusFilter.value;
    
    const todoElements = document.querySelectorAll('.todo');
    
    todoElements.forEach(todoDiv => {
        const todoId = todoDiv.getAttribute('data-id');
        const todo = todos.find(t => t.id === todoId);
        
        if (!todo) return;
        
        let shouldShow = true;
        
        // Priority filter
        if (priorityValue !== 'all' && todo.priority !== priorityValue) {
            shouldShow = false;
        }
        
        // Category filter
        if (categoryValue !== 'all' && todo.category !== categoryValue) {
            shouldShow = false;
        }
        
        // Status filter
        if (statusValue !== 'all') {
            if (statusValue === 'completed' && !todo.completed) shouldShow = false;
            if (statusValue === 'pending' && todo.completed) shouldShow = false;
            if (statusValue === 'overdue' && (!isOverdue(todo.dueDate) || todo.completed)) shouldShow = false;
        }
        
        todoDiv.style.display = shouldShow ? 'flex' : 'none';
    });
}

// Theme change function (updated to handle new elements)
function changeTheme(color) {
    localStorage.setItem('savedTheme', color);
    savedTheme = localStorage.getItem('savedTheme');

    document.body.className = color;
    
    color === 'darker' ? 
        document.getElementById('title').classList.add('darker-title')
        : document.getElementById('title').classList.remove('darker-title');

    // Update input themes
    document.querySelector('.todo-input').className = `todo-input ${color}-input`;
    document.querySelector('.priority-select').className = `priority-select ${color}-input`;
    document.querySelector('.due-date-input').className = `due-date-input ${color}-input`;
    document.querySelector('.category-input').className = `category-input ${color}-input`;
    
    // Update filter container theme
    document.getElementById('filter-controls').className = color;
    
    // Update all filter selects
    document.getElementById('priority-filter').className = `${color}-input`;
    document.getElementById('category-filter').className = `${color}-input`;
    document.getElementById('status-filter').className = `${color}-input`;
    
    // Update existing todos
    document.querySelectorAll('.todo').forEach(todo => {
        Array.from(todo.classList).some(item => item === 'completed') ? 
            todo.className = `todo ${color}-todo completed`
            : todo.className = `todo ${color}-todo`;
    });
    
    // Update buttons
    document.querySelectorAll('button').forEach(button => {
        Array.from(button.classList).some(item => {
            if (item === 'check-btn') {
              button.className = `check-btn ${color}-button`;  
            } else if (item === 'delete-btn') {
                button.className = `delete-btn ${color}-button`; 
            } else if (item === 'todo-btn') {
                button.className = `todo-btn ${color}-button`;
            }
        });
    });
}
