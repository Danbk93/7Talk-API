(function () {
    Kakao.init('e4df5948391d29028a6a2d63fcde17dc');
    if (auth_status == true) {
        document.getElementById('btn_kakao').value = '인증 완료'
        document.getElementById('btn_kakao').setAttribute("disabled", true);
    }
    document.getElementById('date').setAttribute('max', convertDate(new Date()));
    document.getElementById('date').setAttribute('value', convertDate(new Date()));
})();

function loginWithKakao() {

    if (document.getElementById('password').value == '' ||
        document.getElementById('confirm_password').value == '' ||
        document.getElementById('name').value == '' ||
        document.getElementById('email').value == '') {
        alert('정보를 모두 입력하신 뒤에 시도해주세요.');
        return;
    }

    if (document.getElementById('password').value != document.getElementById('confirm_password').value) {
        alert("재확인 비밀번호가 일치하지 않습니다.");
        document.getElementById('confirm_password').value = '';
        document.getElementById('confirm_password').focus();
        return;
    }

    if (id_dup != true) {
        alert("아이디 중복확인을 해주세요");
        document.getElementById('btn_dup').focus();
        return;
    }

    // 로그인 창을 띄웁니다.
    Kakao.Auth.login({
        success: function (authObj) {
            // alert('success');
            auth_status = true;
            document.getElementById('btn_kakao').value = '인증 완료'
            document.getElementById('btn_kakao').setAttribute("disabled", true);

            var body = new Object();
            body.email = document.getElementById('email').value;
            body.password = document.getElementById('password').value;
            body.confirm = document.getElementById('confirm_password').value;
            body.name = document.getElementById('name').value;
            body.sex = document.getElementsByClassName('btn_sex_selected')[0].getAttribute('id');
            body.birthday  = document.getElementById('date').value;
            sessionStorage.setItem('user_email', body.email);

            var httpRequest;
            if (window.XMLHttpRequest) { // 모질라, 사파리등 그외 브라우저, ...
                httpRequest = new XMLHttpRequest();
            } else if (window.ActiveXObject) { // IE 8 이상
                httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
            }
            httpRequest.onreadystatechange = function(){
                if (httpRequest.readyState == 4 && httpRequest.status == 200){
                    alert('카카오톡 인증완료!\n관심사 등록페이지로 넘어갑니다.')
                    location.href = location.origin + '/user/interest?page=1&email='+body.email;
                }
            };
            httpRequest.open('POST', location.origin + '/api/user/signup', true);
            httpRequest.setRequestHeader("Content-type", "application/json");
            httpRequest.send(JSON.stringify(body));
        },
        fail: function (err) {
            alert('fail');
            console.log(err.error_description);
            auth_status = false;
        }
    });
};

var getOuthStatus = function () {
    return auth_status;
}

var selectSex = function (btn_this) {
    var btn_sexes = document.getElementsByClassName('btn_sex_selected')[0].classList.remove('btn_sex_selected');
    btn_this.classList.add('btn_sex_selected');
}

function convertDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();

    var mmChars = mm.split('');
    var ddChars = dd.split('');

    return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
}

function checkEmail(email) {
    var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;

    if (regex.test(email) === false) {
        return false;
    } else {
        return true;
    }
}

var checkId = function () {
    var id = document.getElementById('email').value;

    if (id == '') {
        id_dup = false;
        alert('이메일을 입력해주세요.');
        return;
    }
    
    if( checkEmail(id) == false ){
        id_dup = false;
        alert('잘못된 이메일 형식입니다.\n확인 후 시도해주세요.');
        return;
    }

    var httpRequest;
    if (window.XMLHttpRequest) { // 모질라, 사파리등 그외 브라우저, ...
        httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE 8 이상
        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var check_result = JSON.parse(httpRequest.responseText);
            if (check_result.code == 0) {
                id_dup = true;
                alert('사용가능한 이메일입니다.\n\nemail: ' + check_result.data.email);
            } else {
                id_dup = false;
                alert('이메일이 중첩되었습니다.');
                document.getElementById('email').value = '';
                document.getElementById('email').focus();
            }
        }
    };
    httpRequest.open('GET', location.origin + '/api/user/duplicate/' + id, true);
    httpRequest.send();
}