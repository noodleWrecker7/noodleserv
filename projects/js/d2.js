var manifestDict;
window.onload = function(){
    const request = new XMLHttpRequest();
    request.open('GET', '../Manifesto/Manifests.json', false);
    request.onload = function () {
        const data = JSON.parse(this.response);
        console.log(data);
        manifestDict = data;
    };
    request.send();
};

class Player {

    constructor(displayName, membershipId, membershipType, test) {
        this.displayName = displayName;
        this.membershipId = membershipId;
        this.membershipType = membershipType;

        this.profile = { // to show the general structure of what the api returns
            "data": {
                "userInfo": {
                    "membershipType": null,
                    "membershipId": null,
                    "displayName": null
                },
                "dateLastPlayed": null,
                "versionsOwned": null,
                "characterIds": [
                    null,
                    null,
                    null
                ]
            },
            "privacy": null
        };

        this.characters = [ // for reference
            {
                "data": {
                    "membershipId": "4611686018472171022",
                    "membershipType": 4,
                    "characterId": "2305843009403496894",
                    "dateLastPlayed": "2018-12-09T15:28:21Z",
                    "minutesPlayedThisSession": "42",
                    "minutesPlayedTotal": "10209",
                    "light": 583,
                    "stats": {
                        "392767087": 6,
                        "1935470627": 583,
                        "1943323491": 5,
                        "2996146975": 2
                    },
                    "raceHash": 3887404748,
                    "genderHash": 3111576190,
                    "classHash": 3655393761,
                    "raceType": 0,
                    "classType": 0,
                    "genderType": 0,
                    "emblemPath": "/common/destiny2_content/icons/35756d2b2ee119e1ef1b08954fa336dd.jpg",
                    "emblemBackgroundPath": "/common/destiny2_content/icons/807f54888b7d5e6ccc4386a587a366c0.jpg",
                    "emblemHash": 2939572586,
                    "emblemColor": {
                        "red": 26,
                        "green": 7,
                        "blue": 3,
                        "alpha": 255
                    },
                    "levelProgression": {
                        "progressionHash": 1716568313,
                        "dailyProgress": 0,
                        "dailyLimit": 0,
                        "weeklyProgress": 0,
                        "weeklyLimit": 0,
                        "currentProgress": 482000,
                        "level": 50,
                        "levelCap": 50,
                        "stepIndex": 50,
                        "progressToNextLevel": 0,
                        "nextLevelAt": 0
                    },
                    "baseCharacterLevel": 50,
                    "percentToNextLevel": 0
                },
                "privacy": 1
            } // two more
        ]
    }
}

class Endpoints { // stores funcs for creating url requests

    constructor(root) {
        this.root = root;
    }

    getProfile(membershipType, membershipId){
        return this.root + '/Destiny2/' + membershipType + '/Profile/' + membershipId + '/?components=100';
    }

    getCharacter(membershipType, membershipId, characterId) {
        return this.root + '/Destiny2/' + membershipType + '/Profile/' + membershipId + '/Character/' + characterId + '/?components=200';
    }

    getCharacterProgressions(membershipType, membershipId, characterId) {
        return this.root + '/Destiny2/' + membershipType + '/Profile/' + membershipId + '/Character/' + characterId + '/?components=202';
    }

}


function refreshAll(form) {
    let e = new Endpoints('https://www.bungie.net/Platform');
    let userName = htmlEscape(form.user.value); // gets user name put in top field
    // call API
    let player = getUser(userName);
    document.getElementById("playerName").innerText = player.displayName;

    let url_getProfile = e.getProfile(player.membershipType, player.membershipId);
    player.profile = callEndpoint(url_getProfile).profile;
    document.getElementById("playerName").innerText = player.profile.data.userInfo.displayName;

    player.characters = []; // resetting list of characters to avoid more than three being added
    player.characterProgressions = [];
    player.profile.data.characterIds.forEach(characterId => {
        let url_getCharacter = e.getCharacter(player.membershipType, player.membershipId, characterId);
        player.characters.push(callEndpoint(url_getCharacter).character);

        let url_getCharacterProgressions = e.getCharacterProgressions(player.membershipType, player.membershipId, characterId);
        player.characterProgressions.push(callEndpoint(url_getCharacterProgressions).progressions);
    });



    let totalMinutes = 0; // this loop adds the minutes played on each character to total
    manifest.DestinyClassDefinition = getManifest("DestinyClassDefinition");
    manifest.DestinyRaceDefintion = getManifest("DestinyRaceDefinition");
    manifest.DestinyGenderDefintion = getManifest("DestinyGenderDefinition");
    manifest.DestinyStatDefinition = getManifest("DestinyStatDefinition");

    for (let i = 0; i < 3; i++) { // through each character
        totalMinutes += parseInt(player.characters[i].data.minutesPlayedTotal); // total minutes played

        document.getElementById(i+"-emblem").src="https://bungie.net"+player.characters[i].data.emblemPath; // sets emblem

        document.getElementById(i+"-char-class").innerText = "Class: " + manifest.DestinyClassDefinition[player.characters[i].data.classHash].displayProperties.name;
        document.getElementById(i+"-char-race").innerText = "Race: " + manifest.DestinyRaceDefintion[player.characters[i].data.raceHash].displayProperties.name;
        document.getElementById(i+"-char-gender").innerText = "Gender: " + manifest.DestinyGenderDefintion[player.characters[i].data.genderHash].displayProperties.name;

        //document.getElementById(i+"-char-light").innerText = "Light: " + player.characters[i].data.light;
        document.getElementById(i+"-char-level").innerText = "Level: " + player.characters[i].data.levelProgression.level;
        document.getElementById(i+"-char-legend").innerText = "Legend: " + player.characterProgressions[i].data.progressions["2030054750"].level;

        Object.keys(player.characters[i].data.stats).forEach(statHash => {
            let hashName = manifest.DestinyStatDefinition[statHash].displayProperties.name;
            console.log(statHash);
            console.log(hashName);
            document.getElementById(i+"-char-"+hashName.toLowerCase()).innerText = hashName + ": " + player.characters[i].data.stats[statHash];
        });

        /*player.characters[i].data.stats.forEach(statHash => {
            let hashName = manifest.DestinyStatDefinition[statHash].displayProperties.name;
            document.getElementById(i+"-char-"+hashName.toLowerCase()).innerText = hashName + ": " + player.characters[i].data.stats[statHash];
        });*/

    }

    document.getElementById("total-hours").innerHTML = Math.floor(totalMinutes / 60).toString();
    //getPlayerPlaytime(player.membershipId);

    // reset values

}


function getUser(userName) {
    let player = null;

    const request = new XMLHttpRequest();
    request.open('GET', 'https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/' + userName + '/', false);
    request.setRequestHeader('X-API-KEY', '60028b4c249b4c59ab7c95411a196711');

    request.onload = function () {
        let responded = parseReturn(this);

        player = new Player(responded[0].displayName, responded[0].membershipId, responded[0].membershipType);
        console.log("Accessing player: " + player.displayName + " with id: " + player.membershipId);
    };
    request.send();
    return player;
}



function callEndpoint(url) {
    const req = new XMLHttpRequest();
    req.open('GET', url, false);
    req.setRequestHeader('X-API-KEY', '60028b4c249b4c59ab7c95411a196711');
    let responded = null;
    req.onload = function () {
        responded = parseReturn(this);
    };
    req.send();

    return responded;
}

function parseReturn(something) {
    const data = JSON.parse(something.response);
    return data.Response;
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

let manifest = {};

function getManifest(manifest){
    const request = new XMLHttpRequest();
    request.open('GET', manifestDict[manifest], false);
    let responded;
    request.onload = function () {
        responded = JSON.parse(this.response);
    };
    request.send();

    return responded;
}