/*
 * Copyright (c) 2020.
 * Developed by Adam Hodgkinson
 * Last modified 3/4/4 19:45
 *
 * Everything on this page, and other pages on the website, is subject to the copyright of Adam Hodgkinson, it may be freely used, copied, distributed and/or modified, however, full credit must be given
 * to me and any derived works should be released under the same license. I am not held liable for any claim, this software is provided as-is and without any warranty.
 *
 * I do not own any of the following content and is used under their respective licenses:
 *     Fontawesome
 *     Photonstorm's phaser.js
 */
const LOCAL_ACCESS_TOKEN_KEY = "controlify-spotify-access-token";
const LOCAL_ACCESS_TOKEN_EXPIRY_KEY = "controlify-spotify-access-expiry-time";
let expiryTimer;
var userID;

document.addEventListener('DOMContentLoaded', () => {

    if (window.location.hash) {
        const hash = parseHash(window.location.hash);
        if (hash['access_token'] && hash['expires_in']) {
            if (hash['access_token'] == getCookie(LOCAL_ACCESS_TOKEN_KEY)) {
                if (getCookie(LOCAL_ACCESS_TOKEN_EXPIRY_KEY) > Date.now()) {
                    directToLogin();
                }
            } else {
                setCookie(LOCAL_ACCESS_TOKEN_KEY, hash['access_token'], 0.2);
                setCookie(LOCAL_ACCESS_TOKEN_EXPIRY_KEY, Date.now() + 990 * parseInt(hash['expires_in']), 0.2);
            }

            makeCall("GET", "https://api.spotify.com/v1/me").then(value => {
                let data = JSON.parse(value);
                userID = data.id;
            })

            //copyLikedSongsToPlaylist();

            // re-login when needed
            expiryTimer = setTimeout(function () {
                directToLogin();
            }, 990 * parseInt(hash['expires_in']))
        }
    } else {
        directToLogin();
    }

})

async function copyLikedSongsToPlaylist() {
    document.getElementById("finish-text").innerText = "Copying..."
    let playlistId;

    // finds the playlist to add them too
    let nextUrl = "https://api.spotify.com/v1/me/playlists"
    while (nextUrl) {
        await makeCall("GET", nextUrl).then(value => {
            let data = JSON.parse(value);
            nextUrl = data.next;
            console.log(data)
            for (let i = 0; i < data.items.length; i++) {
                if (data.items[i].name == "My Liked Songs" && data.items[i].description == "Playlist of Liked Songs, Powered by Adam Hodgkinson at https:&#x2F;&#x2F;noodlewrecker.me&#x2F;projects&#x2F;spotifyJobs") {
                    playlistId = data.items[i].id;
                    nextUrl = false;
                    break;
                }
            }
        })
    }
    // if no playlist exists it creates one
    if (!playlistId) {
        await makeCall("POST", "https://api.spotify.com/v1/users/" + userID + "/playlists", JSON.stringify({
            name: "My Liked Songs",
            description: "Playlist of Liked Songs, Powered by Adam Hodgkinson at https://noodlewrecker.me/projects/spotifyJobs"
        }), [{name: "Content-Type", value: "application/json"}]).then(value => {
            let data = JSON.parse(value);
            playlistId = data.id;
        });
    }

    // removed all tracks in playlist
    await makeCall("PUT", "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks", JSON.stringify({uris: []}), [{
        name: "Content-Type",
        value: "application/json"
    }]);

    nextUrl = "https://api.spotify.com/v1/me/tracks?limit=50"
    while (nextUrl) {
        //if(timeout > 30) break;
        await makeCall("GET", nextUrl).then(value => {
            let data = JSON.parse(value);
            nextUrl = data.next;
            let likedTrackIds = [];
            for (let i = 0; i < data.items.length; i++) {
                likedTrackIds.push(data.items[i].track.uri);
            }
            makeCall("POST", "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks", JSON.stringify({uris: likedTrackIds}), [{
                name: "Content-Type",
                value: "application/json"
            }])
        })
    }

    document.getElementById("finish-text").innerText = "Your liked songs have been copied to a playlist 'My Liked Songs'"
    document.getElementById("copyButton").outerHTML = "<button id=\"copyButton\" style=\"font-size: xx-large\">Copy Liked songs to a playlist</button>";
}

function directToLogin() {
    fetch('spotifyRedirectURI')// gets uri from file to redirect to
        .then(e => e.json())
        .then(data => {
            window.location.href = data.redirectUri; // sends to spotify auth uri
        }).catch(error => {
        alert("Failed to begin authentication with Spotify");
        console.log(error);
    });
}

function parseHash(hash) {
    return hash
        .substring(1)
        .split('&')
        .reduce(function (initial, item) {
            if (item) {
                var parts = item.split('=');
                initial[parts[0]] = decodeURIComponent(parts[1]);
            }
            return initial;
        }, {});
}

async function makeCall(method, url, body, headers) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open(method, url);
        req.setRequestHeader("Authorization", "Bearer " + getCookie(LOCAL_ACCESS_TOKEN_KEY));
        if (headers) {
            for (let i = 0; i < headers.length; i++) {
                req.setRequestHeader(headers[i].name, headers[i].value);
            }
        }
        req.onload = () => resolve(req.responseText);
        req.onerror = () => reject(req.statusText);
        req.send(body);
    })
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/projects/spotifyJobs";
}

function getCookie(a) {
    const b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}