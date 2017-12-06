var express = require('express');
var router = express.Router();

var chattingModel = require('../../../models/chatting.model');

/*
	GET

	Load chatRoom.
*/
router.get('/chatRoom', function(req, res, next) {
  var email = req.query.email;

  chattingModel.loadChatroom(email, function(error, resultObject){
    res.json(resultObject);
  });
});

module.exports = router;
