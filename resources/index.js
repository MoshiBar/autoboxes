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

let instboxpreview = function(event) {
    var name = document.getElementById("instance_input_box").value;
    var validinstance = false;
    $.getJSON('https://curl.ambrosia.moe/http://' + name + '/manifest.json', function(data) {
        var iconurl = data.icons[0].src
        if(!iconurl.startsWith("https://")){
            iconurl = "https://" + name + iconurl;
        }
        console.log(iconurl);
        document.getElementById("instance_icon").src=iconurl;
        validinstance = true;
    }).fail(function() {
        if(name == document.getElementById("instance_input_box").value)
            document.getElementById("instance_icon").src="https://cdn.ambrosia.moe/calckey/beae3681-7644-4f66-b401-cff5bf9a4737.webp";
    });
}

let gotoauth = function(event){
    var name = document.getElementById("instance_input_box").value;

    if (event.key == "Enter") {
        sessionID = crypto.randomUUID();
        currentHost = window.location.host;
        var redirect = `https://${name}/miauth/${sessionID}` + 
        `?name=autoboxes&icon=https%3A%2F%2Fcdn.ambrosia.moe%2Fcalckey%2Fbcc3985b-1a4f-4a3a-9bc5-366c6068f5ca.png&permission=read:account` +
        `&callback=` + encodeURIComponent(`http://${currentHost}/callback.html?source=${name}&session=${sessionID}`);
        window.location.href = redirect;
    }
}
document.getElementById("instance_input_box").oninput = instboxpreview;
instboxpreview();
document.getElementById("instance_input_box").onkeyup = gotoauth;