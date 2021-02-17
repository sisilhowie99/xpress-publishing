const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const cors = require('cors');
const morgan = require('morgan');
const PORT = process.env.PORT || 4000;

const apiRouter = require('./api/api');

// used bodyParser but it was considered deprecated
// found solution for it in https://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cors());
app.use(errorHandler());

app.use('/api', apiRouter);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

module.exports = app;