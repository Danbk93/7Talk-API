
var modelLog = "Heart";
var errorModel = require('./error.model');

var queryModel = require('./query.model');

exports.requestUserHeart = function(email, callback){
  var sql = "SELECT email_mn AS email, heart_n AS heartNum FROM heart AS h, user AS u WHERE h.user_id = u.user_id AND u.email_mn = ?";

  var sqlParams = [email];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, heartObject){
    callback(error, heartObject);
  });
};


exports.selectUserHeartLog = function(email, callback){
  var sql = "SELECT u.email_mn AS email, l.change_n AS changeNum, l.total_n AS logNum, h.heart_n AS heartNum, l.log_ln AS log, l.create_dtm AS createTime FROM log AS l, heart AS h, user AS u WHERE l.heart_id = h.heart_id AND h.user_id = u.user_id AND u.email_mn = ?";

  var sqlParams = [email];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, heartObject){
    callback(error, heartObject);
  });
};

exports.insertHeartByUserId = function(userId, callback) {
  var sql = "INSERT INTO heart (user_id, heart_n) VALUE (?, 0)";

  var sqlParams = [Number(userId)];

  queryModel.request("insert", modelLog, sql, sqlParams, function(error, heartObject){
    callback(error, heartObject);
  });

};

exports.insertHeartByEmail = function(email, callback) {
  var sql = "INSERT INTO heart (user_id, heart_n) VALUE ((SELECT user_id FROM user WHERE email_mn = ?), 5)";

  var sqlParams = [email];

  queryModel.request("insert", modelLog, sql, sqlParams, function(error, heartObject){
    callback(error, heartObject);
  });

};

exports.deleteHeart = function(userId, callback) {
  var sql = "DELETE FROM heart WHERE user_id = ?";

  var sqlParams = [Number(userId)];

  queryModel.request("delete", modelLog, sql, sqlParams, function(error, heartObject){
    callback(error, heartObject);
  });

};

exports.insertHeartLog = function(email, changeNum, log, callback) {
  var sql = "INSERT INTO log (heart_id, change_n, total_n, log_ln) VALUE ((SELECT h.heart_id FROM user AS u, heart AS h WHERE u.user_id = h.user_id AND u.email_mn = ?), ?, (SELECT h.heart_n FROM user AS u, heart AS h WHERE u.user_id = h.user_id AND u.email_mn = ?) + ?, ?)";

  var sqlParams = [email, Number(changeNum), email, Number(changeNum), log];

  queryModel.request("insert", modelLog, sql, sqlParams, function(error, heartObject){
    callback(error, heartObject);
  });

};

exports.requestToModifyHeart = function(email, changeNum, callback) {
  var sql = "UPDATE heart SET heart_n = heart_n + ? WHERE user_id = (SELECT user_id FROM user WHERE email_mn = ?)";

  var sqlParams = [Number(changeNum), email];

  queryModel.request("update", modelLog, sql, sqlParams, function(error, heartObject){
    callback(error, heartObject);
  });

};
