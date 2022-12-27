const utils = require('../services/service');
const axios = utils.axios;
const constants = require("../configs/constants")
const API_KEY_HEADER = "42f6e4df-45b3-4453-a6f9-9e09731083f7";
const CONTENT = "application/json";
const HEADER = {
    'Content-Type': CONTENT,
    'apiKey': API_KEY_HEADER
};

var aws = require('aws-sdk');
const { query } = require('express');

const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const handler = async (event) => {
    var response = [];
    var jsonList = [];
    var criteria = {
        taxinvoice_business_date: event.taxinvoice_business_date,
        taxinvoice_business_date_end: event.taxinvoice_business_date_end,
    }; 
    var dataList = await getDataRepairXml(criteria);
    console.log("dataListt.length===========", dataList.length)
    for (var i = 0; i <= dataList.length - 1; i++) {
        var taxinvoice_code = dataList[i].taxinvoice_code;
        var store_name = await checkStore(taxinvoice_code);
        let json_msg = await queryJsonMsg(taxinvoice_code, store_name);
        jsonList.push(JSON.parse(json_msg[0].json_msg));
        jsonList[i]["store_name_type"] = store_name;
    }
    var fistList = jsonList.map((data) => {
        var purpose_code = "";
        var purpose = "";
        var total_discount_amt;
        if (!data.total_discount_amt || data.total_discount_amt == "") {
            total_discount_amt = "0.00";
        }
        else {
            total_discount_amt = data.total_discount_amt;
        }
        if (data.store_name_type == "normal") {
            return {
                ...data,
                store_id: fill_storeId(data.store_id),
                receipt_no: fill_receipt_no(data.receipt_no),
                customer_branch: fill_storeId(data.customer_branch),
                vat_amt: formatter.format(data.vat_amt)
            };
        } else if (data.store_name_type == "full") {//STA partial.
            return {
                ...data,
                total_discount_amt: total_discount_amt,
                channel: "hq",
            }
        } else if (data.store_name_type == "short") {
            return {
                ...data,
                total_discount_amt: total_discount_amt,
                channel: "hq",
                table: "rc_shortform"
            }
        }
    });
    var secondList = fistList.map((data) => {
        return {
            ...data,
            vat_amt: parseFloat(data.vat_amt.replace(/,/g, "")).toFixed(2),
        };
    });
    var thirdList = secondList.map((data) => {
        return {
            ...data,
            total_amt_bf_tax: parseFloat(data.vatable_amt) - data.vat_amt
        };
    });
    var fourthList = thirdList.map((data) => {
        return {
            ...data,
            total_amt_bf_tax: ((data.total_amt_bf_tax).toFixed(2)).toString()
        };
    });
    var finalList = fourthList.map((data) => {
        return {
            
            ...round_off(data)
        };
    }
    
    );
    // console.log("finalList => ", finalList);
    for (var x = 0; x <= finalList.length - 1; x++) {
        if (finalList[x].store_name_type == "full" || finalList[x].store_name_type == "short") {
            var params_xml = {
                FunctionName: 'function:ctm-etax-generatexml-sta-partial-lambda',
                Payload: JSON.stringify(finalList[x])
            };
        } else if (finalList[x].store_name_type  == "normal") {
            var params_xml = {
                FunctionName: 'function:ctm-etax-generatexml-lambda',
                Payload: JSON.stringify(finalList[x])
            };
        }
        
        if (finalList[x].store_name_type == "short") {
            await updateDataRepairXml(finalList[x].receipt_no)// repair shortform_hq
        } else if (finalList[x].store_name_type == "normal" || finalList[x].store_name_type == "full") {
            await updateDataRepairXml(finalList[x].taxinvoice_code);// normal , full
        }
        
        response.push({
            response_statusCode: 200,
            response_message: "sucessful"
        })
    }
    return response;
};


async function getDataRepairXml(data) {
    var parameter = [data.taxinvoice_business_date, data.taxinvoice_business_date_end];
    var query = {
        querylist: {
            queryStr: constants.DataRepairXmlquery,
            param: parameter
        }
    }
    var result = await utils.database.query(query);
    return result;
}

async function queryJsonMsg(taxinvoice_code, store_name) {
    if (store_name == "full") {
        var string = constants.queryJsonMsgquery1;
    } else if (store_name == "short") {
        var string = constants.queryJsonMsgquery2;
    } else if (store_name == "normal") {
        var string = constants.queryJsonMsgquery3;
    }
    var parameter = [taxinvoice_code];
    var query = {
        querylist: {
            queryStr: string,
            param: parameter
        }
    }
    var result = await utils.database.query(query);
    return result;
}

async function updateDataRepairXml(taxinvoice_code) {
    var parameter = [taxinvoice_code];
    var query = {
        querylist: {
            queryStr: constants.updateDataRepairXmlqurey,
            param: parameter
        }
    }
    var result = await utils.database.query(query);
    console.log(result)
    return result;
};


const checkStore = async (taxinvoice_code) => {
    var store_name = "normal"
    var query = {
        querylist: {
            queryStr: `SELECT * FROM etax_fullform_detail  where taxinvoice_code = ?`,
            param: [taxinvoice_code]
        }
    }
    var result = await utils.database.query(query);
    if (result.length != 0) {
        return store_name;
    } else {
        var store_name = "full"
        var query = {
            querylist: {
                queryStr: `SELECT * FROM etax_fullform_hq_detail  where taxinvoice_code = ?`,
                param: [taxinvoice_code]
            }
        }
        var result = await utils.database.query(query);
        if (result.length != 0) {
            return store_name;
        } else {
            var store_name = "short"
            var query = {
                querylist: {
                    queryStr: `SELECT * FROM etax_shortform_hq_detail  where taxinvoice_code = ?`,
                    param: [taxinvoice_code]
                }
            }
            var result = await utils.database.query(query);
            if (result.length != 0) {
                return store_name;
            } else {
                return;
            }
        }
    }
}

function fill_storeId(body) {
    // console.log(body)
    let body_length = body.length;
    if (body_length < 5) {
        for (let i = 0; i < 5 - body_length; i++) {
            body = '0' + body;
        }
    }

    return body;
}

function fill_receipt_no(body) {
    let body_length = body.length;
    if (body_length < 10) {
        for (let i = 0; i < 10 - body_length; i++) {
            body = '0' + body;
            // console.log(body + '===' + i);
        }
    }
    return body;
}

function round_off(body) {
    for (let i = 0; i < body.fullform_info.sale_item.length; i++) {
        body.fullform_info.sale_item[i].unit_price = parseFloat(body.fullform_info.sale_item[i].unit_price).toFixed(2);
        body.fullform_info.sale_item[i].total_amt = parseFloat(body.fullform_info.sale_item[i].total_amt).toFixed(2);
    }
    /*for (let i = 0; i < body.fullform_info.discount_item.length; i++) {
        if (body.fullform_info.discount_item[i].discount_amt != '') {
            body.fullform_info.discount_item[i].discount_amt = parseFloat(body.fullform_info.discount_item[i].discount_amt).toFixed(2);
        }
    }*/
    body.vat_rate = parseFloat(body.vat_rate).toFixed(2);
    body.sub_total_amt = parseFloat(body.sub_total_amt).toFixed(2);
    body.total_discount_amt = parseFloat(body.total_discount_amt).toFixed(2);
    body.total_amt_bf_tax = parseFloat(body.total_amt_bf_tax).toFixed(2);
    // body.vat_amt = parseFloat(body.vat_amt).toFixed(2);
    body.total_amt = parseFloat(body.total_amt).toFixed(2);
    body.total_amt = parseFloat(body.total_amt).toFixed(2);
    body.total_amt_nontax = parseFloat(body.total_amt_nontax).toFixed(2);
    body.vatable_amt = parseFloat(body.vatable_amt).toFixed(2);
    return body;
}


module.exports = handler;

