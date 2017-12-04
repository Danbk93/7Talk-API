var all_agree_changed = function(){
    var cb_status = false;
    if(document.getElementsByClassName('all_agree')[0].checked == true){
        cb_status = true;
    } else{
        cb_status = false;
    }

    var sub_agrees = document.getElementsByClassName('sub_agree');
    for(var i = 0 ; i < sub_agrees.length ; i++){
        sub_agrees[i].checked = cb_status;
    }
};

var sub_agree_changed = function(cb){
    if(cb.checked == true){
        var sub_agrees = document.getElementsByClassName('sub_agree');
        var checked_count = 0;
        for( var i = 0 ; i < sub_agrees.length ; i++){
            if(sub_agrees[i].checked == true){
                checked_count++;
            }
        }
        if( checked_count == sub_agrees.length){
            document.getElementsByClassName('all_agree')[0].checked = true;
        }
    } else {
        var all_cb = document.getElementsByClassName('all_agree')[0];
        if(all_cb.checked == true){
            all_cb.checked = false;
        }
    }
};

var agree_action = function(){
    var all_checked = document.getElementsByClassName('all_agree')[0].checked;
    if(all_checked == false){
        alert('모든 약관에 동의해야만 가입이 가능합니다.');
    } else {
        location.href = location.origin + '/user/signup';
    }
    return;
};