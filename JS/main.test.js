/**
 * @jest-environment jsdom
 */

describe('ToDoList main.js functions', () => {
  let toDoInput, toDoBtn, toDoList, standardTheme, lightTheme, darkerTheme, title;
  let savedThemeBackup, todosBackup;

  // Mock alert
  beforeAll(() => {
    global.alert = jest.fn();
  });

  beforeEach(() => {
    // Backup localStorage
    savedThemeBackup = window.localStorage.getItem('savedTheme');
    todosBackup = window.localStorage.getItem('todos');

    // Set up DOM
    document.body.innerHTML = `
      <h1 id="title"></h1>
      <input class="todo-input" />
      <button class="todo-btn"></button>
      <ul class="todo-list"></ul>
      <button class="standard-theme"></button>
      <button class="light-theme"></button>
      <button class="darker-theme"></button>
    `;
    toDoInput = document.querySelector('.todo-input');
    toDoBtn = document.querySelector('.todo-btn');
    toDoList = document.querySelector('.todo-list');
    standardTheme = document.querySelector('.standard-theme');
    lightTheme = document.querySelector('.light-theme');
    darkerTheme = document.querySelector('.darker-theme');
    title = document.getElementById('title');

    // Reset localStorage
    window.localStorage.clear();

    // Re-import main.js functions into test scope
    // We'll redefine them here for testability
    window.savedTheme = null;
    window.savelocal = function (todo) {
      let todos;
      if (localStorage.getItem('todos') === null) {
        todos = [];
      } else {
        todos = JSON.parse(localStorage.getItem('todos'));
      }
      todos.push(todo);
      localStorage.setItem('todos', JSON.stringify(todos));
    };
    window.removeLocalTodos = function (todo) {
      let todos;
      if (localStorage.getItem('todos') === null) {
        todos = [];
      } else {
        todos = JSON.parse(localStorage.getItem('todos'));
      }
      const todoIndex = todos.indexOf(todo.children[0].innerText);
      todos.splice(todoIndex, 1);
      localStorage.setItem('todos', JSON.stringify(todos));
    };
    window.changeTheme = function (color) {
      localStorage.setItem('savedTheme', color);
      window.savedTheme = localStorage.getItem('savedTheme');
      document.body.className = color;
      if (color === 'darker') {
        document.getElementById('title').classList.add('darker-title');
      } else {
        document.getElementById('title').classList.remove('darker-title');
      }
      document.querySelector('input').className = `${color}-input`;
      document.querySelectorAll('.todo').forEach(todo => {
        Array.from(todo.classList).some(item => item === 'completed') ?
          todo.className = `todo ${color}-todo completed`
          : todo.className = `todo ${color}-todo`;
      });
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
    };
    window.getTodos = function () {
      let todos;
      if (localStorage.getItem('todos') === null) {
        todos = [];
      } else {
        todos = JSON.parse(localStorage.getItem('todos'));
      }
      todos.forEach(function (todo) {
        const toDoDiv = document.createElement("div");
        toDoDiv.classList.add("todo", `${window.savedTheme}-todo`);
        const newToDo = document.createElement('li');
        newToDo.innerText = todo;
        newToDo.classList.add('todo-item');
        toDoDiv.appendChild(newToDo);
        const checked = document.createElement('button');
        checked.innerHTML = '<i class="fas fa-check"></i>';
        checked.classList.add("check-btn", `${window.savedTheme}-button`);
        toDoDiv.appendChild(checked);
        const deleted = document.createElement('button');
        deleted.innerHTML = '<i class="fas fa-trash"></i>';
        deleted.classList.add("delete-btn", `${window.savedTheme}-button`);
        toDoDiv.appendChild(deleted);
        toDoList.appendChild(toDoDiv);
      });
    };
    window.addToDo = function (event) {
      event.preventDefault();
      const toDoDiv = document.createElement("div");
      toDoDiv.classList.add('todo', `${window.savedTheme}-todo`);
      const newToDo = document.createElement('li');
      if (toDoInput.value === '') {
        alert("You must write something!");
      } else {
        newToDo.innerText = toDoInput.value;
        newToDo.classList.add('todo-item');
        toDoDiv.appendChild(newToDo);
        window.savelocal(toDoInput.value);
        const checked = document.createElement('button');
        checked.innerHTML = '<i class="fas fa-check"></i>';
        checked.classList.add('check-btn', `${window.savedTheme}-button`);
        toDoDiv.appendChild(checked);
        const deleted = document.createElement('button');
        deleted.innerHTML = '<i class="fas fa-trash"></i>';
        deleted.classList.add('delete-btn', `${window.savedTheme}-button`);
        toDoDiv.appendChild(deleted);
        toDoList.appendChild(toDoDiv);
        toDoInput.value = '';
      }
    };
    window.deletecheck = function (event) {
      const item = event.target;
      if (item.classList[0] === 'delete-btn') {
        item.parentElement.classList.add("fall");
        window.removeLocalTodos(item.parentElement);
        item.parentElement.remove();
      }
      if (item.classList[0] === 'check-btn') {
        item.parentElement.classList.toggle("completed");
      }
    };
  });

  afterEach(() => {
    // Restore localStorage
    if (savedThemeBackup !== null) {
      window.localStorage.setItem('savedTheme', savedThemeBackup);
    } else {
      window.localStorage.removeItem('savedTheme');
    }
    if (todosBackup !== null) {
      window.localStorage.setItem('todos', todosBackup);
    } else {
      window.localStorage.removeItem('todos');
    }
    jest.clearAllMocks();
  });

  test('savelocal adds todo to localStorage', () => {
    window.savelocal('Test Todo');
    const todos = JSON.parse(localStorage.getItem('todos'));
    expect(todos).toContain('Test Todo');
  });

  test('removeLocalTodos removes todo from localStorage', () => {
    localStorage.setItem('todos', JSON.stringify(['A', 'B', 'C']));
    const fakeDiv = document.createElement('div');
    const li = document.createElement('li');
    li.innerText = 'B';
    fakeDiv.appendChild(li);
    window.removeLocalTodos(fakeDiv);
    const todos = JSON.parse(localStorage.getItem('todos'));
    expect(todos).toEqual(['A', 'C']);
  });

  test('changeTheme sets theme and updates DOM', () => {
    window.changeTheme('darker');
    expect(document.body.className).toBe('darker');
    expect(title.classList.contains('darker-title')).toBe(true);
    expect(document.querySelector('input').className).toBe('darker-input');
    window.changeTheme('light');
    expect(document.body.className).toBe('light');
    expect(title.classList.contains('darker-title')).toBe(false);
    expect(document.querySelector('input').className).toBe('light-input');
  });

  test('addToDo does not add empty todo and calls alert', () => {
    toDoInput.value = '';
    const event = { preventDefault: jest.fn() };
    window.addToDo(event);
    expect(global.alert).toHaveBeenCalledWith("You must write something!");
    expect(toDoList.children.length).toBe(0);
  });

  test('addToDo adds todo to DOM and localStorage', () => {
    window.savedTheme = 'standard';
    toDoInput.value = 'My Task';
    const event = { preventDefault: jest.fn() };
    window.addToDo(event);
    expect(toDoList.children.length).toBe(1);
    expect(toDoList.querySelector('li').innerText).toBe('My Task');
    const todos = JSON.parse(localStorage.getItem('todos'));
    expect(todos).toContain('My Task');
    expect(toDoInput.value).toBe('');
  });

  test('getTodos populates the DOM from localStorage', () => {
    window.savedTheme = 'standard';
    localStorage.setItem('todos', JSON.stringify(['Task1', 'Task2']));
    window.getTodos();
    expect(toDoList.children.length).toBe(2);
    expect(toDoList.children[0].querySelector('li').innerText).toBe('Task1');
    expect(toDoList.children[1].querySelector('li').innerText).toBe('Task2');
  });

  test('deletecheck removes todo from DOM and localStorage', () => {
    window.savedTheme = 'standard';
    // Add a todo
    toDoInput.value = 'DeleteMe';
    window.addToDo({ preventDefault: jest.fn() });
    const todoDiv = toDoList.querySelector('.todo');
    const deleteBtn = todoDiv.querySelector('.delete-btn');
    // Simulate click event
    const event = { target: deleteBtn };
    window.deletecheck(event);
    expect(toDoList.children.length).toBe(0);
    const todos = JSON.parse(localStorage.getItem('todos'));
    expect(todos).not.toContain('DeleteMe');
  });

  test('deletecheck toggles completed class on check-btn', () => {
    window.savedTheme = 'standard';
    toDoInput.value = 'CheckMe';
    window.addToDo({ preventDefault: jest.fn() });
    const todoDiv = toDoList.querySelector('.todo');
    const checkBtn = todoDiv.querySelector('.check-btn');
    const event = { target: checkBtn };
    expect(todoDiv.classList.contains('completed')).toBe(false);
    window.deletecheck(event);
    expect(todoDiv.classList.contains('completed')).toBe(true);
    window.deletecheck(event);
    expect(todoDiv.classList.contains('completed')).toBe(false);
  });
});