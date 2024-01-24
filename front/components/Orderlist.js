import AppModel from '../model/AppModel';
import Cargo from './Cargo';

export default class Orderlist {
  #cargos = [];
  #orderlistName = '';
  #orderlistID = null;
  #orderlistDate = '';
  #orderlistPosition = -1;

  constructor({
    orderlistID = null,
    name,
    date,
    position,
    onDropCargoInOrderlist,
    onDeleteCargo,
  }) {
    this.#orderlistName = name;
    this.#orderlistDate = date;
    this.#orderlistID = orderlistID || crypto.randomUUID();
    this.#orderlistPosition = position;
    this.onDropCargoInOrderlist = onDropCargoInOrderlist;
    this.onDeleteCargo = onDeleteCargo;
  }

  get orderlistID() { return this.#orderlistID; }
  get orderlistName() { return this.#orderlistName; }
  get orderlistDate() { return this.#orderlistDate; }

  get orderlistPosition() { return this.#orderlistPosition; }

  pushCargo = ({ cargo }) => this.#cargos.push(cargo);

  getCargoByID = ({ cargoID }) => this.#cargos.find(cargo => cargo.cargoID === cargoID);

  findCargoByName = ({ productInCargo }) => this.#cargos.find(cargo => cargo.productInCargo === productInCargo);

  deleteCargo = ({ cargoID }) => {
    const deleteCargoIndex = this.#cargos.findIndex(cargo => cargo.cargoID === cargoID);

    if (deleteCargoIndex === -1) return;

    const [deletedCargo] = this.#cargos.splice(deleteCargoIndex, 1);

    return deletedCargo;
  };
  deleteOrderlist = async ( ) => {
    try {
      const deleteOrderlsitResult = await AppModel.deleteOrderlist( {orderID: this.#orderlistID} );
      console.log(deleteOrderlsitResult)
    } catch (err) {
      console.error(err)
    }
    const orderlistElement = document.getElementById(this.#orderlistID);
    orderlistElement.remove();
  };

  reorderCargos = () => {
    const orderedCargosIDs = Array.from(
      document.querySelector(`[id="${this.#orderlistID}"] .orderlist__cargo-list`).children,
      elem => elem.getAttribute('id')
    );
    orderedCargosIDs.forEach((cargoID, position) => {
      this.#cargos.find(cargo => cargo.cargoID === cargoID).cargoPosition = position;
    });
  };

  onEditOrderlist = async () => {
    const liElement = document.getElementById(this.#orderlistID);
    var inputElements = Array.from(liElement.querySelectorAll('.orderlist-adder__input'))
    var Changed = false
    inputElements.forEach((currentInputElement) => {
      if (currentInputElement.value){
        if ((currentInputElement.type == 'text') && (this.#orderlistName != currentInputElement.value)) {
          this.#orderlistName = currentInputElement.value
          Changed = true
        }
        if ((currentInputElement.type == 'date') && (this.#orderlistDate != currentInputElement.value))  {
          this.#orderlistDate = currentInputElement.value
          Changed = true
        }
        if (currentInputElement.hasAttribute('readOnly')){
          currentInputElement.readOnly = false
        } else{
          currentInputElement.readOnly = true
        }
      }
    })
    if (Changed){
      try {
      const updateOrderlistResult = await AppModel.updateOrderlist( {
        orderID: this.#orderlistID,
        name: this.#orderlistName,
        orderDate: this.#orderlistDate,
        position: this.#orderlistPosition
      } )
      console.log(updateOrderlistResult)
      } catch (err) {
        console.error(err)
      }
    }  
  };

  appendNewCargo = async ({ productInCargo, amount }) => {
    const finded = this.#cargos.find(cargo => cargo.productInCargo === productInCargo)
    
    if (finded) {
      try {
        const currentAvailable = await AppModel.getProductAmount({productName:productInCargo})

        if (currentAvailable[0].warehouse_product_count < Number(finded.cargoAmount) + Number(amount)){
          alert("Недостаточно на складе")
          return;
        }
        finded.cargoAmount = String(Number(finded.cargoAmount) + Number(amount))
        document.querySelector(`[id="${finded.cargoID}"] span.cargo__text`).innerHTML = finded.cargoAmount

        const updateCargoResult = await AppModel.updateCargo({
          cargoID: finded.cargoID, 
          cargoCount : Number(finded.cargoAmount),
        });

        console.log(updateCargoResult)
      } catch (err) {
        console.error(err)
      }
    } else {
      
      try {
        const currentAvailable = await AppModel.getProductAmount({productName:productInCargo})
        if (currentAvailable[0].warehouse_product_count < Number(amount)){
          alert("Недостаточно на складе")
          return;
        }
        const cargoID = crypto.randomUUID();
        const addCargoResult = await AppModel.addCargo({
          cargoID,
          cargoName: productInCargo,
          cargoCount: amount,
          orderID: this.#orderlistID,
          position: this.#cargos.length,
        });

        this.addNewCargoLocal({
          cargoID, 
          amount: amount, 
          productInCargo: productInCargo, 
          position: this.#cargos.length
        });
        
        console.log(addCargoResult);
      } catch (err) {
        console.error(err);
      }

      
    }
  };

  addNewCargoLocal = ( {cargoID = null, amount, productInCargo, position } ) => {
    const newCargo = new Cargo({
      cargoID,
      amount,
      productInCargo,
      position,
      selectedOption: this.selectedOption,
      onDeleteCargo: this.onDeleteCargo
    });
    this.#cargos.push(newCargo);
    const newCargoElement = newCargo.render();
    document.querySelector(`[id="${this.#orderlistID}"] .orderlist__cargo-list`)
    .appendChild(newCargoElement);
  };

  renderDeleteButton = () => {
    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('type', 'button');
    deleteButton.classList.add('cargo__contol-btn', 'delete-icon');
    deleteButton.addEventListener('click', this.deleteOrderlist);
    return deleteButton;
  };

  editOrderlistName = () => {
    const newName = prompt('Введите новое название списка задач:', this.#orderlistName);
    if (newName !== null) {
      this.#orderlistName = newName;
      document.getElementById(this.#orderlistID).querySelector('.orderlist__name').innerHTML = newName;
    }
  };

  render() {
    const liElement = document.createElement('li');
    liElement.classList.add(
      'order-list__item',
      'orderlist'
    );
    liElement.setAttribute('id', this.#orderlistID);
    liElement.addEventListener(
      'dragstart',
      () => localStorage.setItem('srcOrderlistID', this.#orderlistID)
    );
    liElement.addEventListener('drop', this.onDropCargoInOrderlist);
    liElement.appendChild(this.renderDeleteButton());

    const ListNum = document.createElement('h1');
    const headerSpan = document.createElement('span')
    headerSpan.classList.add('orderlist-heading__order');
    const orderIdSpan = document.createElement('span')
    orderIdSpan.classList.add('orderlist-heading__order-id');
    ListNum.appendChild(headerSpan)
    ListNum.appendChild(orderIdSpan)
    ListNum.classList.add('orderlist-heading');
    headerSpan.innerHTML = 'Заказ '
    orderIdSpan.innerHTML = `${this.#orderlistID}`;
    liElement.appendChild(ListNum);

    // Make a today Date
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // +1, так как месяцы начинаются с 0
    const day = currentDate.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
     // Make a today Date

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
    
    const saveButton = document.createElement('button');
    saveButton.setAttribute('type', 'button');
    saveButton.classList.add('orderlist__edit-orderlist-btn');
    saveButton.innerHTML = '&#10010; Редактировать поля ввода';
    saveButton.addEventListener('click', this.onEditOrderlist);
    liElement.appendChild(saveButton);
    
    // working with cargos
    const innerUlElement = document.createElement('ul');
    innerUlElement.classList.add('orderlist__cargo-list');
    liElement.appendChild(innerUlElement);

    // adding cargos
    const addButton = document.createElement('button');
    addButton.setAttribute('type', 'button');
    addButton.classList.add('orderlist__add-cargo-btn');  
    addButton.innerHTML = '&#10010; Добавить карточку';
    addButton.addEventListener('click', () => {
      document.getElementById('app-add-modal').showModal();
      localStorage.setItem('addOrderlistID', this.#orderlistID)
    } );
    liElement.appendChild(addButton);
    
    const adderElement = document.querySelector('.orderlist-adder');
    adderElement.parentElement.insertBefore(liElement, adderElement);


  }
};
