
var modelLog = "Comment";
var errorModel = require('./error.model');

var queryModel = require('./query.model');


exports.loadPostingComment = function(postingId, callback){
  console.log("loadPostingComment");
  var resultObject = new Object({});

  var sql = "SELECT c.comment_id AS id, u.email_mn AS email, c.content_ln AS content, c.create_dtm AS createTime, c.update_dtm AS updateTime FROM comment AS c, user AS u WHERE c.user_id = u.user_id AND c.posting_id = ? ORDER BY c.comment_id";

  var sqlParams = [postingId];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};


exports.addComment = function(email, postingId, content, callback){
  console.log("addComment");

  var sql = "INSERT INTO comment (posting_id, user_id, content_ln, create_dtm) VALUE (?, (SELECT user_id FROM user WHERE email_mn = ?), ?, NOW())";

  var sqlParams = [postingId, email, content];

  queryModel.request("insert", modelLog, sql, sqlParams, function(error, resultInsert){
    var resultObject = new Object({});

    if(error){
      resultObject.code = 1;
      resultObject.message = "데이터베이스 오류입니다. 다시 시도해주세요.";

      callback(true, resultObject);
    }else{

      var time = (new Date).getTime();
      //console.log(result);
      resultObject.code = 0;
      resultObject.message = "댓글 등록에 성공하였습니다.";

      var dataObject = new Object({});

      dataObject.email = email;
      dataObject.content = content;
      dataObject.time = time;

      resultObject.data = dataObject;

      callback(null, resultObject);
    }
  });
};


exports.removeCommentOwner = function (email, commentId, callback){
  console.log("checkCommentOwner");
  var resultObject = new Object({});

  var sql = "SELECT u.email_mn AS email FROM user AS u, comment AS c WHERE u.user_id = c.user_id AND comment_id = ?";

  var sqlParams = [commentId];

  conn.query(sql, sqlParams, function(error, result){
    if(error){
      console.log("checkCommentOwner error");
      console.log(error);

      resultObject.code = 1;
      resultObject.message = "데이터베이스 오류입니다.";

      var errorTitle = errorPrefix + "checkCommentOwner error";

      errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
        callback(true, resultObject);
      });
    }else {
      //console.log(result);

      if(result.length > 0){
        if(email === result[0].email){
          console.log("owner ok");
          removeComment(commentId, function(error, resultRemove){
            resultObject.code = 0;
            resultObject.message = "해당 댓글이 삭제되었습니다.";

            callback(null, resultObject);
          });
        }else{
          resultObject.code = 2;
          resultObject.message = "본인의 댓글이 아닙니다.";
        }
      }else{
        resultObject.code = 3;
        resultObject.message = "데이터베이스 오류입니다.";

        callback(null, resultObject);
      }


    }
  });
};


exports.removeComment = function removeComment (commentId, callback){
  var sql = "DELETE FROM comment WHERE comment_id = ?";

  var sqlParams = [commentId];

  queryModel.request("delete", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};


exports.removeAllComments = function(postingId, callback){
  var sql = "DELETE FROM comment WHERE posting_id = ?";

  var sqlParams = [postingId];

  queryModel.request("delete", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};
