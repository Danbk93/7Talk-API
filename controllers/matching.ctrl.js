
var matchingModel = require('../models/matching.model');

var heartCtrler = require('../controllers/heart.ctrl');

exports.acceptMatch = function(email, oppositeEmail, callback){
  matchingModel.addMatching(email, oppositeEmail, function(error, resultMatch){
    heartCtrler.changeHeart(email, -1, function(error, resultObject){
      callback(error, resultObject);
    });
  });
};
