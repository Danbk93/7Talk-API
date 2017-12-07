
var matchingModel = require('../models/matching.model');

exports.acceptMatch = function(email, oppositeEmail, callback){
  matchingModel.addMatching(email, oppositeEmail, function(error, resultObject){
    callback(error, resultObject);
  });
};
