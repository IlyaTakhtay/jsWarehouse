
const mysql = require('mysql2/promise');

function getDate () {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
return today
}


class DB {
  #dbClient = null;
  #dbHost = '';
  #dbName = '';
  #dbLogin = '';
  #dbPassword = '';
  #waitForConnections = true;
  #connectionLimit = 10;
  #queueLimit = 0;
  constructor() {
    this.#dbHost = process.env.DB_HOST;
    this.#dbName = process.env.DB_NAME;
    this.#dbLogin = process.env.DB_USER;
    this.#dbPassword = process.env.DB_PASSWORD;
  
    this.#dbClient = new mysql.createPool({
      host     : this.#dbHost,
      database : this.#dbName,
      user     : this.#dbLogin,
      password : this.#dbPassword,
      waitForConnections : this.#waitForConnections,
      connectionLimit : this.#connectionLimit,
      queueLimit : this.#queueLimit
      });
  }

  async connection() {
    try {
      await this.#dbClient.getConnection();
      console.log('Database is connected successfully !')
    } catch(error){
      console.error("Unable to connect to Database:",error)
      return Promise.reject(error);
    }
  }
  async disconnect() {
    try {
      await this.#dbClient.end();
      console.log('Database is connected successfully !')
    } catch(error){
    console.error("Unable to connect to Database:",error)
    }
  }

  async getListOfProducts( {productName} = {productName:''} ) {
    let query = null;
    const queryParams = [];
    if (!productName) {
      query = 'SELECT warehouse_product_name FROM test.warehouse;'
    } else {
      query = 'SELECT * FROM test.warehouse WHERE warehouse_product_name = ?;'
      queryParams.push(String(productName))
    }
    
    try {
      const [productlist] = await this.#dbClient.query(query, queryParams);
      return (productlist);
    } catch (error) {
      console.log('Unable to get products list, error', error);
      return Promise.reject({
        type: 'internal',
        error
      })
    }
  }

  async getListOfCargo( {orderID}) {
    try {
      var [productlist] = []
      if (orderID){
        [productlist] = await this.#dbClient.query( 
          'SELECT * FROM test.order_list WHERE order_id = ?;'
          ,[String(orderID)]
        );
      } else {
        [productlist] = await this.#dbClient.query( 
          'SELECT * FROM test.order_list'
        );
      }
      return (productlist);
    } catch (error) {
      console.log('Unable to get cargo list, error', error);
      return Promise.reject({
        type: 'internal',
        error
      })
    }
  }

  async getListOfOrder( { TODAY } ) {
    try {
      if (TODAY) {
        const orderDate = getDate();
        const [orderlist] = await this.#dbClient.query(
          'SELECT * FROM orders_list WHERE order_date >= DATE(?) OR order_date IS NULL',
          [String(orderDate)]
        );
        return(orderlist);
        } else {
        const [orderlist] = await this.#dbClient.query( 
          'SELECT * FROM test.orders_list'
        );
        return(orderlist);
      }
    } catch (error) {
      console.log('Unable get orders, error', error);
      return Promise.reject({
        type: 'internal',
        error
      })
    }
  }

  async updateOrder ({
    orderID, 
    name, 
    orderDate, 
    position = -1 
  } = {
    orderID: null, 
    name: '',
    orderDate: '', 
    position: -1
  }) {
    if (!orderID || (!name && !orderDate) || position <0) {
      const errMsg = `Add order has wrong params: orderID: ${orderID}, name: ${name}, 
      ${orderDate},position:${position}`;
      console.error(errMsg);
      return Promise.reject({
        type: 'client',
        error: new Error(errMsg)
      })
    }
  var regex = /^\d{4}-\d{2}-\d{2}$/;
    if (regex.test(orderDate)){
    } else {
      const errFormat = `Date has wrong format ${orderDate}`;
      console.error(errFormat);
      return Promise.reject({
        type: 'client',
        error: new Error(errFormat)
      })
    }

    let query = null;
    const queryParams = [];
    if (name && orderDate) {  
      query = 'UPDATE orders_list SET customer_name = ?, order_date = ? WHERE order_id = ?'
      queryParams.push(String(name), String(orderDate), String(orderID))
    } else if (name) {  
      query = 'UPDATE orders_list SET customer_name = ? WHERE order_id = ?'
      queryParams.push(String(name), String(orderID))
    } else {  
      query = 'UPDATE orders_list SET order_date = ? WHERE order_id = ?'
      queryParams.push(String(orderDate), String(orderID))
    }

    try {
      await this.#dbClient.query(query,queryParams);
    } catch (error) {
      console.log('Unable add orders, error', error);
      return Promise.reject({
        type: 'internal',
        error
      })
    }

  }

  async addOrder ({
    orderID, 
    position = -1 
  } = {
    orderID: null, 
    position: -1
  }) {
    if (!orderID || position <0) {
      const errMsg = `Add order has wrong params: orderID: ${orderID}, position:${position}`;
      console.error(errMsg);
      return Promise.reject({
        type: 'client',
        error: new Error(errMsg)
      })
    }
    try {
      await this.#dbClient.query( 
        'INSERT into ORDERS_LIST (order_id) VALUES (?);',
        [orderID]
      );
    } catch (error) {
      console.log('Unable add orders, error', error);
      return Promise.reject({
        type: 'internal',
        error
      })
    }
    
  }

  async addCargo ({
    cargoID, 
    cargoName, 
    cargoCount,
    orderID,
    position = -1 
  } = {
    cargoID: null, 
    cargoName: '',
    cargoCount: '',
    orderID: null,
    position: -1
  }) {
    if (!cargoID || !cargoName || !cargoCount || !orderID || position <0) {
      const errCargo = `Add order has wrong params: orderID: ${cargoID}, name: ${cargoName}, 
      ${cargoCount},position:${position}`;
      console.error(errCargo);
      return Promise.reject({
        type: 'client',
        error: new Error(errCargo)
      })
    }
  
    try {
      await this.#dbClient.query( 
        'INSERT into ORDER_LIST (cargo_id, product_name, product_count_order, order_id) VALUES (?, ?, ?, ?);',
        [String(cargoID), String(cargoName), Number(cargoCount), String(orderID)]
      );
    } catch (error) {
      console.log('Unable add cargo, error', error);
      return Promise.reject({
        type: 'internal',
        error
      })
    }
  }

  async updateCargo ({
    cargoID, 
    cargoName, 
    cargoCount,
    orderID,
    position = -1 
  } = {
    cargoID: null, 
    cargoName: '',
    cargoCount: '',
    orderID: null,
    position: -1
  }) {

    if (!cargoID || ( !orderID && !cargoName && !cargoCount && position <0)) {
      const errCargo = `Update Cargo has wrong params: cargoID: ${cargoID}, name: ${cargoName}, 
      cargoCount:${cargoCount},orderID:${orderID}, position:${position}`;
      console.error(errCargo);
      return Promise.reject({
        type: 'client',
        error: new Error(errCargo)
      })
    }

    let query = null;
    const queryParams = [];
    if (cargoName && cargoCount && orderID) {  
      query = 'UPDATE order_list SET product_count_order = ?, product_name = ?, order_id =? WHERE cargo_id = ?'
      queryParams.push(Number(cargoCount), String(cargoName), String(orderID), String(cargoID))
    } else if (cargoName && orderID) {  
      query = 'UPDATE order_list SET product_name = ?, order_id =? WHERE cargo_id = ?'
      queryParams.push(String(cargoName), String(orderID), String(cargoID))
    } else if (cargoCount && orderID) {  
      query = 'UPDATE order_list SET product_count_order = ?, order_id =? WHERE cargo_id = ?'
      queryParams.push(Number(cargoCount), String(orderID), String(cargoID))
    } else if (cargoCount && cargoName) {  
      query = 'UPDATE order_list SET product_count_order = ?, product_name = ? WHERE cargo_id = ?'
      queryParams.push(Number(cargoCount), String(cargoName), String(cargoID))
    } else if (orderID) {  
      query = 'UPDATE order_list SET order_id =? WHERE cargo_id = ?'
      queryParams.push(String(orderID), String(cargoID))
    } else if (cargoName) {  
      query = 'UPDATE order_list SET product_name =? WHERE cargo_id = ?'
      queryParams.push(String(cargoName), String(cargoID))
    } else {  
      query = 'UPDATE order_list SET product_count_order = ? WHERE cargo_id = ?'
      queryParams.push(Number(cargoCount), String(cargoID))
    }
    try {
      await this.#dbClient.query(query,queryParams);
    } catch (error) {
      console.log('Unable update cargo, error', error);
      return Promise.reject({
        type: 'internal',
        error
      })
    }
  }

  async updateOrdersList ({
    orderID, 
    customerName, 
    orderDate
  } = {
    cargoID: null, 
    customerName: '',
    orderDate: ''
  }) {

    if (!orderID || !customerName || !orderDate) {
      const errCargo = `Update OrdersList has wrong params: orderID: ${orderID}, customerName: ${customerName}, 
      orderDate${orderDate}`;
      console.error(errCargo);
      return Promise.reject({
        type: 'client',
        error: new Error(errCargo)
      })
    }
  
    try {
      await this.#dbClient.query( 
        'UPDATE orders_list SET customer_name = ?, order_date = ? WHERE order_id = ?',
        [String(customerName), String(orderDate), String(orderID)]
      );
    } catch (error) {
      console.log('Unable update ordersList, error', error);
      return Promise.reject({
        type: 'internal',
        error
      })
    }
  }

  async deleteCargo ({ cargoID } = { cargoID: null }) {

    if (!cargoID ) {
      const errCargo = `Delete Cargo has wrong params: cargoID: ${cargoID}`;
      console.error(errCargo);
      return Promise.reject({
        type: 'client',
        error: new Error(errCargo)
      })
    }
  
    try {
      await this.#dbClient.query( 
        'DELETE from order_list WHERE cargo_id = ?',
        [cargoID]
      );
    } catch (error) {
      console.log('Unable delete cargo, error', error);
      return Promise.reject({
        type: 'internal',
        error
      })
    }
  }

  async deleteOrder ({ orderID } = { orderID: null }) {

    if (!orderID) {
      const errCargo = `Delete OrdersList has wrong params: orderID: ${orderID}`;
      console.error(errCargo);
      return Promise.reject({
        type: 'client',
        error: new Error(errCargo)
      })
    }
  
    try {
  
      await this.#dbClient.query(
        'DELETE from order_list WHERE order_id = ?',
        [orderID]
      )

      await this.#dbClient.query( 
        'DELETE from orders_list WHERE order_id = ?',
        [orderID]
      );
    } catch (error) {
      console.log('Unable delete order, error', error);
      return Promise.reject({
        type: 'internal',
        error
      })
    }
  }


  async moveCargo ({
    cargoID, 
    srcOrderID, 
    destOrderID
  } = {
    cargoID : null, 
    srcOrderID : null,
    destOrderID : null 
  } ) {
    if (!cargoID || !srcOrderID || !destOrderID) {
      const errCargo = `Move Cargo has wrong params: cargoID: ${cargoID}, srcOrderID: ${srcOrderID}, destOrderID${destOrderID}`;
      console.error(errCargo);
      return Promise.reject({
        type: 'client',
        error: new Error(errCargo)
      })
    }
  
    try {
      await this.#dbClient.query( 
        'UPDATE order_list SET order_id = ? WHERE(order_id = ? and cargo_id = ?)',
        [String(destOrderID), String(srcOrderID), String(cargoID)]
      );
    } catch (error) {
      console.log('Unable move cargo, error', error);
      return Promise.reject({
        type: 'internal',
        error
      })
    }
  }

  async increaseProductsAmount ({ productName, productAmount, productItem } = { productName : null, productItem: '', productAmount: -1} ) {
    if (!productName || productAmount < 0){
      const errCargo = `Move Cargo has wrong params: productName: ${productName}, productAmount: ${productAmount}`;
      console.error(errCargo);
      return Promise.reject({
        type: 'client',
        error: new Error(errCargo)
      })
    }
    if (productItem != ''){
      productItem.forEach(element => {
        const count = Math.floor(Math.random() * (50 - 0) + 0);
        element.warehouse_product_count = count
      });
    }

    try {
      if (productItem != ''){
        for (const product of productItem){
          await this.#dbClient.query( 
              'UPDATE warehouse SET warehouse_product_count = warehouse_product_count + ? WHERE warehouse_product_name = ?',
              [product.warehouse_product_count, product.warehouse_product_name]
            );
        }
      } else {
      await this.#dbClient.query( 
        'UPDATE warehouse set warehouse_product_count = warehouse_product_count + ? WHERE warehouse.warehouse_product_name = ?',
        [Number(productAmount), String(productName)]
      );}
    } catch (error) {
      console.log('Unable to get cargo list, error', error);
      return Promise.reject({
        type: 'internal',
        error
      })
    }
  }


}

module.exports = DB;

