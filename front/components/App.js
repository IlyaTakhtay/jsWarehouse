import Orderlist from './Orderlist';
import AppModel from '../model/AppModel';

export default class {
  #orderlists = [];

  onDropCargoInOrderlist = async (evt) => {
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

    try {
      
      if (srcOrderlistID !== destOrderlistID) {
        const moveCargoResult = await AppModel.moveCargo( {
          cargoID:movedCargoID,
          srcOrderID: srcOrderlistID,
          destOrderID: destOrderlistID
        } )

        const movedCargo = srcOrderlist.deleteCargo({ cargoID: movedCargoID });
        destOrderlist.pushCargo({ cargo: movedCargo });
  
        srcOrderlist.reorderCargos();
      }
  
      destOrderlist.reorderCargos();
      
    } catch (err) {
      console.error(err)
    }



  };

  editCargo = async ({ cargoID, newProductInCargo, newCargoAmount }) => {
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
      return;
    }

    const currentCargoAmount = findedCargo.cargoAmount;
    const currentProductInCargo = findedCargo.productInCargo;

    if ((!newCargoAmount || newCargoAmount === currentCargoAmount) && 
    (!newProductInCargo || newProductInCargo === currentProductInCargo)) return;  
    
    try {
      const currentAvailableResult = await AppModel.getProductAmount({productName:newProductInCargo})
      if (currentAvailableResult[0].warehouse_product_count < Number(newCargoAmount)){
        alert("Недостаточно на складе")
        return;
      }
      const updateCargoResult = await AppModel.updateCargo({
        cargoID, 
        cargoName : newProductInCargo, 
        cargoCount : newCargoAmount,
      });

      findedCargo.cargoAmount = newCargoAmount;
      findedCargo.productInCargo = newProductInCargo;

      document.querySelector(`[id="${cargoID}"] span.cargo__text`).innerHTML = newCargoAmount;
      document.querySelector(`[id="${cargoID}"] span.cargo__number`).innerHTML = newProductInCargo;
      
      console.log(currentAvailableResult)
      console.log(updateCargoResult)
    } catch (err) {
      console.error(err)
    }
  };

  onDeleteCargo = async ({ cargoID }) => {
    let findedCargo = null;
    let findedOrderlist = null;
    for (let orderlist of this.#orderlists) {
      findedOrderlist = orderlist;
      findedCargo = orderlist.getCargoByID({ cargoID });
      if (findedCargo) break;
    }

    try {
      const deleteCargoResult = await AppModel.deleteCargo( {cargoID} );

      findedOrderlist.deleteCargo({ cargoID });
      document.getElementById(cargoID).remove();
      
      console.log(deleteCargoResult)
    } catch (err) {
      console.error(err)
    }

  };

  addEmptyOrderlist = async () => {

    const orderlistID = crypto.randomUUID();
    try {
      const addOrderlistResult = await AppModel.addOrderlist({
        orderID: orderlistID, 
        position: this.#orderlists.length
        });

        const newOrderlist = new Orderlist({
          orderlistID,
          position: this.#orderlists.length,
          onDropCargoInOrderlist: this.onDropCargoInOrderlist,
          onDeleteCargo: this.onDeleteCargo
        });
        this.#orderlists.push(newOrderlist);
        newOrderlist.render();
        console.log(addOrderlistResult)
    } catch (error) {
      console.error(error)
    }
      
    document.querySelectorAll('.orderlist-adder__input').forEach((currentInputElement) => {
      currentInputElement.style.display = 'inherit'
    });
  }

  cargoNameSelectorAppender = async ( {selector} ) => {
    var selector
    if (selector == 'ADD') { selector = document.getElementById("cargoName-Add")}
    if (selector == 'EDIT') { selector = document.getElementById("cargoName-Edit")}
    try {
      const productsListResult = await AppModel.getListOfProducts()
      productsListResult.forEach( product => {
        const optionElement = document.createElement('option')
        optionElement.text = product
        selector.add(optionElement)
      })
      console.log(productsListResult)
    } catch (error) {
      console.error(error)
    }

   }

  initAddModal = () => {
    const cagroAddDialog = document.getElementById("app-add-modal");
    this.cargoNameSelectorAppender({ selector: 'ADD'});
    const cargoCloseHandler = () => {
      cagroAddDialog.close()
      localStorage.setItem("addOrderlistID", '');
    }

    const cargoOkHandler = (event) => {
      event.preventDefault();
      const orderlistID = localStorage.getItem("addOrderlistID");
      const cargoInputName = document.getElementById("cargoName-Add").value
      const cargoInputCount = document.getElementById("cargoCount-Add").value

      if (orderlistID && cargoInputCount && cargoInputCount  && Number(cargoInputCount) > -1 && Number(cargoInputCount) < 9999){
        this.#orderlists.find(orderlist => orderlist.orderlistID === orderlistID)
        .appendNewCargo({productInCargo: cargoInputName, amount: cargoInputCount})
        cargoCloseHandler()
      }
    }
    cagroAddDialog.querySelector(".dialog-ok__btn").addEventListener("click", (event) => cargoOkHandler(event))
    cagroAddDialog.querySelector(".dialog-close__btn").addEventListener("click", cargoCloseHandler)
  };

  initEditModal = () => {
    const cagroEditDialog = document.getElementById("app-edit-modal");
    this.cargoNameSelectorAppender({ selector: 'EDIT' });
    const cargoCloseHandler = () => {
      cagroEditDialog.close()
      localStorage.setItem("editCargoID", '');
    }

    const cargoOkHandler = (event) => {
      event.preventDefault(event);
      const cargoID = localStorage.getItem("editCargoID");
      const cargoInputName = document.getElementById("cargoName-Edit").value
      const cargoInputCount = document.getElementById("cargoCount-Edit").value
      if (cargoID && cargoInputCount && cargoInputCount && Number(cargoInputCount) > -1 && Number(cargoInputCount) < 9999){
        this.editCargo({cargoID, newCargoAmount : cargoInputCount, newProductInCargo : cargoInputName})
        cargoCloseHandler()
      }
    }
    cagroEditDialog.querySelector(".dialog-ok__btn").addEventListener("click",(event) => cargoOkHandler(event))
    cagroEditDialog.querySelector(".dialog-close__btn").addEventListener("click", cargoCloseHandler)
  };

  scrubAllOrderlists = async () => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
  
    try {
      for (const order of this.#orderlists){
        if  (order.orderlistDate == today)
        order.deleteOrderlist()
      }
      //заглушка
      const warehouseResult = await AppModel.updateWarehouse({productName: 'Мемы' ,productAmount : 0 })
      console.log(warehouseResult)
    } catch (error) {
      console.error(error)  
    }
  }

  async init() {
    document.querySelector('.orderlist-adder__btn').addEventListener('click', this.addEmptyOrderlist)
    document.querySelector('.floating__btn').addEventListener('click', this.scrubAllOrderlists)
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

    try {
      const orderlistsResult = await AppModel.getOrderlists();
      console.log(orderlistsResult)
      for (const orderlist of orderlistsResult) {
        const orderlsitObj = new Orderlist ({
          orderlistID: orderlist.orderlistID,
          name: orderlist.orderlistName,
          date: orderlist.orderlistDate,
          position: orderlist.orderlistPosition,
          onDropCargoInOrderlist: this.onDropCargoInOrderlist,
          onDeleteCargo: this.onDeleteCargo
        });
        this.#orderlists.push(orderlsitObj);
        orderlsitObj.render();
        const liElement = document.getElementById(orderlist.orderlistID);
        const currEls = Array.from(liElement.querySelectorAll('.orderlist-adder__input'))
        currEls.forEach((currentInputElement) =>{
          if (currentInputElement.type == 'date') {
            currentInputElement.value = orderlist.orderlistDate
            if (currentInputElement.value != '') currentInputElement.readOnly = true
          }
          if (currentInputElement.type == 'text') {
            currentInputElement.value = orderlist.orderlistName
            if (currentInputElement.value != '') currentInputElement.readOnly = true
          }
        })
        document.querySelectorAll('.orderlist-adder__input').forEach((currentInputElement) => {
          currentInputElement.style.display = 'inherit'
        });
        for (const cargo of orderlist.cargos) {
          orderlsitObj.addNewCargoLocal({
            cargoID: cargo.cargoID,
            amount: cargo.cargoAmount,
            productInCargo: cargo.productInCargo,
            position: cargo.cargoPosition
          })
        }

      }
    } catch (error) {
      console.error(error);
    }

  }
};
