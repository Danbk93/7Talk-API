function changeSelect(interest) {
    var div = interest.parentNode;
    var a = 0;

    for (var i = 0; i < div.getElementsByTagName('input').length; i++)
        div.getElementsByTagName('input')[i].setAttribute("class", "btn_interest");
    interest.setAttribute("class", "selected_interest");

}

function next() {
    var div = document.getElementsByClassName('interest-form')[0];
    var a = location.href;
    if (div.getElementsByClassName('selected_interest').length >= 5) {
        var question = div.getElementsByTagName('div');
        var value_result = [];

        for(var i = 0 ; i < question.length ; i++)
            value_result.push(getChildOrder(question[i].getElementsByTagName('input')));

        transValue(1, value_result, function () {
            location.href = location.origin + '/user/interest?page=2';
            
        });
    } else {
        alert('모두 선택해주세요');
    }
}

function success() {
    var div = document.getElementsByClassName('interest-form')[0];
    var a = location.href;
    if (div.getElementsByClassName('selected_interest').length >= 5) {
        var question = div.getElementsByTagName('div');
        var value_result = [];

        for(var i = 0 ; i < question.length ; i++)
            value_result.push(getChildOrder(question[i].getElementsByTagName('input')));

        transValue(2, value_result, function () {
            alert('회원가입이 완료되었습니다.\n메인 화면으로 이동합니다.');
            location.href = location.origin + '/main';
        });
    } else {
        alert('모두 선택해주세요');
    }
}

function transValue(page_num, valueList, callback) {
    var body = new Object();
    body.page = page_num;
    body.value = valueList;

    var httpRequest;
    if (window.XMLHttpRequest) { // 모질라, 사파리등 그외 브라우저, ...
        httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE 8 이상
        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            callback();
        }
    };
    httpRequest.open('POST', location.origin + '/api/user/interest', true);
    httpRequest.setRequestHeader("Content-type", "application/json");
    httpRequest.send(JSON.stringify(body));
}

function getChildOrder(childNodes) {
    for (i = 0; i < childNodes.length; i++) {
        if( childNodes[i].getAttribute("class") == 'selected_interest')
            return i + 1;
    }
    return -1;
}