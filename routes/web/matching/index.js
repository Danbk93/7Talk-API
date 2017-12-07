var express = require('express');
var router = express.Router();

var authMiddleware = require('../../../middlewares/auth');


/*
  GET

  matching page
*/
router.get('/', function(req, res, next) {
  var email = req.body.email;

  res.render('matching/index', {
    email:email
  });
});

module.exports = router;
