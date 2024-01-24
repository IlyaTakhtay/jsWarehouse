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

app.get('/products', async(req,res) => {
  try {
    const dbProducts = await db.getListOfProducts()
    const porductsList = dbProducts.map(product => product.warehouse_product_name)
    res.statusMessage = 'OK';
    res.json({ porductsList });
  } catch (err) {
    res.statusCode = 500;
    res.statusMessage = 'Internal serever error';
    res.json({
        timestamp: new Date().toISOString(),
        statusCode : 500,
        // Чтение ошибок не работает
        message : `Getting products error ${err.error || err.message}`
    });
  }
});

app.get('/productAmount/:productName', async(req,res) => {
  try {
    const {productName} = req.params;
    const porductsList = await db.getListOfProducts({ productName: productName })
    // const porductsList = dbProducts.map(product => product.warehouse_product_name)
    res.statusMessage = 'OK';
    res.json({ porductsList });
  } catch (err) {
    res.statusCode = 500;
    res.statusMessage = 'Internal serever error';
    res.json({
        timestamp: new Date().toISOString(),
        statusCode : 500,
        // Чтение ошибок не работает
        message : `Getting productCount error ${err.error || err.message}`
    });
  }
});



// body parsing middleware
app.use('/products', express.json());
// add orderlist
app.post('/products', async (req,res) => {
try{
  const {cargoID, cargoName, cargoCount, orderID , position} = req. body;
  console.log("Cargo params",cargoID, cargoName, cargoCount, orderID , position)
  await db.addCargo({ cargoID, cargoName, cargoCount, orderID, position});
  
  res.statusCode = 200;
  res.statusMessage = 'Ok',
  res.send();
} catch (err) {
  switch(err.type) {
    case 'client':
      res.statusCode = 400;
      res.statusMessage = 'Bad request';
      break;
    default:
      res.statusCode = 500;
      res.statusMessage = 'Internal server error';
    }
    res.json({
      timestamp: new Date().toISOString(),
      statusCode : res.statusCode,
      // Чтение ошибок не работает
      message : `Adding Cargos error ${err.error || err.error.message}`
    });
}
});


app.get('/orderlists', async(req,res) => {
  try {
    let posCounter = 0;
    const [dbOrderlists, dbCargos] = await Promise.all([db.getListOfOrder({TODAY:true}),db.getListOfCargo({orderID:''})])
    const cargos = dbCargos.map(({cargo_id, product_name, product_count_order, order_id}) => ({ cargoID: cargo_id, productInCargo: product_name, cargoAmount: product_count_order, order_id , cargoPosition: (posCounter++) }));

    //колхоз но работает
    const CargosDictionary = cargos.reduce((acc, cargo) => {
      const { order_id, ...restCargo } = cargo; // Исключаем order_id из каждого объекта
    
      if (order_id) {
        acc[order_id] = acc[order_id] || [];
        acc[order_id].push(restCargo);
      }
      return acc;
    }, {});
    
    //колхоз но работает

    posCounter = 0;
    const orderlists = dbOrderlists.map(Orderlist => ({
      orderlistID: Orderlist.order_id, orderlistName: Orderlist.customer_name, orderlistDate: Orderlist.order_date , orderlistPosition: (posCounter++), cargos: CargosDictionary[Orderlist.order_id] || []
    }));
    res.statusCode = 200;
    res.statusMessage = 'OK';
    res.json({ orderlists });
  } catch (err) {
    res.statusCode = 500;
    res.statusMessage = 'Internal serever error';
    res.json({
        timestamp: new Date().toISOString(),
        statusCode : 500,
        // Чтение ошибок не работает
        message : `Adding Orderlist error ${err.error || err.message}`
    });
  }
});

// body parsing middleware
app.use('/orderlists', express.json());
// update orderlist
app.patch('/orderlists', async (req,res) => {
try{
  const { orderID, name, orderDate, position } = req. body;
  console.log("Orderlist params", orderID, name, orderDate, position)
  await db.updateOrder({ orderID, name, orderDate, position });
  
  res.statusCode = 200;
  res.statusMessage = 'Ok',
  res.send();
} catch (err) {
  switch(err.type) {
    case 'client':
      res.statusCode = 400;
      res.statusMessage = 'Bad request';
      break;
    default:
      res.statusCode = 500;
      res.statusMessage = 'Internal server error';
    }
    res.json({
      timestamp: new Date().toISOString(),
      statusCode : res.statusCode,
      // Чтение ошибок не работает ( Тут работает ) (Не работает)
      message : `Adding Orderlist error ${err.error || err.message}`
    });
}
});

// add orderlist
app.post('/orderlists', async (req,res) => {
try{
  const { orderID, name, orderDate, position } = req. body;
  console.log("Orderlist params", orderID, name, orderDate, position)
  await db.addOrder({ orderID, name, orderDate, position });
  
  res.statusCode = 200;
  res.statusMessage = 'Ok',
  res.send();
} catch (err) {
  switch(err.type) {
    case 'client':
      res.statusCode = 400;
      res.statusMessage = 'Bad request';
      break;
    default:
      res.statusCode = 500;
      res.statusMessage = 'Internal server error';
    }
    res.json({
      timestamp: new Date().toISOString(),
      statusCode : res.statusCode,
      // Чтение ошибок не работает ( Тут работает ) (Не работает)
      message : `Adding Orderlist error ${err.error || err.message}`
    });
}

});


// body parsing middleware
app.use('/cargos', express.json());
// add orderlist
app.post('/cargos', async (req,res) => {
try{
  const {cargoID, cargoName, cargoCount, orderID , position} = req. body;
  console.log("Cargo params",cargoID, cargoName, cargoCount, orderID , position)
  await db.addCargo({ cargoID, cargoName, cargoCount, orderID, position});
  
  res.statusCode = 200;
  res.statusMessage = 'Ok',
  res.send();
} catch (err) {
  switch(err.type) {
    case 'client':
      res.statusCode = 400;
      res.statusMessage = 'Bad request';
      break;
    default:
      res.statusCode = 500;
      res.statusMessage = 'Internal server error';
    }
    res.json({
      timestamp: new Date().toISOString(),
      statusCode : res.statusCode,
      // Чтение ошибок не работает
      message : `Adding Cargos error ${err.error || err.error.message}`
    });
}
});

// body parsing middleware //
app.use('/cargos/:cargoID', express.json());
//edit cargo params
app.patch('/cargos/:cargoID', async(req,res) => {
  try{
    const { cargoID } = req.params;
    const { cargoName, cargoCount, orderID, position } = req.body;
    console.log("Cargo params", cargoID, cargoName, cargoCount, orderID , position)
    await db.updateCargo({ cargoID, cargoName, cargoCount, orderID, position});
    
    res.statusCode = 200;
    res.statusMessage = 'Ok',
    res.send();
  } catch (err) {
    switch(err.type) {
      case 'client':
        res.statusCode = 400;
        res.statusMessage = 'Bad request';
        break;
      default:
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
      }
      res.json({
        timestamp: new Date().toISOString(),
        statusCode : res.statusCode,
        // Чтение ошибок не работает
        message : `Update cargo error ${err.error || err.error.message}`
      });
  }
  
});
// Под вопросом ??? Это у нас скорее перемещение Карги. МММ а может это апдейт а не перемещение ?
// edit several cargos orderID
// app.patch('/cargos', async(req,res) => {
//   try{
//     const { reorderedCargo } = req.params;
//     await Promise.all(
//       reorderedCargo.map(({cargoID, orderID}) => db.updateCargo({ cargoID, orderID }))
//     );
    
//     res.statusCode = 200;
//     res.statusMessage = 'Ok',
//     res.send();
//   } catch (err) {
//     switch(err.type) {
//       case 'client':
//         res.statusCode = 400;
//         res.statusMessage = 'Bad request';
//         break;
//       default:
//         res.statusCode = 500;
//         res.statusMessage = 'Internal server error';
//       }
//       res.json({
//         timestamp: new Date().toISOString(),
//         statusCode : res.statusCode,
//         // Чтение ошибок не работает
//         message : `Update Cargoes error ${err.error || err.error.message}`
//       });
//   }
  
// });


// Либо вот так правильно переносить Cargos
// move cargos in Orders
app.patch('/cargos', async(req,res) => {
  try{
    const { cargoID, srcOrderID ,destOrderID  } = req.body;
    console.log("Move Cargo params", cargoID, srcOrderID, destOrderID)
    db.moveCargo({ cargoID, srcOrderID, destOrderID })
  
    res.statusCode = 200;
    res.statusMessage = 'Ok',
    res.send();
  } catch (err) {
    switch(err.type) {
      case 'client':
        res.statusCode = 400;
        res.statusMessage = 'Bad request';
        break;
      default:
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
      }
      res.json({
        timestamp: new Date().toISOString(),
        statusCode : res.statusCode,
        // Чтение ошибок не работает
        message : `Move Task error ${err.error || err.error.message}`
      });
  }
  
});

//delete cargo
app.delete('/cargos/:cargoID', async(req,res) => {
  try{
    const { cargoID } = req.params;
    await db.deleteCargo({ cargoID });
    
    res.statusCode = 200;
    res.statusMessage = 'Ok',
    res.send();
  } catch (err) {
    switch(err.type) {
      case 'client':
        res.statusCode = 400;
        res.statusMessage = 'Bad request';
        break;
      default:
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
      }
      res.json({
        timestamp: new Date().toISOString(),
        statusCode : res.statusCode,
        // Чтение ошибок не работает
        message : `Delete cargo error ${err.error || err.error.message}`
      });
  }
  
});

//delete Orderlist
app.delete('/orderlists/:orderID', async(req,res) => {
  try{
    const { orderID } = req.params;
    console.log("order*D", orderID)
    await db.deleteOrder({ orderID });
    
    res.statusCode = 200;
    res.statusMessage = 'Ok',
    res.send();
  } catch (err) {
    switch(err.type) {
      case 'client':
        res.statusCode = 400;
        res.statusMessage = 'Bad request';
        break;
      default:
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
      }
      res.json({
        timestamp: new Date().toISOString(),
        statusCode : res.statusCode,
        // Чтение ошибок не работает
        message : `Delete cargo error ${err.error || err.error.message}`
      });
  }
  
});

//TODO
// body parsing middleware
app.use('/warehouse', express.json());
// update warehouse
app.patch('/warehouse', async (req,res) => {
try{
  const { productName, productAmount } = req.body;
  console.log("warehouse params", productName, productAmount)
  /// for fake random warehouse update
  const products = await db.getListOfProducts();
  /// for fake random warehouse update
  await db.increaseProductsAmount({ productName, productAmount, productItem:products });
  
  res.statusCode = 200;
  res.statusMessage = 'Ok',
  res.send();
} catch (err) {
  switch(err.type) {
    case 'client':
      res.statusCode = 400;
      res.statusMessage = 'Bad request';
      break;
    default:
      res.statusCode = 500;
      res.statusMessage = 'Internal server error';
    }
    res.json({
      timestamp: new Date().toISOString(),
      statusCode : res.statusCode,
      // Чтение ошибок не работает ( Тут работает ) (Не работает)
      message : `Adding Orderlist error ${err.error || err.message}`
    });
}

});


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
  console.log(await db.getListOfCargo({orderID:''}))
  // console.log(await db.moveCargo({cargoID:1, srcOrderID:1, destOrderID:2 }))
  console.log(await db.getListOfOrder( {TODAY: true} ));
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
