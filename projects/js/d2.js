class Player {


    constructor(displayName, membershipId, membershipType) {
        this._displayName = displayName;
        this._membershipId = membershipId;
        this._membershipType = membershipType;
        this.characterIds = {};
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

function refresh(form) {

    let userName = htmlEscape(form.user.value);
    let player = getUser(userName);
    document.getElementById("playerName").innerText = player.displayName;
    //getPlayerPlaytime(player.membershipId);
}

function getUser(user) {
    const request = new XMLHttpRequest();
    let userName = user;
    let player = null;

    request.open('GET', 'https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/' + userName + '/', false);
    request.setRequestHeader('X-API-KEY', '60028b4c249b4c59ab7c95411a196711');
    request.onload = function () {
        let responded = parseReturn(this);

        player = new Player(responded.displayName, responded.membershipId, responded.membershipType);
        console.log("Accessing player: " + player.displayName + " with id: " + player.membershipId);
    };
    request.send();
    return player;
}

function getProfile (membershipType, membershipId) {
    const requst = new XMLHttpRequest();
}



function getPlayerPlaytime(membershipType, membershipId, characterId) {
    const request = new XMLHttpRequest();
    request.open('GET', 'https://www.bungie.net/Platform/Destiny2/' + membershipType + '/Profile/' + membershipId + '/Character/' + characterId + '/?components=200', false);
    request.setRequestHeader('X-API-KEY', '60028b4c249b4c59ab7c95411a196711');

    request.onload = function () {
        let responded = parseReturn(this);

    };

    request.send();
}

function parseReturn(something) {
    const data = JSON.parse(something.response);
    return data.Response[0];
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