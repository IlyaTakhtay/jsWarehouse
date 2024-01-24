export default class Task {
  #taskID = '';
  #taskAmount = '';
  #productInCargo = '';
  #taskPosition = -1;

  constructor({
    amount,
    position,
    productInCargo,
    onDeleteTask
  }) {
    this.#taskID = crypto.randomUUID();
    this.#taskAmount = amount;
    this.#taskPosition = position;
    this.#productInCargo = productInCargo;
    this.onDeleteTask = onDeleteTask;
  }

  get taskID() { return this.#taskID; }
//??
  get taskAmount() { return this.#taskAmount; }
  set taskAmount(value) {
    if (typeof value === 'string') {
      this.#taskAmount = value;
    }
  }
//??
  get productInCargo() { return this.#productInCargo; }
  set productInCargo(value) {
    if (typeof value === 'string') {
      this.#productInCargo = value;
    }
  }
  task__text
  get taskPosition() { return this.#taskPosition; }
  set taskPosition(value) {
    if (typeof value === 'number' && value >= 0) {
      this.#taskPosition = value;
    }
  }

  render() {
    const liElement = document.createElement('li');
    liElement.classList.add('tasklist__tasks-list-item', 'task');
    liElement.setAttribute('id', this.#taskID);
    liElement.setAttribute('draggable', true);
    liElement.addEventListener('dragstart', (evt) => {
      evt.target.classList.add('task_selected');
      localStorage.setItem('movedTaskID', this.#taskID);
    });
    liElement.addEventListener('dragend', (evt) => evt.target.classList.remove('task_selected'));

    const spanAmount = document.createElement('span');
    spanAmount.classList.add('task__text');
    spanAmount.innerHTML = this.#taskAmount;
    liElement.appendChild(spanAmount);

    const spanProductInCargo = document.createElement('span');
    spanProductInCargo.classList.add('task__number');
    spanProductInCargo.innerHTML = this.#productInCargo;
    liElement.appendChild(spanProductInCargo);

    const controlsDiv = document.createElement('div');
    controlsDiv.classList.add('task__controls');

    const selectElement = document.createElement('select');
    selectElement.classList.add('task__select');
    selectElement.addEventListener('change', (evt) => {
    this.selectedOption = evt.target.value;
    });

    const lowerRowDiv = document.createElement('div');
    lowerRowDiv.classList.add('task__controls-row');

    const editBtn = document.createElement('button');
    editBtn.setAttribute('type', 'button');
    editBtn.classList.add('task__contol-btn', 'edit-icon');
    editBtn.addEventListener('click', () => {
      document.getElementById('app-edit-modal').showModal();
      localStorage.setItem('editTaskID', this.#taskID)
    });
    lowerRowDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.classList.add('task__contol-btn', 'delete-icon');
    deleteBtn.addEventListener('click', () => this.onDeleteTask({ taskID: this.#taskID }));
    lowerRowDiv.appendChild(deleteBtn);

    controlsDiv.appendChild(lowerRowDiv);

    liElement.appendChild(controlsDiv);

    return liElement;
  }
};
