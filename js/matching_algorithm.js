
var UserInterestModel = require('../models/user_interest.model');


exports.matchingAlgorithm = function(email, callback){
  UserInterestModel.loadUserInterest(email, function(error, userInterestObject){
    console.log(userInterestObject);
    UserInterestModel.loadOthersInterest(email, function(error, othersInterestObject){
      console.log(othersInterestObject);
      var list = [];
      var ulist = [];

      var similiarity = [];
      var tempsim = [];

      var firstuser = 0;
      var seconduser = 0;
      var thirduser = 0;

      var interestnum = 10;

      var userInterestList = [];

      for(var i = 0; i < userInterestObject.length; i++){
        userInterestList.push(userInterestObject[i].answer);
      }

    //유저 객체들 불러온다
      for(var i = 0; i < othersInterestObject.length;i++){
        ulist.push(othersInterestObject[i].answer)
          if(i%interestnum==interestnum-1){
            if(i!=0){
              list.push(ulist);
            }
            ulist= [];
          }

      }

    // 유저 객체를 나누어서 각각의 상대유저들과 호스트유저의 관심사를 비교한다.
      for(var k = 0 ; k < othersInterestObject.length/interestnum ; k++){
        if(othersInterestObject.length )

        similiarity[k] = compareSimilarity(userInterestList, list[k]);

        //console.log(similiarity[k]);
      }

      //최대값 저장 변수
      var max = similiarity[0];
      //두번째로 큰값 저장 변수
      var secondMax = max;
      //세번째로 큰값 저장 변수
      var thirdMax = secondMax;
    //관심사 유사도가 가장 높은 세사람을 뽑는다.
      for(var i = 0; i < similiarity.length; i++){
        //현재 인덱스의 값이 최대값 보다 크다면
        if(similiarity[i]>max){
          thirdMax = secondMax;
          //최대값을 갱신하기 전에 이전의 최대값을 저장해 놓는다.
          secondMax = max;
          //최대값 갱신
          max = similiarity[i];
          firstuser = i;
        }else if( (similiarity[i] > secondMax && similiarity[i] < max) || max == secondMax){
          //만일 구해진 max의 값이 기억된sss값보다 크다면

          thirdMax = secondMax;
          secondMax = similiarity[i];
          seconduser = i;
        }else if((similiarity[i] > thirdMax && similiarity[i] < secondMax)|| thirdMax>secondMax|| secondMax==similiarity[i]){
          thirdMax = similiarity[i];
          thirduser = i;
        }
      }

      //console.log(max)
      //console.log(secondMax)
      //console.log(thirdMax)

      //객체 리스트에 알맞는 인덱스 작업
      firstuser= firstuser * interestnum + 1;
      seconduser = seconduser * interestnum + 1;
      thirduser = thirduser * interestnum + 1;

      //console.log(othersInterestObject[firstuser].email);
      //console.log(othersInterestObject[seconduser].email);
      //console.log(othersInterestObject[thirduser].email);

      var emailList = [];

      emailList.push(othersInterestObject[firstuser].email);
      emailList.push(othersInterestObject[seconduser].email);
      emailList.push(othersInterestObject[thirduser].email);

      var resultObject = new Object({});

      resultObject.emailList = emailList;

      callback(null, resultObject);
    });
  });
};



function compareSimilarity (interestArr1, interestArr2){
  console.log("compareSimilarity");
  var similiarity=0;

  console.log(interestArr1);
  console.log(interestArr2);

  for(var i = 0; i < interestArr1.length; i++){
    if(interestArr1[i] == interestArr2[i]){
      similiarity++;
    }
  }
  //console.log(similiarity);
  return similiarity;
}
