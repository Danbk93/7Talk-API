function goMatching(){
    if(sessionStorage.getItem('match_status')== 'true'){
        alert('이미 매칭 중입니다! 매칭이 완료되길 기다려주세요.');
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
            if( json.data.result.length != 0){
                console.log('in');
                sessionStorage.setItem('match_status', 'false');
                requestChatroom(json.data.result[0]);
            }
        }
    };
    httpRequest.open('GET', location.origin + '/api/recommend/alert', true);
    httpRequest.send();
})();

function requestChatroom(opposite_email){
    var body = new Object();
    body.oppositeEmail = opposite_email;

    var httpRequest;
    if (window.XMLHttpRequest) { // 모질라, 사파리등 그외 브라우저, ...
        httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE 8 이상
        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            alert('매칭성공!');
            console.log(httpRequest.responseText);
        }
    };
    httpRequest.open('POST', location.origin + '/api/matching', true);
    httpRequest.send(JSON.stringify(body));
}
