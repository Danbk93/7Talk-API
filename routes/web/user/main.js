var express = require('express');
var router = express.Router();

var userCtrl = require('../../../controllers/user.ctrl');


/*
  GET

  main page
*/
router.get('/', function(req, res, next) {
  var email = req.query.email || undefined;

  // TODO modify branch
  if(email){
    userCtrl.userMainRouting(email, function(error, resultObject){
      var renderPage = resultObject.renderPage;

      res.render(renderPage);
    });
  }else{
    // TEST page
    res.render("user/main");
  }

});


module.exports = router;
