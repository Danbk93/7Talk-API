var express = require('express');
var router = express.Router();

var FCM = require('fcm-push');

var serverKey = 'AAAAo1_NRpA:APA91bGMQ4uI4lNuIxV1xzyI4mW5G8bJ2N0a1xZI9aGlhiKjoBJQd4SBedP4X7wG_NDBFTvDE6hEY4xwewFoJxdRjUMPTXTG3qYGnKZIZEhj0uQYz7eSkTGKqFCg8iuy7iCJVw8msqCT';
var fcm = new FCM(serverKey);
/*
var message = {
  to: "dj7WegkEIbE:APA91bHwhS4VJFO3lswSCFfsZ2m_k9GDlhDsxqGwbMmyvym9vjp6EGVJSTlpWrQcFY97ru8S3MdV1Vw08QueCuXLwbqANfZj2sX1JxRj6X40zp3TcZAx3K2OQdJXv7j0LpIPsCIlSj8z", // required fill with device token or topics
  data: {
    lecture_id : "notice",
    title : "제목입니다",
    desc : "설명입니다"
  },
  notification: {
      title: 'Title of your push notification',
      body: 'Body of your push notification'
  }
};
*/
/*
//callback style
fcm.send(message, function(err, response){
  if (err) {
      console.log("Something has gone wrong!");
  } else {
      console.log("Successfully sent with response: ", response);
  }
});

//promise style
fcm.send(message)
  .then(function(response){
      console.log("Successfully sent with response: ", response);
  })
  .catch(function(err){
      console.log("Something has gone wrong!");
      console.error(err);
  })
*/

/******************************
 *          route             *
 ******************************/
router.post('/', function(req, res, next){
  var deviceToken = req.body.deviceToken;


  var message = {
    to: deviceToken, // required fill with device token or topics
    data: {
      lecture_id : "notice",
      title : "제목입니다",
      desc : "설명입니다"
    },
    notification: {
        title: 'Title of your push notification',
        body: 'Body of your push notification'
    }
  };
  fcm.send(message, function(err, response){
    if (err) {
        console.log("Something has gone wrong!");


        res.send("error");
    } else {
        console.log("Successfully sent with response: ", response);


        res.json(message);
    }
  });
});


router.post('/alert', function(req, res, next){
	var phoneNumber = req.body.phoneNumber;
	var token = req.body.token;



});


module.exports = router;
