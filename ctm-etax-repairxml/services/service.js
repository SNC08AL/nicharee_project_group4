var mysql = require('mysql');
var axios = require('axios');
var moment = require('moment');
var pdfmake = require('pdfmake');
var request = require('request');
var jwtdecode = require('jwt-decode');
var builder = require('xmlbuilder2');
var config = require('./config.json');
var database_old = require('../database/databaseService');
var database = require('../database/databaseVPC');
var lambda = require('../lambda/lambdaService');
var PDFMerger = require('pdf-merger-js');
var file = require('fs');
var base64 = require('base64topdf');
var streams = require('memory-streams');
var { v4: uuidv4 } = require('uuid');
var { PDFDocument } = require("pdf-lib");
var Excel = require('exceljs');
var mailcomposer = require('mailcomposer');

module.exports = {
    mysql,
    axios,
    moment,
    pdfmake,
    request,
    jwtdecode,
    builder,
    config,
    database,
    database_old,
    lambda,
    PDFMerger,
    file,
    base64,
    streams,
    PDFDocument,
    uuidv4,
    Excel,
    mailcomposer
}
        