var login = function(){
    var form = document.getElementById('login_form');
    var body = new Object();
    body.email = form.email.value;
    body.password = form.passwd.value;
    
    var httpRequest;
    if (window.XMLHttpRequest) { // 모질라, 사파리등 그외 브라우저, ...
        httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE 8 이상
        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }
    httpRequest.onreadystatechange = function(){
        if (httpRequest.readyState == 4 && httpRequest.status == 200){
            var result_json = JSON.parse(httpRequest.responseText);
            if(result_json.code == 0){
                location.href = location.origin + '/main';
            }else{
                alert('일치하는 계정이 없습니다.\n계정이 없다면, 회원가입을 진행해주세요.');
            }
        }
    };
    httpRequest.open('POST', location.origin + '/api/user/signin', true);
    httpRequest.setRequestHeader("Content-type", "application/json");
    httpRequest.send(JSON.stringify(body));
}