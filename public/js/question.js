function changeSelect(interest){
    var div = interest.parentNode;
    var a=0;
    
    for(var i = 0 ; i < div.getElementsByTagName('input').length ; i++)
        div.getElementsByTagName('input')[i].setAttribute("class", "btn_question");
    interest.setAttribute("class", "selected_question");

}
function next(){
    var div = document.getElementsByClassName('interest-form')[0];
    var a = location.href;
    if(div.getElementsByClassName('selected_interest').length>=5)
    {
        alert(a);
        
        if(a=='sign_up_interest.html')
        {
            location.href='sign_up_interest2.html';
        }
        else if(a=='sign_up_interest2.html')
        {
            location.href='sign_up_interest3.html';
        }
        else if(a=='sign_up_interest3.html')
        {
            location.href='sign_up_interest4.html';
        }
        
    }
    else
    {
        alert('모두 선택해주세요');
    }
}