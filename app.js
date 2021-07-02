const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose");
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const compression = require('compression');

const app = express();

app.use(compression()); //compress all routes

//setup mongodb connection
const mongoDb = process.env.MONGODB_URI;
mongoose.set('useFindAndModify', false);
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

//allow access from anywhere for now
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const verifyToken = (req, res, next) => {
  //get auth header value
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader!== 'undefined') {
    bearerHeaderValue = bearerHeader.split(' ');
    tokenValue = bearerHeaderValue[1];
    jwt.verify(tokenValue, 'thesecretkey', (err, authdata) => {
      if (err) { 
        res.status(400).json({message: 'Unauthorized'});
        return;
    } else{
        res.locals.currentUser = authdata.user;
        next();
      }
    })
  } else{
    //forbidden
    res.status(400).json({message: 'Unauthorized'});
    return;
  }
}


const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');
const authorize_user = require('./controllers/authorize_user');

app.use('/', indexRouter);
app.use('/login', authorize_user);
app.use('/user', verifyToken, userRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // send json
    return res.status(500).json({message: err.message || 'Internal error'});
});

module.exports = app;