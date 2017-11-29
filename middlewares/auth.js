const jwt = require('jsonwebtoken')

const config = require('config.json')('./config/config.json');

const secretKey = config.jwt.secretKey;


const monthMilliSec = 30 * 24 * 60 * 60 * 1000;
const monthSec =  monthMilliSec / 1000;


var userModel = require('../models/user.model');

var dateFormat = require('dateformat');

var now = new Date();
var today = dateFormat(now, "isoDate");

const authMiddleware = (req, res, next) => {
    // read the token from header or url
    const accessToken = req.headers['accessToken'] || req.query.accessToken || req.cookies.accessToken;

    console.log("accessToken : ", accessToken);

    // create a promise that decodes the accessToken
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(accessToken, secretKey, (error, accessTokenDecoded) => {
                if(error){
                  console.log("accessToken verify error");
                  reject(error);
                }else{
                  console.log("accessToken verify");
                  //console.log("accessTokenDecoded : ", accessTokenDecoded);

                  resolve(accessTokenDecoded);
                }
            });
        }
    )

    // if it has failed to verify, it will return an error message
    const onError = (error) => {
      res.clearCookie("access_token");
      res.render('user/signin', {title: global.title});
    }

    // process the promise
    p.then((tokenDecoded)=>{
      req.decoded = tokenDecoded;

      var email = req.decoded.data.email;
      console.log("email : ", email);
      //var dataObject = JSON.parse(req.decoded.data);
      //console.log("dataObject : ", dataObject);
      //console.log("req.decoded.data : ", req.decoded.data);
      //console.log("dataObject.email", dataObject.email);
      if(email === undefined){
        res.clearCookie("access_token");
      }else{
        console.log("tokenDecoded ok");

        userModel.signinToday(email, function(error, result){
          next();
        });

      }

    }).catch(onError);
};

module.exports = authMiddleware;
