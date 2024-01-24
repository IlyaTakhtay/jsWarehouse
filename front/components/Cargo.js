export default class Cargo {
  #cargoID = '';
  #cargoAmount = '';
  #productInCargo = '';
  #cargoPosition = -1;

  constructor({
    cargoID = null,
    amount,
    position,
    productInCargo,
    onDeleteCargo
  }) {
    this.#cargoID = cargoID || crypto.randomUUID();
    this.#cargoAmount = amount;
    this.#cargoPosition = position;
    this.#productInCargo = productInCargo;
    this.onDeleteCargo = onDeleteCargo;
  }

  get cargoID() { return this.#cargoID; }
//??
  get cargoAmount() { return this.#cargoAmount; }
  set cargoAmount(value) {
    if (typeof value === 'string') {
      this.#cargoAmount = value;
    }
  }
//??
  get productInCargo() { return this.#productInCargo; }
  set productInCargo(value) {
    if (typeof value === 'string') {
      this.#productInCargo = value;
    }
  }
  cargo__text
  get cargoPosition() { return this.#cargoPosition; }
  set cargoPosition(value) {
    if (typeof value === 'number' && value >= 0) {
      this.#cargoPosition = value;
    }
  }

  render() {
    const liElement = document.createElement('li');
    liElement.classList.add('orderlist__cargo-list-item', 'cargo');
    liElement.setAttribute('id', this.#cargoID);
    liElement.setAttribute('draggable', true);
    liElement.addEventListener('dragstart', (evt) => {
      evt.target.classList.add('cargo_selected');
      localStorage.setItem('movedCargoID', this.#cargoID);
    });
    liElement.addEventListener('dragend', (evt) => evt.target.classList.remove('cargo_selected'));

    const spanAmount = document.createElement('span');
    spanAmount.classList.add('cargo__text');
    spanAmount.innerHTML = this.#cargoAmount;
    liElement.appendChild(spanAmount);

    const spanProductInCargo = document.createElement('span');
    spanProductInCargo.classList.add('cargo__number');
    spanProductInCargo.innerHTML = this.#productInCargo;
    liElement.appendChild(spanProductInCargo);

    const controlsDiv = document.createElement('div');
    controlsDiv.classList.add('cargo__controls');

    const selectElement = document.createElement('select');
    selectElement.classList.add('cargo__select');
    selectElement.addEventListener('change', (evt) => {
    this.selectedOption = evt.target.value;
    });

    const lowerRowDiv = document.createElement('div');
    lowerRowDiv.classList.add('cargo__controls-row');

    const editBtn = document.createElement('button');
    editBtn.setAttribute('type', 'button');
    editBtn.classList.add('cargo__contol-btn', 'edit-icon');
    editBtn.addEventListener('click', () => {
      document.getElementById('app-edit-modal').showModal();
      localStorage.setItem('editCargoID', this.#cargoID)
    });
    lowerRowDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.classList.add('cargo__contol-btn', 'delete-icon');
    deleteBtn.addEventListener('click', () => this.onDeleteCargo({ cargoID: this.#cargoID }));
    lowerRowDiv.appendChild(deleteBtn);

    controlsDiv.appendChild(lowerRowDiv);

    liElement.appendChild(controlsDiv);

    return liElement;
  }
};
