
var modelLog = "UserInterest";

var config = require('config.json')('./config/config.json');

var errorModel = require('./error.model');

var mysql      = require('mysql');
var conn = mysql.createConnection({
  host     : config.rds.host,
  user     : config.rds.user,
  password : config.rds.password,
  database : config.rds.database
});

conn.connect();


/*
  Interest table
*/
exports.loadOthersInterest = function(email, callback){
  var sql = "select email_mn AS email, question_id AS question, ae.answer_example_id AS answer from user AS u, answer AS a, answer_example AS ae where u.user_id = a.user_id AND a.answer_example_id = ae.answer_example_id AND u.email_mn != ? ORDER BY u.user_id, a.answer_id";

  var sqlParams = [email];

  conn.query(sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};

exports.loadUserInterest = function(email, callback){
  var sql = "select email_mn AS email, question_id AS question, ae.answer_example_id AS answer from user AS u, answer AS a, answer_example AS ae where u.user_id = a.user_id AND a.answer_example_id = ae.answer_example_id AND u.email_mn = ? ORDER BY a.answer_id";

  var sqlParams = [email];

  conn.query(sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};


exports.updateUserInfo = function(name, sex, birthday, age, address, phoneNum, introduction, callback){
  var sql = "UPDATE user_information SET name_sn = ?, "


};
