class Player {


    constructor(displayName, membershipId, membershipType) {
        this._displayName = displayName;
        this._membershipId = membershipId;
        this._membershipType = membershipType;
    }

    get displayName() {
        return this._displayName;
    }

    set displayName(value) {
        this._displayName = value;
    }

    get membershipId() {
        return this._membershipId;
    }

    set membershipId(value) {
        this._membershipId = value;
    }

    get membershipType() {
        return this._membershipType;
    }

    set membershipType(value) {
        this._membershipType = value;
    }
}

let player;

function getUser(form) {
    const request = new XMLHttpRequest();
    let userName = htmlEscape(form.user.value);

    request.open('GET', 'https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/' + userName + '/', true);
    request.setRequestHeader('X-API-KEY', '60028b4c249b4c59ab7c95411a196711');
    request.onload = function () {
        const data = JSON.parse(this.response);
        let responded = data.Response[0];


        player = new Player(responded.displayName, responded.membershipId, responded.membershipType);
        console.log("Accessing player: " +player.displayName + " with id: " + player.membershipId);
    };
    request.send();
    request.abort();
}

function refresh() {
    getPlayerPlaytime(player.membershipId);
}

function getPlayerPlaytime (membershipId) {

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