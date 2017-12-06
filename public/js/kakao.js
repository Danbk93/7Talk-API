(function(){
    Kakao.init('e4df5948391d29028a6a2d63fcde17dc');
    if(auth_status == true){
        document.getElementById('btn_kakao').value = '인증 완료'
        document.getElementById('btn_kakao').setAttribute("disabled", true);
    }
    document.getElementById('date').setAttribute('max',convertDate(new Date()));
    document.getElementById('date').setAttribute('value',convertDate(new Date()));
})();

function loginWithKakao() {
    /*
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
    */
    // 로그인 창을 띄웁니다.
    Kakao.Auth.login({
    success: function(authObj) {
        alert('success');
        auth_status = true;
        document.getElementById('btn_kakao').value = '인증 완료'
        document.getElementById('btn_kakao').setAttribute("disabled", true);
    },
    fail: function(err) {
        alert('fail');
        console.log(err.error_description);
        auth_status = false;
    }
    });
};

var checkNext = function(){
    if(auth_status == true){
        location.href = location.login + '/user/interest?page=1'
    } else {
        alert('카카오 인증은 필수입니다!')
    }
}

var getOuthStatus = function(){
    return auth_status;
}

var selectSex = function(btn_this){
    var btn_sexes = document.getElementsByClassName('btn_sex_selected')[0].classList.remove('btn_sex_selected');``
    btn_this.classList.add('btn_sex_selected');
}

function convertDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth()+1).toString();
    var dd  = date.getDate().toString();
  
    var mmChars = mm.split('');
    var ddChars = dd.split('');
  
    return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
  }
  