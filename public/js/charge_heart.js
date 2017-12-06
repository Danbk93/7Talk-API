function changeSelect(interest){
    var div = interest.parentNode;
    var a=0;
    
    for(var i = 0 ; i < div.getElementsByTagName('input').length ; i++)
        div.getElementsByTagName('input')[i].setAttribute("id", "chooseHeart");
    interest.setAttribute("id", "selected_heart");

}
