require('dotenv').config(); // configure dotenv variables
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const compression = require('compression');
const helmet = require('helmet');

const initializePassport = require('./config/passport-config')
const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');
const portfolioRouter = require('./routes/portfolios');
const transactionRouter = require('./routes/transactions');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// mongoose connection set up
const mongoDB = process.env.MONGODB;
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// passport setup
app.use(flash());
initializePassport(passport);
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(compression()); //Compress all routes
app.use(helmet());

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/portfolio', portfolioRouter);
app.use('/portfolio/:portfolio_id/transactions', transactionRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  if (err.status === 404) {
    return res.render('404');
  } else {
    return res.render('error');
  }  
});

module.exports = app;
