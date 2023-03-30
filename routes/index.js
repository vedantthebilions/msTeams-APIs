var express = require('express');
var router = express.Router();
const fetch = require('../files/fetch');
const auth = require('../files/auth');
var { sql, config, sqlConfig } = require('../files/db-connection');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get(
  "/user/:userId",
  async (req, res, next) => {

      try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
          const token = authHeader.split(" ").pop();
          // here we get an access token
          const authResponse = await auth.getToken(token, "OBO");
          // call the web API with the access token
          const user = await fetch.callApi(auth.apiConfig.users + req.params.userId, authResponse.accessToken);

          // display result
          res.send(user);
        }
      } catch (error) {
          console.log(error);
          return res.send(error);
      }

  }
);

router.get(
  "/user",
  async (req, res, next) => {

      try {
          const token = auth.tokenRequest;
          // here we get an access token
          const authResponse = await auth.getToken(token);
          // call the web API with the access token
          const users = await fetch.callApi(auth.apiConfig.users, authResponse.accessToken);

          // display result
          res.send(users);
      } catch (error) {
          console.log(error);
          return res.send(error);
      }

  }
);

router.get(
  "/me",
  async (req, res, next) => {

      try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
          const token = authHeader.split(" ").pop();
          // here we get an access token
          const authResponse = await auth.getToken(token, "OBO");
          // call the web API with the access token
          const profile = await fetch.callApi(auth.apiConfig.me, authResponse.accessToken);

          // display result
          res.send(profile);
          
        }
      } catch (error) {
          console.log(error);
          return res.send(error);
      }

  }
);

router.get(
  "/meetingDetails/:chatId",
  async (req, res, next) => {

    try {
        // here we get an access token
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(" ").pop();
            // // get chat details
            const chat = await fetch.callApi(`https://graph.microsoft.com/beta/chats/${req.params.chatId}`, token);
            // // get meeting details (via chat detail)
            const meetingDetails = await fetch.callApi(`${auth.apiConfig.call}?$filter=#JoinWebUrl eq "${chat.data.onlineMeetingInfo?.joinWebUrl}"`, token);
            // //const meetingDetails = await fetch.callApi('https://graph.microsoft.com/v1.0/users/2a730820-c6ce-418d-b4fc-4340fe6506f5/onlineMeetings/' + 'MCMxOTptZWV0aW5nX01UTmxOR1k0TkRZdFpUQTNZUzAwTTJKbExXSmhOemt0T1RrNE1UVTNObVl3WldZekB0aHJlYWQudjIjMA==', authResponse.accessToken);

            if (meetingDetails?.data?.value?.length > 0) {
                res.type("application/json");
                res.end(JSON.stringify(meetingDetails?.data?.value[0]));
            } else {
                console.error("Bad data returned from online meeting request: ", meetingDetails);
                throw new Error("500: Bad data returned from online meeting request");
            }
            // display result
            console.log(meetingDetails);
            res.send(meetingDetails);
        }
        
        //return JSON.stringify(users);
    } catch (error) {
        console.log(error);
        return res.send(error);
    }

  }
);


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

module.exports = router;
