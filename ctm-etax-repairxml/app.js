const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Route = require('./Routes/routes');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
var httpContext = require('express-http-context');
const corsOptions = {
    origin: true,
}

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
app.use(bodyParser.json({limit: '350mb'}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors(corsOptions));
//log pattern
app.use(httpContext.middleware);
app.use(function (req, res, next) {
    httpContext.set('reqId', uuidv4());
    const _parsedUrl = JSON.parse(JSON.stringify(req._parsedUrl))
    httpContext.set('pathname', _parsedUrl.pathname);
    httpContext.set('method', req.method);
    next();
});

//routes
app.options('*', cors(corsOptions))
app.get('/', (req, res) => {
    res.send('Consent Centralized System, Health Check OK!');
})
app.use('/', Route);



// require('./Utilities/logger-util');
module.exports = app;