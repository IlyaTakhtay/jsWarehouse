import Cargo from './Cargo';

export default class Tasklist {
  static counter = 1;
  #tasks = [];
  #tasklistName = '';
  #tasklistID = '';
  #tasklistPosition = -1;

  constructor({
    name,
    position,
    onDropTaskInTasklist,
    onDeleteCargo,
  }) {
    this.#tasklistName = name;
    this.#tasklistID = crypto.randomUUID();
    this.#tasklistPosition = position;
    this.onDropTaskInTasklist = onDropTaskInTasklist;
    this.onDeleteCargo = onDeleteCargo;
    this.order = Tasklist.counter++;
  }

  get tasklistID() { return this.#tasklistID; }

  addTask = ({ cargo }) => this.#tasks.push(cargo);

  getTaskById = ({ cargoID }) => this.#tasks.find(cargo => cargo.cargoID === cargoID);

  findTaskByName = ({ productInCargo }) => this.#tasks.find(cargo => cargo.productInCargo === productInCargo);

  deleteTask = ({ cargoID }) => {
    const deleteTaskIndex = this.#tasks.findIndex(cargo => cargo.cargoID === cargoID);

    if (deleteTaskIndex === -1) return;

    const [deletedTask] = this.#tasks.splice(deleteTaskIndex, 1);

    return deletedTask;
  };
  deleteTasklist = () => {
    const tasklistElement = document.getElementById(this.#tasklistID);
    tasklistElement.remove();
    this.decrementCounter();
    console.log("del")//
  };

  reorderTasks = () => {
    console.log(document.querySelector(`[id="${this.#tasklistID}"] .orderlist__cargo-list`));
    const orderedTasksIDs = Array.from(
      document.querySelector(`[id="${this.#tasklistID}"] .orderlist__cargo-list`).children,
      elem => elem.getAttribute('id')
    );

    orderedTasksIDs.forEach((cargoID, position) => {
      this.#tasks.find(cargo => cargo.cargoID === cargoID).cargoPosition = position;
    });

    console.log(this.#tasks);
  };

  decrementCounter() {
    // Проверяем, чтобы счетчик не уходил в отрицательное значение
    Tasklist.counter = Math.max(1, Tasklist.counter - 1);
  }

  onEditTasklist = () => {
    const liElement = document.getElementById(this.#tasklistID);
    var inputElements = Array.from(liElement.querySelectorAll('.orderlist-adder__input'))
    inputElements.forEach((currentInputElement) => {
      if (currentInputElement.hasAttribute('readOnly')){
        currentInputElement.readOnly = false
      } else{
        currentInputElement.readOnly = true
      }
    })
  };

  appendNewTask = ({ productInCargo, amount }) => {
    const finded = this.#tasks.find(cargo => cargo.productInCargo === productInCargo)
    if (finded) {
      finded.cargoAmount = String(Number(finded.cargoAmount) + Number(amount))
      document.querySelector(`[id="${finded.cargoID}"] span.cargo__text`).innerHTML = this.#tasks[finded.cargoPosition].cargoAmount
      console.log(this.#tasks)
    } else {
      const newTask = new Cargo({
        amount,
        productInCargo,
        position: this.#tasks.length,
        selectedOption: this.selectedOption,
        onDeleteCargo: this.onDeleteCargo
      });
      this.#tasks.push(newTask);
          const newTaskElement = newTask.render();
          document.querySelector(`[id="${this.#tasklistID}"] .orderlist__cargo-list`)
          .appendChild(newTaskElement);
    }
  }

  renderDeleteButton = () => {
    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('type', 'button');
    deleteButton.classList.add('cargo__contol-btn', 'delete-icon');
    deleteButton.addEventListener('click', this.deleteTasklist);
    return deleteButton;
  };

  editTasklistName = () => {
    const newName = prompt('Введите новое название списка задач:', this.#tasklistName);
    if (newName !== null) {
      this.#tasklistName = newName;
      document.getElementById(this.#tasklistID).querySelector('.orderlist__name').innerHTML = newName;
    }
  };

  render() {
    console.log("↑")
    const liElement = document.createElement('li');
    liElement.classList.add(
      'order-list__item',
      'orderlist'
    );
    liElement.setAttribute('id', this.#tasklistID);
    liElement.addEventListener(
      'dragstart',
      () => localStorage.setItem('srcTasklistID', this.#tasklistID)
    );
    liElement.addEventListener('drop', this.onDropTaskInTasklist);
    liElement.appendChild(this.renderDeleteButton());

    const ListNum = document.createElement('h1');
    ListNum.classList.add('xuh');
    ListNum.innerHTML = `Заказ ${this.#tasklistID}`;
    liElement.appendChild(ListNum);

    // приколы с датой в жабаскрипте
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // +1, так как месяцы начинаются с 0
    const day = currentDate.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    // приколы с датой в жабаскрипте

    //тут струячим плейсхолдеры для даты и времени на каждый элемент
    const inputNameTag = document.createElement('input');
    inputNameTag.type = "text"
    inputNameTag.classList.add("orderlist-adder__input")
    inputNameTag.placeholder = "Имя заказчика" 
    liElement.appendChild(inputNameTag);


    const inputDataTag = document.createElement('input');
    inputDataTag.type = "date"
    inputDataTag.classList.add("orderlist-adder__input")
    inputDataTag.style = "margin-bottom: 20px"
    inputDataTag.min = formattedDate
    liElement.appendChild(inputDataTag);
    
    //тут струячим плейсхолдеры для даты и времени на каждый элемент
    const saveButton = document.createElement('button');
    saveButton.setAttribute('type', 'button');
    saveButton.classList.add('orderlist__edit-orderlist-btn');
    saveButton.innerHTML = '&#10010; Редактировать поля ввода';
    saveButton.addEventListener('click', this.onEditTasklist);
    liElement.appendChild(saveButton);
    
    // работа с тасками
    const innerUlElement = document.createElement('ul');
    innerUlElement.classList.add('orderlist__cargo-list');
    liElement.appendChild(innerUlElement);

    // добавление тасков
    const addButton = document.createElement('button');
    addButton.setAttribute('type', 'button');
    addButton.classList.add('orderlist__add-cargo-btn');
    addButton.innerHTML = '&#10010; Добавить карточку';
    addButton.addEventListener('click', () => {
      document.getElementById('app-add-modal').showModal();
      localStorage.setItem('addTasklistID', this.#tasklistID)
    } );
    liElement.appendChild(addButton);
    
    const adderElement = document.querySelector('.orderlist-adder');
    adderElement.parentElement.insertBefore(liElement, adderElement);


  }
};
