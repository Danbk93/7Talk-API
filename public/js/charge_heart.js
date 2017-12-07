function changeSelect(interest) {
  var div = interest.parentNode;
  var a = 0;

  for (var i = 0; i < div.getElementsByTagName('input').length; i++)
    div.getElementsByTagName('input')[i].setAttribute("id", "chooseHeart");
  interest.setAttribute("id", "selected_heart");
}

function getHeartAmount() {
  var httpRequest;
  if (window.XMLHttpRequest) { // 모질라, 사파리등 그외 브라우저, ...
    httpRequest = new XMLHttpRequest();
  } else if (window.ActiveXObject) { // IE 8 이상
    httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
  }
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      var res_json = JSON.parse(httpRequest.responseText);
      document.getElementById('heart_amount').childNodes[0].nodeValue = res_json.data[0].heartNum;
    }
  };
  httpRequest.open('GET', location.origin + '/api/heart');
  httpRequest.setRequestHeader("Content-type", "application/json");
  httpRequest.send();
}


function updateHeart(message){
  if(document.getElementById('selected_heart') === null){
    alert('원하시는 하트의 개수를 선택해주세요.');
    return;
  }else{
    var body = new Object;
    body.changeNum = document.getElementById('selected_heart').parentNode.getElementsByClassName('amount')[0].getAttribute('id')

    var httpRequest;
    if (window.XMLHttpRequest) { // 모질라, 사파리등 그외 브라우저, ...
      httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE 8 이상
      httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }
    httpRequest.onreadystatechange = function () {
      if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        alert(message);
        location.href = '/user/heart';
      }
    };
    httpRequest.open('PUT', location.origin + '/api/heart');
    httpRequest.setRequestHeader("Content-type", "application/json");
    httpRequest.send(JSON.stringify(body));
  }
}
