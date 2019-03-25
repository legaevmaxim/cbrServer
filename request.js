const soapRequest = require('easy-soap-request');
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const util = require('util');
const xmlParser = util.promisify(parser.parseString);

async function GetCursOnDate(params) {
  try{

    let url = 'http://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx';
    let headers = {
      'Content-Type': 'text/xml; charset=utf-8',
      'soapAction': 'http://web.cbr.ru/GetCursOnDate'
    };
    let date = new Date(params.date);
    if(date.getTime() > (new Date()).getTime())
    {
      return {
        succsess:false,
        msg: "Запрос курса валют из будущего невозможен"
      }
    }
    let month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
    let day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
   
    date = `${date.getFullYear()}-${month}-${day}`;
    console.log(date)
    let xml = 
    `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetCursOnDate xmlns="http://web.cbr.ru/">
          <On_date>${date}</On_date>
        </GetCursOnDate>
      </soap:Body>
    </soap:Envelope>`;

    let { response } = await soapRequest(url, headers, xml, 10000); // Optional timeout parameter(milliseconds)
    let { body, statusCode } = response;
    if(statusCode == 200)
    {
      let json_result = await xmlParser(body);
      json_result = json_result['soap:Envelope']['soap:Body'][0].GetCursOnDateResponse[0].GetCursOnDateResult[0]['diffgr:diffgram'][0].ValuteData[0].ValuteCursOnDate
      for(let obj of json_result)
      {
        obj.Vname = obj.Vname[0].trim();
        obj.Vnom = obj.Vnom[0];
        obj.Vcurs = obj.Vcurs[0];
        obj.Vcode = obj.Vcode[0];
        obj.VchCode = obj.VchCode[0];
      }

      return {
        success:true,
        result:json_result
      }
    }
    else
    {
      return {
        succsess:false,
        statusCode
      }
    } 
  }
  catch(err)
  {
    console.log(err)
    return {
      succsess:false,
      err: "server error"
    }
  }
};

module.exports = {
  cbr:
  {
    GetCursOnDate
  }

}