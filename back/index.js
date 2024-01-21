const DB = require('./db/client.js')
const dotenv = require('dotenv')

dotenv.config({
  path:'./back/.env'
})

const appHost = process.env.APP_HOST;
const appPort = process.env.APP_PORT;

// устанавливаем движок для сервера
// var http = require('http');  
const path = require('path');
// подключение express
const express = require('express');
// создаем объект приложения
const app = express();
const db = new DB();


//consoleLog middleware
app.use('*', (req,res, next) => {
  console.log(
    req.method,
    req.baseUrl || req.url,
    new Date().toISOString()
  );

  next();
});

//middleware for static appfile
app.use ('/', express.static(path.resolve(__dirname,'../dist')))


// начинаем прослушивать подключения на 8001 порту
const server = app.listen(Number(appPort), appHost, async() => {
  try {
    await db.connection();
  } catch (error) {
    console.log('app shut down')
    process.exit(100);
  }
  console.log(`Server started at host http://${appHost}:${appPort}`);


// JSON.stringify(await db.getListOfProducts())
const cargo_id = crypto.randomUUID()
const order_id = crypto.randomUUID()
  // await db.addCargo({cargoID: cargo_id, cargoName: "Мемы", cargoCount: 10, orderID: 1, position: 1})
  // await db.addOrder({orderID: order_id, name: 'Vladimir', orderDate: '21.01.24', position: 3})
  // console.log(await db.deleteCargo( {cargoID: 'd8b4132b-410f-4903-8b77-744c722bb983' } ));
  // console.log(await db.deleteOrder({orderID: '60854c02-4c51-48d9-a6be-c074c31097b2'}))
  // console.log(await db.updateOrdersList({orderID: 235235325, customerName: 'BIBA', orderDate: '01.02.02'}))
  // console.log(await db.updateCargo({cargoID: 4, cargoName: 'Бубсы', cargoCount: 2, orderID: 1, position: 30}))
  console.log(await db.getListOfOrders( {TODAY: false} ));
  console.log(await db.getListOfProducts());
  console.log(await db.getListOfCargo({orderID: 2}))
  
});

process.on('SIGTERM', () =>{ 
   console.log('SIGTERM signal recived: closing HTTP server');
   server.close(async () => {
    await db.disconnect();
    console.log('HTTP server closed');
   }); 
});
