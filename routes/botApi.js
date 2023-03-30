var express = require("express");
var router = express.Router();
var { sql, config, sqlConfig } = require("../files/db-connection");
const Axios = require("axios");
const { response } = require("express");

// router.get(
//   "/get-list",
//   async (req, res, next) => {

//       try {
//         // sql.connect(config, function (err) {

//         //   if (err) console.log(err, 'err connect');

//         //   // create Request object
//         //   var request = new sql.Request();

//         //   // query to the database and get the records
//         //   request.query('select * from list', function (err, recordset) {

//         //       if (err) console.log(err, 'err if')
//         //       console.log(recordset, 'here');
//         //       // send records as a response
//         //       res.send(recordset);

//         //   });
//         // });

//         await sql.connect(sqlConfig);
//         const result = await sql.query(`SELECT * FROM list`);

//         res.send(result);
//       } catch (error) {
//           console.log(error, 'catch');
//           return res.send(error);
//       }

//   }
// );

// router.get(
//   "/get-item/:itemId",
//   async (req, res, next) => {

//       try {
//         await sql.connect(sqlConfig);

//         // create request object
//         var request = new sql.Request();
//         request.input('id', sql.NVarChar, req.params.itemId);

//         const result = await request.query(`SELECT * FROM list WHERE id = @id`);

//         res.send(result);
//       } catch (error) {
//           console.log(error, 'catch');
//           return res.send(error);
//       }

//   }
// );

// router.post(
//   "/insert-item",
//   async (req, res, next) => {

//       try {
//         await sql.connect(sqlConfig);

//         // create request object
//         var request = new sql.Request();
//         request.input('name', sql.NVarChar, req.body.name);

//         const result = await request.query(`INSERT INTO list (name) VALUES (@name)`);

//         res.send(result);
//       } catch (error) {
//           console.log(error);
//           return res.send(error);
//       }

//   }
// );

// router.post(
//   "/update-item/:itemId",
//   async (req, res, next) => {

//       try {
//         await sql.connect(sqlConfig);

//         // create request object
//         var request = new sql.Request();
//         request.input('name', sql.NVarChar, req.body.name);
//         request.input('id', sql.NVarChar, req.params.itemId);

//         const result = await request.query(`UPDATE list SET name = @name WHERE id = @id`);

//         res.send(result);
//       } catch (error) {
//           console.log(error);
//           return res.send(error);
//       }

//   }
// );

// router.post(
//   "/delete-item/:itemId",
//   async (req, res, next) => {

//       try {
//         await sql.connect(sqlConfig);

//         // create request object
//         var request = new sql.Request();
//         request.input('id', sql.NVarChar, req.params.itemId);

//         const result = await request.query(`DELETE list WHERE id = @id`);

//         res.send(result);
//       } catch (error) {
//           console.log(error);
//           return res.send(error);
//       }

//   }
// );

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

    //Code by romal

    // const result = await request.query(
    //   `INSERT INTO MeetingMaster (chatId, title, startTime, meetingId, joinUrl, meetingType,dateTime,recordPermission) VALUES (@chatId, @title, @startTime, @meetingId, @joinUrl, @meetingType, @dateTime, null)`
    // );

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

      lastId = await request1.query(
        `SELECT MAX(id) as lastInsertId FROM MeetingMaster`
      );
      console.log('lastId', lastId.recordset[0]["lastInsertId"])
      request2.input("meetingMasterId",sql.BigInt,lastId.recordset[0]["lastInsertId"]);
      request2.input("startTime", sql.NVarChar, req.body.startTime);
      request2.input("endTime", sql.NVarChar, req.body.endTime);
      request2.input("dateTime", sql.NVarChar, req.body.dateTime);

      result2 = await request2.query(
        `INSERT INTO MeetingHistory (meetingMasterId, startTime, endTime, dateTime) VALUES (@meetingMasterId, @startTime, @endTime, @dateTime)`
      );
    } else {
      lastId = await request1.query(
        `SELECT MAX(id) as lastInsertId FROM MeetingMaster`
      );
      request2.input("meetingMasterId",
        sql.BigInt,
        lastId.recordset[0]["lastInsertId"]
      );

      request2.input("startTime", sql.NVarChar, req.body.startTime);
      request2.input("endTime", sql.NVarChar, req.body.endTime);
      request2.input("dateTime", sql.NVarChar, req.body.dateTime);

      result2 = await request2.query(
        `INSERT INTO MeetingHistory (meetingMasterId, startTime, endTime, dateTime) VALUES (@meetingMasterId, @startTime, @endTime, @dateTime)`
      );
      console.log("in here are >>>", lastId);
    }
    res.send({ result: lastId });

    // const result = await request.query(
    //   `INSERT INTO MeetingMaster (chatId, title, meetingId, joinUrl, meetingType,recordPermission) VALUES (@chatId, @title, @meetingId, @joinUrl, @meetingType, @recordPermission)`
    // );

    // const lastId = await request1.query(
    //   `SELECT MAX(id) as lastInsertId FROM MeetingMaster`
    // );

    // request3.input(
    //   "meetingMasterId",
    //   sql.Int,
    //   lastId.recordset[0]["lastInsertId"]
    // );

    // const hasData = await request3.query(
    //   `SELECT * FROM MeetingHistory WHERE meetingMasterId = @meetingMasterId`
    // );

    // let result2 = {};

    // if (hasData.recordsets[0].length === 0) {
    //   request2.input(
    //     "meetingMasterId",
    //     sql.Int,
    //     lastId.recordset[0]["lastInsertId"]
    //   );
    //   request2.input("startTime", sql.NVarChar, req.body.startTime);
    //   request2.input("endTime", sql.NVarChar, req.body.endTime);
    //   request2.input("dateTime", sql.NVarChar, req.body.dateTime);

    //   result2 = await request2.query(
    //     `INSERT INTO MeetingHistory (meetingMasterId, startTime, endTime, dateTime) VALUES (@meetingMasterId, @startTime, @endTime, @dateTime)`
    //   );
    // }

    // console.log(result2,'<<isPresent', lastId.recordset[0]['lastInsertId'])
    // res.send({ result: lastId });
  } catch (error) {
    console.log(error,'in add-meeting');
    return res.send(error);
  }
});

router.post("/update-meeting", async (req, res, next) => {
  try {
    await sql.connect(sqlConfig);

    // create request object
    var request = new sql.Request();

   
    //request.input('meetingId', sql.NVarChar, req.body.meetingId);
    // request1.input("meetingMasterId", sql.NVarChar, req.body.meetingId);
    request.input("chatId", sql.NVarChar, req.body.chatId);

    let data = await request.query(`SELECT TOP 1 * FROM MeetingMaster WHERE chatId = @chatId ORDER BY id DESC`);

    console.log('meetingMasterId',data.recordset[0]['id'])
    var request1 = new sql.Request();
    request1.input("endTime", sql.NVarChar, req.body.endTime);
    request1.input("duration", sql.NVarChar, req.body.duration);
    request1.input("meetingMasterId", sql.BigInt, data.recordset[0]['id']);

    const result = await request1.query(
      `UPDATE MeetingHistory SET endTime = @endTime, duration = @duration WHERE meetingMasterId = @meetingMasterId AND endTime IS NULL`
    );

    console.log('meetingMasterId 2',data.recordset[0]['id'])
    var request2 = new sql.Request();
    request2.input("endTime", sql.NVarChar, req.body.endTime);
    request2.input("meetingId", sql.BigInt,data.recordset[0]['id']);

    // `SELECT * FROM MeetingHistory WHERE meetingMasterId = @meetingMasterId`
    const resultMembers = await request2.query(`UPDATE MeetingMemberMaster SET endTime = @endTime WHERE meetingId = @meetingId`);

    res.send(result);
  } catch (error) {
    console.log(error,'update-meeting');
    return res.send(error);
  }
});

router.post("/add-meeting-member", async (req, res, next) => {
  try {
    await sql.connect(sqlConfig);
    // create request object

    var request = new sql.Request();
    request.input("memberId", sql.NVarChar, req.body.memberId);
    request.input("startTime", sql.NVarChar, req.body.startTime);
    request.input("chatId", sql.NVarChar, req.body.chatId);
    // request.input("meetingId", sql.NVarChar, req.body.meetingId);
    request.input("name", sql.NVarChar, req.body.name);

   let data = await request.query(`SELECT TOP 1 * FROM MeetingMaster WHERE chatId = @chatId ORDER BY id DESC`);
   request.input("meetingId", sql.BigInt, data.recordset[0]['id']);
    
    const result = await request.query(
      `INSERT INTO MeetingMemberMaster (memberId, startTime, chatId, meetingId, name) VALUES (@memberId, @startTime, @chatId, @meetingId, @name)`
    );
    console.log('result>MeetingMemberMaster', result)
    res.send(result);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

router.post("/update-meeting-member", async (req, res, next) => {
  try {
    await sql.connect(sqlConfig);

    // create request object
    var request = new sql.Request();
    request.input("chatId", sql.NVarChar, req.body.chatId);
    request.input("memberId", sql.NVarChar, req.body.memberId);
    request.input("endTime", sql.NVarChar, req.body.endTime);

    let data = await request.query(`SELECT TOP 1 * FROM MeetingMaster WHERE chatId = @chatId ORDER BY id DESC`);
    request.input("meetingId", sql.BigInt, data.recordset[0]['id']);

    const result = await request.query(
      `UPDATE MeetingMemberMaster SET endTime = @endTime WHERE meetingId = @meetingId AND memberId = @memberId`
    );

    res.send(result);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

router.post("/add-meeting-member-cost", async (req, res, next) => {
  try {
    await sql.connect(sqlConfig);

    // create request object
    var request = new sql.Request();
    request.input("memberId", sql.NVarChar, req.body.memberId);
    request.input("meetingId", sql.BigInt, req.body.meetingId);
    request.input("chatId", sql.NVarChar, req.body.chatId);
    request.input("highervalue", sql.Numeric, req.body.endSalary);
    request.input("lowervalue", sql.Numeric, req.body.startSalary);
    request.input("annualSalary", sql.NVarChar, req.body.annualSalary);
    
    const select = await request.query(
      `SELECT COUNT(id) as count FROM MeetingMemberCostMaster WHERE meetingId=@meetingId AND memberId=@memberId and chatId=@chatId`
    );

    console.log('select>>>>!!!>>>>>>>', select)
    let strQuery = ``;
    if (select.recordset[0].count == 0) {
      strQuery = `INSERT INTO MeetingMemberCostMaster (meetingId, memberId, chatId, startSalary,endSalary,annualSalary) VALUES (@meetingId, @memberId, @chatId, @lowervalue, @highervalue, @annualSalary)`;
    } else {
      strQuery = `UPDATE MeetingMemberCostMaster SET startSalary=@lowervalue , endSalary=@highervalue , annualSalary=@annualSalary  WHERE meetingId=@meetingId AND memberId=@memberId and chatId=@chatId`;
    }
    const result = await request.query(strQuery);
    console.log(result,'<<<<result')
    res.send(result);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

module.exports = router;
