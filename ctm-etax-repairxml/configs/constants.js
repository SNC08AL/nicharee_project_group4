
// index.js const
const checkStore_nor = `SELECT * FROM etax_fullform_detail  where taxinvoice_code = ?`
const checkStore2_full = `SELECT * FROM etax.etax_fullform_hq_detail where taxinvoice_code = ?`
const checkStore3_sh = `SELECT * FROM etax.etax_shortform_hq_detail  where taxinvoice_code = ?`
const DataRepairXmlquery = "SELECT * FROM etax.repair_xml WHERE 1=1 " +
"AND taxinvoice_business_date BETWEEN ? AND ? " +
"AND isRepair = 'N' limit 3000"//find data not fix
const queryJsonMsgquery1 = "SELECT json_msg FROM etax.etax_fullform_hq_detail WHERE 1=1 " +
"AND taxinvoice_code = ? ";//full
const queryJsonMsgquery2 = "SELECT json_msg FROM etax.etax_shortform_hq_detail WHERE 1=1 " +
"AND receipt_no = ? ";//short
const queryJsonMsgquery3 = "SELECT json_msg FROM etax.etax_fullform_detail WHERE 1=1 " +
"AND taxinvoice_code = ? ";//normal
const updateDataRepairXmlqurey = "UPDATE etax.repair_xml SET isRepair = 'Y' WHERE 1=1 " +
"AND taxinvoice_code = ? ";//update in database,it's fix
//routes.js
const checkData = "SELECT * FROM etax.repair_xml WHERE taxinvoice_business_date BETWEEN ? AND ?";
const checkData2 = "SELECT * FROM etax.repair_xml WHERE 1=1 " +
"AND taxinvoice_business_date BETWEEN ? AND ? " +
"AND isRepair = 'Y' limit 3000"

module.exports = {

  DataRepairXmlquery,
  queryJsonMsgquery1,
  queryJsonMsgquery2,
  queryJsonMsgquery3,
  updateDataRepairXmlqurey,
  checkData,
  checkStore_nor,
  checkStore2_full,
  checkStore3_sh,
  checkData2
  
};