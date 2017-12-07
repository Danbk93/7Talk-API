var express = require('express');
var router = express.Router();

var chattingModel = require('../../../models/chatting.model');

var authMiddleware = require('../../../middlewares/auth');

router.use('/', authMiddleware);

/*
  GET

  chatting page
*/
router.get('/chat/:topicName', function(req, res, next) {
  var email = req.decoded.data.email;
  var topicName = req.params.topicName;

  res.render('chatting/index', {
    nickname: email,
    topicName: topicName,
    email:email
  });
});

/*
  GET

  chat_room page
*/
router.get('/chatRoom', function(req, res, next) {
  var email = req.decoded.data.email;

  chattingModel.loadChatroom(email, function(error, resultObject){
    res.render('chatting/chat_room', {
      data:JSON.stringify(resultObject)
    });
  })
});

module.exports = router;
