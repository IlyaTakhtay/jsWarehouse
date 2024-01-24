// should to set .env file
export default class AppModel {

    static async getListOfProducts(){
        try{
            const orderlistsResponse  = await fetch('http://localhost:8001/products');
            const orderlistsBody = await orderlistsResponse.json();

            if (orderlistsResponse.status != 200){
                return Promise.reject(orderlistsBody);
            }
            return orderlistsBody.porductsList;
        } catch (err) {
            return Promise.reject ({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async getProductAmount( {productName} = {productName:''}){
        try{
            const productAmountResponse  = await fetch(
                `http://localhost:8001/productAmount/${productName}`,
                {
                    method: 'GET',
                }
            );
            const productAmountBody = await productAmountResponse.json();

            if (productAmountResponse.status != 200){
                return Promise.reject(productAmountBody);
            }
            return productAmountBody.porductsList;
        } catch (err) {
            return Promise.reject ({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async getOrderlists(){
        try{
            const orderlistsResponse  = await fetch('http://localhost:8001/orderlists');
            const orderlistsBody = await orderlistsResponse.json();

            if (orderlistsResponse.status != 200){
                return Promise.reject(orderlistsBody);
            }
            return orderlistsBody.orderlists;
        } catch (err) {
            return Promise.reject ({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async addOrderlist({ orderID, position = -1 } = 
        { orderID: null, position: -1 }){
        try{
            const addOrderlistResponse  = await fetch(
                'http://localhost:8001/orderlists',
                {
                    method: 'POST',
                    body: JSON.stringify({ orderID, position }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (addOrderlistResponse.status != 200){
                const addorderlistsBody = await addOrderlistResponse.json();
                return Promise.reject(addorderlistsBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Orderlist успешно добавлен! ${orderID}`
            };
        } catch (err) {
            return Promise.reject ({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateOrderlist({ orderID, name, orderDate, position = -1 } = 
        { orderID: null, name: '', orderDate: '', position: -1 }){
        try{
            const addOrderlistResponse  = await fetch(
                'http://localhost:8001/orderlists',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ orderID, name, orderDate, position }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (addOrderlistResponse.status != 200){
                const addorderlistsBody = await addOrderlistResponse.json();
                return Promise.reject(addorderlistsBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Orderlist успешно обновлен! ${orderID}`
            };
        } catch (err) {
            return Promise.reject ({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async addCargo({ cargoID, cargoName, cargoCount, orderID , position = -1 } = 
        { cargoID: null, cargoName: '', cargoCount: '', orderID: null, position: -1 }){
        try{
            const addCargoResponse  = await fetch(
                'http://localhost:8001/cargos',
                {
                    method: 'POST',
                    body: JSON.stringify({ cargoID, cargoName, cargoCount, orderID , position }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (addCargoResponse.status != 200){
                const addCargoBody = await addCargoResponse.json();
                return Promise.reject(addCargoBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Cargo успешно добавлен! ${cargoID} в ${orderID}`
            };
        } catch (err) {
            return Promise.reject ({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateCargo({ cargoID, cargoName, cargoCount, orderID , position } = 
        { cargoID: null, cargoName: '', cargoCount: '', orderID: null, position: -1 }){
        try{
            const updateCargoResponse  = await fetch(
                `http://localhost:8001/cargos/${cargoID}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ cargoName, cargoCount, orderID, position }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (updateCargoResponse.status != 200){
                const updateCargoBody = await updateCargoResponse.json();
                return Promise.reject(updateCargoBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Параметры Cargo ${cargoID} успешно обновлены в ${orderID}`
            };
        } catch (err) {
            return Promise.reject ({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async moveCargo({ cargoID, srcOrderID ,destOrderID } = 
        { cargoID: null, srcOrderID: null, destOrderID: null }){
        try{
            const moveCargoResponse  = await fetch(
                `http://localhost:8001/cargos`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ cargoID, srcOrderID ,destOrderID }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (moveCargoResponse.status != 200){
                const moveCargoBody = await moveCargoResponse.json();
                return Promise.reject(moveCargoBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Cargo ${cargoID} успешно перенесен из ${srcOrderID} в ${destOrderID}`
            };
        } catch (err) {
            return Promise.reject ({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async deleteCargo ({ cargoID } = 
        { cargoID: null }){
        try{
            const deleteCargoResponse  = await fetch(
                `http://localhost:8001/cargos/${cargoID}`,
                {
                    method: 'DELETE'
                }
            );
            
            if (deleteCargoResponse.status != 200){
                const deleteCargoBody = await deleteCargoResponse.json();
                return Promise.reject(deleteCargoBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Cargo ${cargoID} успешно удален`
            };
        } catch (err) {
            return Promise.reject ({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async deleteOrderlist ({ orderID } = 
        { orderID: null }){
        try{
            const deleteOrderlistResponse  = await fetch(
                `http://localhost:8001/orderlists/${orderID}`,
                {
                    method: 'DELETE'
                }
            );
            
            if (deleteOrderlistResponse.status != 200){
                const deleteOrderlistBody = await deleteOrderlistResponse.json();
                return Promise.reject(deleteOrderlistBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Список ${orderID} и все Cargos успешно удалены`
            };
        } catch (err) {
            return Promise.reject ({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateWarehouse({productName, productAmount} = 
        { productName: '', productAmount: -1 }){
        try{
            const updateWarehouse  = await fetch(
                `http://localhost:8001/warehouse`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ productName, productAmount }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (updateWarehouse.status != 200){
                const updateWarehouseBody = await updateWarehouse.json();
                return Promise.reject(updateWarehouseBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Параметры Warehouse успешно обновлены`
            };
        } catch (err) {
            return Promise.reject ({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }
};