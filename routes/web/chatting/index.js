var express = require('express');
var router = express.Router();

/*
  GET

  chatting page
*/
router.get(['/', '/:nickname/:topicName'], function(req, res, next) {
  var nickname = req.params.nickname;
  var topicName = req.params.topicName || "public";
  res.render('chatting/index', {
    nickname: nickname,
    topicName: topicName
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
