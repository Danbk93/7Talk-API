function goMatching(){
    if(sessionStorage.getItem('match_status')== 'true'){
      var httpRequest;
      if (window.XMLHttpRequest) { // 모질라, 사파리등 그외 브라우저, ...
          httpRequest = new XMLHttpRequest();
      } else if (window.ActiveXObject) { // IE 8 이상
          httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
      }
      httpRequest.onreadystatechange = function () {
          if (httpRequest.readyState == 4 && httpRequest.status == 200) {
              var json = JSON.parse(httpRequest.responseText);

              console.log(json);

              if(json.data.result.length === 0){
                sessionStorage.setItem('match_status', "false");

                location.href = '/matching';
              }else{
                alert('이미 매칭 중입니다! 매칭이 완료되길 기다려주세요.');
              }
          }
      };
      httpRequest.open('GET', location.origin + '/api/recommend/invitation', true);
      httpRequest.send();

    }else{
        location.href = '/matching';
    }
}

(function start(){
    var httpRequest;
    if (window.XMLHttpRequest) { // 모질라, 사파리등 그외 브라우저, ...
        httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE 8 이상
        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
          var json = JSON.parse(httpRequest.responseText);

          console.log(json);

          if( json.data.result.length !== 0){
            requestChatroom(json.data.result[0]);
          }
        }
    };
    httpRequest.open('GET', location.origin + '/api/recommend/alert', true);
    httpRequest.send();
})();

function requestChatroom(opposite_email){
    sessionStorage.setItem('match_status', "false");

    var body = new Object({});
    body.oppositeEmail = opposite_email;

    var httpRequest;

    var requestURL = '';
    var alertMessage = [];

    if(confirm(opposite_email + "님과의 매칭을 실시하시겠습니까?")){
      requestURL = '/api/matching/accept';
      alertMessage = ['매칭성공!', '매칭에 실패하였습니다. 나중에 다시 시도해주세요.'];
    }else{
      requestURL = '/api/matching/reject';
      alertMessage = ['매칭 거절 성공!', '잠시 후 다시 시도해주세요.'];
    }

    if (window.XMLHttpRequest) { // 모질라, 사파리등 그외 브라우저, ...
        httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE 8 이상
        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
          var json = JSON.parse(httpRequest.responseText);

          if(json.code === 0){
            alert(alertMessage[0]);
          }else{
            alert(alertMessage[1]);
          }
          console.log(json);
        }
    };
    httpRequest.open('POST', location.origin + requestURL, true);
    httpRequest.setRequestHeader("Content-type", "application/json");
    httpRequest.send(JSON.stringify(body));
}
