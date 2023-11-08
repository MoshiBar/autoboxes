/*document.getElementById("search").onkeyup = function(event) {
    if (event.key == "Enter") {
        const loc = document.location;
        loc.pathname = "search";
        loc.search = "q=" + document.getElementById("search").value.replace(' ', '+');
        console.log(loc.pathname)
        //loc.assign();
        console.log(event);
    }
};*/

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let instUrl = urlParams.get('source')
let sessionID = urlParams.get('session')
document.getElementById('instance_name').textContent=instUrl;

$.getJSON('https://curl.ambrosia.moe/http://' + instUrl + '/manifest.json', function(data) {
        var iconurl = data.icons[0].src
        if(!iconurl.startsWith("https://")){
            iconurl = "https://" + instUrl + iconurl;
        }
        console.log(iconurl);
        document.getElementById("instance_icon").src=iconurl;
        validinstance = true;
})
var token;
var userid;
$.post(`https://curl.ambrosia.moe/https://${instUrl}/api/miauth/${sessionID}/check`, function(data) {
    var jsondata = JSON.parse(data);
    console.log(jsondata);
    token = jsondata.token;
    userid = jsondata.user.id;
    document.getElementById('instance_name').textContent=`${jsondata.user.username}@${instUrl}`;
    document.getElementById("instance_icon").src=jsondata.user.avatarUrl;
})

document.getElementById("submit").onclick = function(event){
    var pagename = document.getElementById("page_name").value;
    var repolink = document.getElementById("repo_link").value;

    $.post(`http://robotbox.es/api/update?name=${pagename}&authprovider=${instUrl}&token=${token}&repolink=${encodeURIComponent(repolink)}`, function(data) {
        document.getElementById("page_name").textContent=data;

        window.location = "/success.html"
    })
}


//https://{host}/api/miauth/{session}/check