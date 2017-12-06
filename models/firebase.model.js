
var modelLog = "Firebase";
var errorModel = require('./error.model');

var queryModel = require('./query.model');


exports.insertDeviceToken = function(email, deviceToken, callback) {
  var sql = "INSERT INTO device (user_id, device_token) VALUE (SELECT user_id FROM user WHERE email_mn = ?, ?)";

  var sqlParams = [email, deviceToken];

  queryModel.request("insert", modelLog, sql, sqlParams, function(error, heartObject){
    callback(error, heartObject);
  });
};
