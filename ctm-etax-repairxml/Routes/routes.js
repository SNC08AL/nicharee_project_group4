const utils = require('../services/service');
const express = require("express");
const constants = require("../configs/constants")
const handler = require("../controllers/index")
const router = express.Router();

router.post("/handler",async(req,res)=>{
  // console.log(req.body)
    const taxinvoice_business_date = req.body.taxinvoice_business_date;
    const taxinvoice_business_date_end = req.body.taxinvoice_business_date_end;

    const data = {
      taxinvoice_business_date: taxinvoice_business_date,
      taxinvoice_business_date_end: taxinvoice_business_date_end,
    };
    
    async function checkIfDateExistsInDatabase(data) {
      var parameter = [data.taxinvoice_business_date, data.taxinvoice_business_date_end];
    var query = {
        querylist: {
            queryStr: constants.checkData,
            param: parameter
        }
    }
    var result = await utils.database.query(query);
    return result;
    }

    const dateExists = await checkIfDateExistsInDatabase(data);

  if (dateExists.length === 0) {
    // The date is not present in the database
      return res.send({
      status: "error",
      message: "The date are not present in the database",
    });
  }
 handler(data);
    try {
      const response = await handler(data);
      res.status(200).send(response);
    } catch (error) {
      res.status(500).send({
        status: "error",
        message: error.message
      });
    }

    
});




module.exports = router;
