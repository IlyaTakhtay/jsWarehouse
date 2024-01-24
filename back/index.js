const DB = require('./db/client.js')
const dotenv = require('dotenv')

dotenv.config({
  path:'./back/.env'
})

const appHost = process.env.APP_HOST;
const appPort = process.env.APP_PORT;

const path = require('path');
const express = require('express');

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
        message : `Getting products error ${err.error || err.error.message}`
    });
  }
});

app.get('/productAmount/:productName', async(req,res) => {
  try {
    const {productName} = req.params;
    console.log('prodcutAmount params:', productName)
    const porductsList = await db.getListOfProducts({ productName: productName })
    res.statusMessage = 'OK';
    res.json({ porductsList });
  } catch (err) {
    res.statusCode = 500;
    res.statusMessage = 'Internal serever error';
    res.json({
        timestamp: new Date().toISOString(),
        statusCode : 500,
        message : `Getting productCount error ${err.error || err.error.message}`
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
      message : `Adding Cargos error ${err.error || err.error.message}`
    });
}
});


app.get('/orderlists', async(req,res) => {
  try {
    let posCounter = 0;
    const [dbOrderlists, dbCargos] = await Promise.all([db.getListOfOrder({TODAY:true}),db.getListOfCargo({orderID:''})])
    const cargos = dbCargos.map(({cargo_id, product_name, product_count_order, order_id}) => ({ cargoID: cargo_id, productInCargo: product_name, cargoAmount: product_count_order, order_id , cargoPosition: (posCounter++) }));

    const CargosDictionary = cargos.reduce((acc, cargo) => {
      const { order_id, ...restCargo } = cargo; // Исключаем order_id из каждого объекта
    
      if (order_id) {
        acc[order_id] = acc[order_id] || [];
        acc[order_id].push(restCargo);
      }
      return acc;
    }, {});

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
        message : `Adding Orderlist error ${err.error || err.error.message}`
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
      message : `Adding Orderlist error ${err.error || err.error.message}`
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
      message : `Adding Orderlist error ${err.error || err.error.message}`
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
        message : `Update cargo error ${err.error || err.error.message}`
      });
  }
  
});

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
        message : `Delete cargo error ${err.error || err.error.message}`
      });
  }
  
});

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
      message : `Adding Orderlist error ${err.error || err.error.message}`
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
});

process.on('SIGTERM', () =>{ 
   console.log('SIGTERM signal recived: closing HTTP server');
   server.close(async () => {
    await db.disconnect();
    console.log('HTTP server closed');
   }); 
});
