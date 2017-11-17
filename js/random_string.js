

var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// http://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript/8084248#8084248
exports.randomString = function (num){
  var text = "";
  for( var i=0; i < num; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};
