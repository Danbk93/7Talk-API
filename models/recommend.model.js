
var modelLog = "Recommend";
var errorModel = require('./error.model');

var queryModel = require('./query.model');

/*
  Recommend table
*/
exports.addRecommend = function(userEmail, oppositeEmail, similarity, callback){
  var sql = "INSERT INTO recommend (user_id, user_id2, similarity_n, match_check, recommend_dtm) VALUE ((SELECT user_id FROM user WHERE email_mn = ?), (SELECT user_id FROM user WHERE email_mn = ?), ?, false, NOW())";

  var sqlParams = [userEmail, oppositeEmail, similarity];

  queryModel.request("insert", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};

exports.loadRecommend = function(userEmail, matchCheck, callback){
  var sql = "SELECT * FROM recommend WHERE user_id = (SELECT user_id FROM user WHERE email_mn = ?) AND match_check = ?";

  var sqlParams = [userEmail, matchCheck];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};
