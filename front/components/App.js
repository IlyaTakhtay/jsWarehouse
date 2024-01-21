import Orderlist from './Orderlist';

export default class {
  #orderlists = [];

  onDropCargoInOrderlist = (evt) => {
    evt.stopPropagation();

    const destOrderlistElement = evt.currentTarget;
    destOrderlistElement.classList.remove('orderlist_droppable');

    const movedCargoID = localStorage.getItem('movedCargoID');
    const srcOrderlistID = localStorage.getItem('srcOrderlistID');
    const destOrderlistID = destOrderlistElement.getAttribute('id');

    localStorage.setItem('movedCargoID', '');
    localStorage.setItem('srcOrderlistID', '');

    if (!destOrderlistElement.querySelector(`[id="${movedCargoID}"]`)) return;

    const srcOrderlist = this.#orderlists.find(orderlist => orderlist.orderlistID === srcOrderlistID);
    const destOrderlist = this.#orderlists.find(orderlist => orderlist.orderlistID === destOrderlistID);

    if (srcOrderlistID !== destOrderlistID) {
      const movedCargo = srcOrderlist.deleteCargo({ cargoID: movedCargoID });
      destOrderlist.addCargo({ cargo: movedCargo });

      srcOrderlist.reorderCargos();
    }

    const destCargosIDs = Array.from(
      destOrderlistElement.querySelector('.orderlist__cargo-list').children,
      elem => elem.getAttribute('id')
    );

    destCargosIDs.forEach((cargoID, position) => {
      destOrderlist.getCargoByID({ cargoID }).cargoPosition = position;
    });

  };

  EditCargo = ({ cargoID, newProductInCargo, newCargoAmount }) => {
    let findedCargo = null;
    let findedOrderlist = null;
    for (let orderlist of this.#orderlists) {
      findedOrderlist = orderlist;
      findedCargo = orderlist.getCargoByID({ cargoID });
      if (findedCargo) break;
    }

    const findedSameCargo = findedOrderlist.findCargoByName({productInCargo: newProductInCargo})

    if ((findedSameCargo) && (findedSameCargo.cargoID != cargoID)) {
      alert("Такой товар уже есть");
      console.log("YEST PROBITIE", findedSameCargo.cargoID)
      return;
    }

    const currentCargoAmount = findedCargo.cargoAmount;
    const currentProductInCargo = findedCargo.productInCargo;

    if ((!newCargoAmount || newCargoAmount === currentCargoAmount) && 
    (!newProductInCargo || newProductInCargo === currentProductInCargo)) return;  
    
    findedCargo.cargoAmount = newCargoAmount;
    findedCargo.productInCargo = newProductInCargo;

    document.querySelector(`[id="${cargoID}"] span.cargo__text`).innerHTML = newCargoAmount;
    document.querySelector(`[id="${cargoID}"] span.cargo__number`).innerHTML = newProductInCargo;
  };

  onDeleteCargo = ({ cargoID }) => {
    let findedCargo = null;
    let findedOrderlist = null;
    for (let orderlist of this.#orderlists) {
      findedOrderlist = orderlist;
      findedCargo = orderlist.getCargoByID({ cargoID });
      if (findedCargo) break;
    }
    
    //окно подтверждения
    // const cargoShouldBeDeleted = confirm(`Задача '${findedCargo.cargoAmount}' будет удалена. Прододлжить?`);

    // if (!cargoShouldBeDeleted) return;

    findedOrderlist.deleteCargo({ cargoID });

    document.getElementById(cargoID).remove();
  };

  //струячим обновление селектора с данными заказа
  cargoNameAddSelectorAppend = () => {
    const selector = document.getElementById("cargoName-Add")
    const optionElement = document.createElement('option')
    optionElement.text = "HrenSgory"
    selector.add(optionElement)
   }
  //струячим обновление селектора с данными заказа
  //струячим обновление селектора с данными заказа
  cargoNameEditSelectorAppend = () => {
    const selector = document.getElementById("cargoName-Edit")
    const optionElement = document.createElement('option')
    optionElement.text = "HrenSgory"
    selector.add(optionElement)
    }
  //струячим обновление селектора с данными заказа

  initAddModal = () => {
    const cagroAddDialog = document.getElementById("app-add-modal");
    console.log(cagroAddDialog)
    this.cargoNameAddSelectorAppend();
    const cargoCloseHandler = () => {
      cagroAddDialog.close()
      localStorage.setItem("addOrderlistID", '');
      // cagroDialog.querySelector(".cargo-name").value() = ''
    }

    const cargoOkHandler = () => {
      const orderlistID = localStorage.getItem("addOrderlistID");
      const cargoInputName = document.getElementById("cargoName-Add").value
      const cargoInputCount = document.getElementById("cargoCount-Add").value
      console.log("crgID",orderlistID)
      console.log("crgName",cargoInputName)
      console.log("crgCount",cargoInputCount)
      if (orderlistID && cargoInputCount && cargoInputCount){
        console.log(cargoInputName)
        this.#orderlists.find(orderlist => orderlist.orderlistID === orderlistID)
        .appendNewCargo({productInCargo: cargoInputName, amount: cargoInputCount})
        cargoCloseHandler()
      }
    }
    cagroAddDialog.querySelector(".dialog-ok__btn").addEventListener("click", cargoOkHandler)
    cagroAddDialog.querySelector(".dialog-close__btn").addEventListener("click", cargoCloseHandler)
  };

  initEditModal = () => {
    const cagroEditDialog = document.getElementById("app-edit-modal");
    console.log("no",cagroEditDialog)
    this.cargoNameEditSelectorAppend();
    const cargoCloseHandler = () => {
      cagroEditDialog.close()
      localStorage.setItem("editCargoID", '');
      // cagroDialog.querySelector(".cargo-name").value() = ''
    }

    const cargoOkHandler = () => {
      const cargoID = localStorage.getItem("editCargoID");
      const cargoInputName = document.getElementById("cargoName-Edit").value
      const cargoInputCount = document.getElementById("cargoCount-Edit").value
      console.log("1",cargoID)
      console.log("2",cargoInputName)
      console.log("3",cargoInputCount)
      if (cargoID && cargoInputCount && cargoInputCount){
        console.log("Nezshel")
        this.EditCargo({cargoID, newCargoAmount : cargoInputCount, newProductInCargo : cargoInputName})
        cargoCloseHandler()
      }
    }
    cagroEditDialog.querySelector(".dialog-ok__btn").addEventListener("click", cargoOkHandler)
    cagroEditDialog.querySelector(".dialog-close__btn").addEventListener("click", cargoCloseHandler)
  };

  init() {
    document.querySelector('.orderlist-adder__btn')
      .addEventListener(
        'click',
        (event) => {
            const newOrderlist = new Orderlist({
              name: event.target.value,
              onDropCargoInOrderlist: this.onDropCargoInOrderlist,
              onDeleteCargo: this.onDeleteCargo
            });
            
            this.#orderlists.push(newOrderlist);
            newOrderlist.render();
          
          document.querySelectorAll('.orderlist-adder__input').forEach((currentInputElement) => {
            currentInputElement.style.display = 'inherit'
          });
        }
      )

    this.initAddModal();
    this.initEditModal();

    //dark theme
    document.getElementById('theme-switch')
    .addEventListener('change', (evt) => {
      (evt.target.checked
        ? document.body.classList.add('dark-theme')
        : document.body.classList.remove('dark-theme'));
    });
    //dark theme
    document.addEventListener('dragover', (evt) => {
      
      evt.preventDefault();

      const draggedElement = document.querySelector('.cargo.cargo_selected');
      if (draggedElement === null){
        return
      }
      const draggedElementPrevList = draggedElement.closest('.orderlist');

      const currentElement = evt.target;
      const prevDroppable = document.querySelector('.orderlist_droppable');
      let curDroppable = evt.target;
      while (!curDroppable.matches('.orderlist') && curDroppable !== document.body) {
        curDroppable = curDroppable.parentElement;
      }

      if (curDroppable !== prevDroppable) {
        if (prevDroppable) prevDroppable.classList.remove('orderlist_droppable');

        if (curDroppable.matches('.orderlist')) {
          curDroppable.classList.add('orderlist_droppable');
        }
      }

      if (!curDroppable.matches('.orderlist') || draggedElement === currentElement) return;

      if (curDroppable === draggedElementPrevList) {
        if (!currentElement.matches('.cargo')) return;

        const nextElement = (currentElement === draggedElement.nextElementSibling)
          ? currentElement.nextElementSibling
          : currentElement;

        curDroppable.querySelector('.orderlist__cargo-list')
          .insertBefore(draggedElement, nextElement);

        return;
      }

      if (currentElement.matches('.cargo')) {
        curDroppable.querySelector('.orderlist__cargo-list')
          .insertBefore(draggedElement, currentElement);

        return;
      }

      if (!curDroppable.querySelector('.orderlist__cargo-list').children.length) {
        curDroppable.querySelector('.orderlist__cargo-list')
          .appendChild(draggedElement);
      }
    });
  }
};
