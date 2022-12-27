var config = require('../services/config.json');
var mysql = require('mysql');
function query(sqlParam) {
     
    return new Promise((resolve, reject) => {

        console.log("begin try");

        const connection = mysql.createConnection({
            host: config.database.DB_HOST,
            user: config.database.DB_USERNAME,
            password: config.database.DB_PASSWORD,
            database: config.database.DATABASE_NAME
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