-- берем названия всех товаров со склада +
SELECT warehouse_product_name FROM warehouse;
-- вставляем новый товар из заказа в order_list 
--(Номер в колонке, Название товара, Количество товара, Номер закза)+
insert into order_list values (NULL, "Танк", 20, 2)
-- вставляем новый заказ в orders_list
--(Номер заказа, Имя заказчика, Дата заказа) +
insert into orders_list values (NULL, "MrWho", "09.01.24")
-- Выводим всю информацию из orders_list по сегодняшней дате
SELECT * FROM orders_list WHERE  order_date = DATE('05.01.24')
-- Выводим всю информацию из order_list +
SELECT * FROM order_list

-- Обновление инфы order_list по order_id и product_name
UPDATE order_list 
SET product_count_order = <cargoCount>, product_name = <cargoName> 
WHERE  order_id = <order_id> and product_name = <product_name> 
-- Обновление инфы всю информацию из orders_list
UPDATE orders_list SET customer_name = <cutomerName> order_date = <orderDate>
WHERE order_id = <orderID>

-- Удаление инфы из order_list
DELETE from order_list WHERE cargo_id = <cargoID>

-- Удаление инфы из orders_list
DELETE from orders_list WHERE order_id = <orderID>