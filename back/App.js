// подключение express
const express = require('express');
// создаем объект приложения
const app = express();
// открываем порт 8001
const port = process.env.PORT || 8001;
// подключаем модуль базы данных
const db = require('./database.js');

app.get('/user-list', (req, res) => {
    const sql = 'SELECT * FROM warehosue';
    db.query(sql, (err, data) => {
      if (err) throw err;
      res.render('user-list', { title: 'User List', userData: data });
    });
  });
  
// // определяем обработчик для маршрута "/"
// app.get('/', function (request, response) {
//     // отправляем ответ
//     response.send('<h2>Привет Express!</h2>');
// });
// начинаем прослушивать подключения на 3000 порту
app.listen(port, function () {
    console.log(`Server listening port ${port}`);
    });