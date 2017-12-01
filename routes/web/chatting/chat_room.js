var express = require('express');
var router = express.Router();

/*
  GET

  chat_room page
*/
router.get('/', function(req, res, next) {
  var resultObject = new Object({});

  res.render('chatting/chat_room');
});

module.exports = router;
