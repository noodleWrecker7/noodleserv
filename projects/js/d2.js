window.onload = function () {

};

function getUser(form) {
    const request = new XMLHttpRequest();
    let userName = htmlEscape(form.user.value);

    request.open('GET', 'https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/4/' +userName + '/', true);
    request.setRequestHeader('X-API-KEY', '60028b4c249b4c59ab7c95411a196711');
    request.onload = function () {
        var data = JSON.parse(this.response);
        console.log(request.status);
        console.log(data.Response);
    };
    request.send();
}


function htmlEscape(str) {
    return String(str)
        /*.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')*/
        .replace(/#/g, '%23');
}