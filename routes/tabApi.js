var express = require("express");
var router = express.Router();
const fetch = require("../files/fetch");
var { sql, config, sqlConfig } = require("../files/db-connection");

router.get("/get-meeting/:meetingId", async (req, res, next) => {
  try {
    await sql.connect(sqlConfig);

    // create request object
    var request = new sql.Request();
    request.input("id", sql.NVarChar, req.params.meetingId);
    
    const resMeeting = await request.query(
      `SELECT TOP 1 * FROM MeetingMaster WHERE chatId = @id ORDER BY id DESC`
    );
    let result = {};
    if (resMeeting.recordset[0] && resMeeting.recordset[0].id) {
      var request1 = new sql.Request();
      request1.input("id", sql.BigInt, resMeeting.recordset[0].id);

      const resDetails = await request1.query(
        `SELECT * from MeetingMemberMaster WHERE meetingId = @id`
      );

      const resCostDetails = await request1.query(
        `SELECT * FROM MeetingMemberCostMaster WHERE meetingId = @id`
      );
      var request2 = new sql.Request();
      request2.input("meetingMasterId", sql.BigInt, resMeeting.recordset[0].id);

      const resMeetingHistory = await request2.query(
        `SELECT * FROM MeetingHistory WHERE meetingMasterId = @meetingMasterId`
      );

      result = {
        meeting: resMeeting.recordset,
        meetingMembers: resDetails.recordset,
        costDetails: resCostDetails.recordset,
        resMeetingHistory: resMeetingHistory.recordset
      };
    }
    res.send(result);
  } catch (error) {
    console.log(error, "get-meeting-member-details");
    return res.send(error);
  }
});

router.get("/get-meeting-hystory/:meetingId", async (req, res, next) => {
  try {
    await sql.connect(sqlConfig);
    // create request object
    var request = new sql.Request();
    request.input("id", sql.NVarChar, req.params.meetingId);
    const resMeeting = await request.query(`SELECT mmm.*, mm.dateTime
        FROM MeetingMemberMaster as mmm
        LEFT JOIN MeetingMaster as mm ON mm.id = mmm.meetingId
        WHERE mm.chatId = @id
        ORDER BY mm.dateTime DESC, mmm.memberId ASC`);

    res.send(resMeeting.recordset);
  } catch (error) {
    console.log(error, "catch");
    return res.send(error);
  }
});

router.post("/get-meeting-member-details", async (req, res, next) => {
  try {
    await sql.connect(sqlConfig);
    // create request object
    var request = new sql.Request();

    request.input("chatId", sql.NVarChar, req.body.chatId);

    const resMeeting = await request.query(
      `SELECT TOP 1 * FROM MeetingMaster WHERE chatId = @chatId ORDER BY id DESC`
    );

    var request1 = new sql.Request();
    request1.input("id", sql.BigInt, resMeeting.recordset[0].id);
    request1.input("chatId", sql.NVarChar, req.body.chatId);
    request1.input("memberId", sql.NVarChar, req.body.memberId);

    const resData = await request1.query(
      `SELECT TOP 1 * FROM MeetingMemberMaster WHERE chatId = @chatId AND memberId = @memberId AND meetingId = @id`
    );

    const res2 = await request1.query(
      `SELECT TOP 1 * FROM MeetingMemberCostMaster WHERE chatId = @chatId AND memberId = @memberId AND meetingId = @id`
    );


    let result = {
      memberDetails: resData.recordset,
      costDetails: res2.recordset,
    };

    res.send(result);
  } catch (error) {
    console.log(error, "get-meeting-member-details");
    return res.send(error);
  }
});

router.post("/sendActivityNotification", async (req, res, next) => {
  try {
    // here we get an access token

    const authHeader = req.body.authorization;
    const ContentType = 'application/json';

    const chatMessage = {
      body: {
        contentType: "html",
        content: '<p style="left: 0px;right: 0px;top: 0px;bottom: 0px;font-family: "Segoe UI";color: #252423;"><strong>Hello, I’m MeetingCost bot</strong></p><br/><p style="height: 50px;font-family: "Segoe UI";font-weight: 400;font-size: 14px;color: #252423;">Thank you for joining<strong>' + ' ' +  req.body.meetingDetails[0].subject + ' ' + '</strong>hosted by<strong>' + ' ' + req.body.meetingDetails[0].participants["organizer"]['upn'] + '</strong></p><p style="height: 60px;font-family: "Segoe UI";font-weight: 400;font-size: 14px;color: #252423;">' + req.body.meetingDetails[0].participants["organizer"]['upn'] + ' ' +' has turned on <strong>MeetingCost</strong> feature to calculate ongoing meeting cost.<br/> <table style="border: 0px solid rgba(0, 0, 0, 0.5); background-color: red;" border="0" align="right"><tr><th style="text-align: left;border:none">Organizer</th><th style="text-align: left;">Time</th></tr><tr><td  style="display:flex;align"><div style="align-items: center;display: flex;justify-content: center;background-color: #d1d5db;color: #fff;border-radius: 50%;height: 3rem;width: 3rem;">O</div><p style="text-align:center;">'+ ' ' + req.body.meetingDetails[0].participants["organizer"]['upn'] + ' ' + '</p></td><td  style="text-align:center;">'+ ' ' + req.body.startTime + ' - ' +  req.body.endTime +'</td></tr></table>' 

        // content: '<p><h2 style="color:black;font-size: 16px">Thank you for joining' + ' ' +  req.body.meetingDetails[0].subject + ' ' + 'hosted by' + ' ' + req.body.meetingDetails[0].participants["organizer"]['upn'] +'</h2></p>'+'<p style="color:black;font-size: 16px">' + req.body.meetingDetails[0].participants["organizer"]['upn'] + ' ' +' has turned on Meeting Cost feature to calculate ongoing meeting cost.</p>'
        // content: '<h1>Thank you for joining</h1><br/>' +  + 'hosted by' + req.body.meetingDetails[0].participants["organizer"]['upn'] <ul><li>Coffee</li><li>Tea</li><li>Milk</li></ul>
      }
    };
    const chat = await fetch.postAPI(
      `https://graph.microsoft.com/v1.0/chats/${req.body.chatId}/messages`,authHeader,ContentType,JSON.stringify(chatMessage)
    );

    /*const chat = await fetch.callApi(
      `https://graph.microsoft.com/v1.0/chats/${req.body.chatId}/messages`, authHeader
    );*/

    res.send(chat);
    //return JSON.stringify(users);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

router.post("/add-meeting-organizer", async (req, res, next) => {
  try {
    await sql.connect(sqlConfig);

    // create request object
    var request = new sql.Request();
    request.input("chatId", sql.NVarChar, req.body.chatId);

    const resMeeting = await request.query(
      `SELECT TOP 1 * FROM MeetingMaster WHERE chatId = @chatId ORDER BY id DESC`
    );
    let result = {};
    if (resMeeting.recordset[0].id) {

      var request1 = new sql.Request();
      request1.input("meetingId", sql.BigInt, resMeeting.recordset[0].id);
      request1.input("startTime", sql.NVarChar, req.body.startTime);
      request1.input("memberId", sql.NVarChar, req.body.memberId);
      request1.input("chatId", sql.NVarChar, req.body.chatId);
      request1.input("name", sql.NVarChar, req.body.name);

      // const resMeetingmember = await request1.query(
      //   `SELECT COUNT(id) as countId FROM MeetingMemberMaster WHERE chatId = @chatId AND memberId=@memberId AND meetingId = @meetingId`
      // );

      // if (resMeetingmember.recordset[0].countId == 0) {
        result = await request1.query(
          `INSERT INTO MeetingMemberMaster (memberId, startTime, chatId, meetingId, name) VALUES (@memberId, @startTime, @chatId, @meetingId, @name)`
        );
      // }
      
    }
    res.send(result);
  } catch (error) {
    console.log(error, "get-meeting-member-details");
    return res.send(error);
  }
});

router.post("/update-meeting-recordpermission", async (req, res, next) => {
  try {
    await sql.connect(sqlConfig);

    // create request object
    var request = new sql.Request();

    request.input("id", sql.NVarChar, req.body.chatId);
    request.input("recordPermission", sql.Bit,req.body.recordPermission );

    const result = await request.query(
      `UPDATE MeetingMaster SET recordPermission = @recordPermission WHERE chatId = @id`
    );

    // update Member End times
    // var request1 = new sql.Request();
    // request1.input("meetingId", sql.NVarChar, req.body.meetingId);

    // const resultMembers = await request1.query(
    //   `UPDATE MeetingMemberMaster SET endTime = @endTime WHERE meetingId = @meetingId`
    // );
    res.send(result);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

router.post("/update-meeting-currency", async (req, res, next) => {
  try {
    await sql.connect(sqlConfig);

    // create request object
    var request = new sql.Request();

    request.input("id", sql.NVarChar, req.body.chatId);
    request.input("currency", sql.NVarChar ,req.body.currency ? req.body.currency : 'USD');

    const result = await request.query(
      `UPDATE MeetingMaster SET currency = @currency WHERE chatId = @id`
    );

    // update Member End times
    // var request1 = new sql.Request();
    // request1.input("meetingId", sql.NVarChar, req.body.meetingId);

    // const resultMembers = await request1.query(
    //   `UPDATE MeetingMemberMaster SET endTime = @endTime WHERE meetingId = @meetingId`
    // );

    res.send(result);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

router.post("/add-meeting", async (req, res, next) => {
  try {
    await sql.connect(sqlConfig);

    // create request object
    var request = new sql.Request();
    var request1 = new sql.Request();
    var request2 = new sql.Request();
    var request3 = new sql.Request();

    request.input("title", sql.NVarChar, req.body.title);
    request.input("chatId", sql.NVarChar, req.body.chatId);
    request.input("meetingId", sql.NVarChar, req.body.meetingId);
    request.input("joinUrl", sql.NVarChar, req.body.joinUrl);
    request.input("meetingType", sql.NVarChar, req.body.meetingType);
    request.input("recordPermission", sql.Bit, req.body.recordPermission);

    request3.input("meetingMasterId", sql.BigInt, req.body.meetingMasterId);
    // Search if data is present
    let hasData = await request.query(
      `SELECT TOP 1 * FROM MeetingMaster WHERE chatId = @chatId ORDER BY id DESC`
    );

    let lastId;
    // If data is not present
    if (!hasData.recordset[0]) {
      const result = await request.query(
        `INSERT INTO MeetingMaster (chatId, title, meetingId, joinUrl, meetingType,recordPermission) VALUES (@chatId, @title, @meetingId, @joinUrl, @meetingType, @recordPermission)`
      );

      // lastId = await request1.query(
      //   `SELECT MAX(id) as lastInsertId FROM MeetingMaster`
      // );
      // console.log('lastId', lastId.recordset[0]["lastInsertId"])
      // request2.input("meetingMasterId",sql.BigInt,lastId.recordset[0]["lastInsertId"]);
      // request2.input("startTime", sql.NVarChar, req.body.startTime);
      // request2.input("endTime", sql.NVarChar, req.body.endTime);
      // request2.input("dateTime", sql.NVarChar, req.body.dateTime);

      // result2 = await request2.query(
      //   `INSERT INTO MeetingHistory (meetingMasterId, startTime, endTime, dateTime) VALUES (@meetingMasterId, @startTime, @endTime, @dateTime)`
      // );
    }
    res.send({ result: lastId });
  } catch (error) {
    console.log(error,'in add-meeting');
    return res.send(error);
  }
});

module.exports = router;
