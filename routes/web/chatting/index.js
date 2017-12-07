var express = require('express');
var router = express.Router();

var chattingModel = require('../../../models/chatting.model');

var authMiddleware = require('../../../middlewares/auth');

router.use('/', authMiddleware);

/*
  GET

  chatting page
*/
router.get('/chat/:roomName', authMiddleware, function(req, res, next) {
  var email = req.decoded.data.email;
  var roomName = req.params.roomName;

  chattingModel.loadChatroom(email, function(error, resultObject){
    res.render('chatting/index', {
      nickname: email,
      topicName: roomName
    });
  });


});

/*
  GET

  chat_room page
*/
router.get('/chatRoom', function(req, res, next) {
  var resultObject = new Object({});

  res.render('chatting/chat_room');
});

module.exports = router;
