Kakao.init('e4df5948391d29028a6a2d63fcde17dc');

(function(){
    if(auth_status == true){
        document.getElementById('btn_kakao').value = '인증 완료'
        document.getElementById('btn_kakao').setAttribute("disabled", true);
    }
})();

function loginWithKakao() {
    if(document.getElementById('id').value =='' ||
    document.getElementById('password').value =='' ||
    document.getElementById('confirm_password').value =='' ||
    document.getElementById('name').value =='' ||
    document.getElementById('birth_year').value =='' ||
    document.getElementById('birth_date').value =='' ||
    document.getElementById('email').value ==''){
        alert('정보를 모두 입력하신 뒤에 시도해주세요.');
        return;
    }

    if(document.getElementById('password').value != document.getElementById('confirm_password').value){
        alert("재확인 비밀번호가 일치하지 않습니다.");
        document.getElementById('confirm_password').value='';
        document.getElementById('confirm_password').focus();
        return;
    }

    // 로그인 창을 띄웁니다.
    Kakao.Auth.login({
    success: function(authObj) {
        auth_status = true;
        document.getElementById('btn_kakao').value = '인증 완료'
        document.getElementById('btn_kakao').setAttribute("disabled", true);
    },
    fail: function(err) {
        auth_status = false;
    }
    });
};

var checkNext = function(){
    if(auth_status == true){
        location.href = location.login + '/user/interest/step_1'
    } else {
        alert('카카오 인증은 필수입니다!')
    }
}

var getOuthStatus = function(){
    return auth_status;
}

var selectSex = function(btn_this){
    btn_this.parentNode
}