var config = require('../services/config.json');
var mysql = require('mysql');

function query(sqlParam) {
     
    return new Promise((resolve, reject) => {
        // console.log("begin creat connection.");
        const connection = mysql.createConnection({
            host: config.databaseVPC.DB_HOST,
            user: config.databaseVPC.DB_USERNAME,
            password: config.databaseVPC.DB_PASSWORD,
            database: config.databaseVPC.DATABASE_NAME
        });
        
        connection.connect(function(err) {
            if (err) {
                console.log("Cannot connect to Database =>  " + JSON.stringify(err, null, 2));
                reject({
                    returnCode: "1000",
                    returnMessage: "พบปัญหาบางอย่าง กรุณาติดต่อ Call Center"
                });
            }
            else {
                // console.log("DB Connected.");
                connection.query({
                    sql: sqlParam.querylist.queryStr,
                    //timeout: 30000, 
                    values: sqlParam.querylist.param
                }, function(error, result, fields) {
                    connection.destroy();
                    if (error) {
                        console.log("Cannot query =>  " + JSON.stringify(error, null, 2));
                        reject({
                            returnCode: "1000",
                            returnMessage: "พบปัญหาบางอย่าง กรุณาติดต่อ Call Center"
                        });
                    }
                    else {
                        resolve(result);
                    }
                });
            }
        });
    });
}

module.exports = {
    query
}