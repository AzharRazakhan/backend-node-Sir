const express = require('express');
const app = express();
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const cors = require('cors');




mongoose.connect('mongodb://127.0.0.1:27017/test')
.then(() => console.log('Connected!'));
app.use(cors());


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
      jwt.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs', function(err, decode) {
        if (err) req.user = undefined;
        req.user = decode;
        next();
      });
    } else {
      req.user = undefined;
      next();
    }
  });
  var routes = require('./routes/route.js');
  routes(app);




app.listen(3000,() => {
    console.log('Server is running on port 3000');
})