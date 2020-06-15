require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const letterRouter = require('./routes/letter');

const app = express();
const port = process.env.PORT || 7890;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => console.error(e));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/letter', letterRouter);

module.exports = app;
// app.listen(port, () => console.log(`Server listening on port ${port}`));
