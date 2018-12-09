window.onload = function () {

};

function getUser() {
    const request = new XMLHttpRequest();

    request.open('GET', 'https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/4/noodle%2321497/', true);
    request.setRequestHeader('X-API-KEY', '60028b4c249b4c59ab7c95411a196711');
    request.onload = function () {
        console.log(JSON.parse(this.response));
    };

    request.send();
}