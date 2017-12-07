var express = require('express');
var router = express.Router();

var authMiddleware = require('../../../middlewares/auth');

router.use('/', authMiddleware);

/*
  GET

  matching page
*/
router.get('/', function(req, res, next) {
  var email = req.decoded.data.email;

  res.render('matching/index', {
    email:email
  });
});

module.exports = router;
