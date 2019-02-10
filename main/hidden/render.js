var parts = window.location.search.substr(1).split("&");
var $_GET = {};
for (var i = 0; i < parts.length; i++) {
    var temp = parts[i].split("=");
    $_GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
}

function insertSocialBar(url) {

    let topLevel = document.getElementById("socialBar");
    topLevel.className = "social-bar";
    let xReq = new XMLHttpRequest();
    xReq.open("GET", url);
    xReq.onload = function () {
        topLevel.innerHTML = this.response;
    };
    xReq.send();
}

function getProjectsList(url) {
    let xReq = new XMLHttpRequest();
    xReq.open("GET", url, false);
    let response = null;
    xReq.onload = function () {
        response = this.response;
    };
    xReq.send();
    return response;
}

let projectList;
let numOfProjects;
let pageNum;
let startEntry;
let pagesNeeded;
let currentPage;

function insertPagination() {
    x = pageNum - 1;
    let output = "";
    let backHTML = "<a href=\"?p=" + x + "\">&laquo;</a>";
    output += backHTML;
    if (pageNum < 3) {
        for (let i = 1; i <= 5; i++) {
            if (i == pageNum) {
                output += "<a class=\"selected\" \"href=\"?p=" + i + "\">" + i + "</a>";
            } else {
                output += "<a href=\"?p=" + i + "\">" + i + "</a>";
            }
        }
    } else {
        output += "<a href=\"?p=" + (pageNum - 2) + "\">" + (pageNum - 2) + "</a>" +
            "<a href=\"?p=" + (pageNum - 1) + "\">" + (pageNum - 1) + "</a>" +
            "<a class= \"selected\" href=\"?p=" + pageNum + "\">" + pageNum + "</a>" +
            "<a href=\"?p=" + (pageNum + 1) + "\">" + (pageNum + 1) + "</a>" +
            "<a href=\"?p=" + (pageNum + 2) + "\">" + (pageNum + 2) + "</a>";
    }
    x = pageNum + 1;
    let forwardHTML = "<a href=\"?p=" + x + "\">&raquo;</a>";
    output += forwardHTML;
    document.getElementById("pagination-top").innerHTML = output;
    document.getElementById("pagination-bottom").innerHTML = output;
}

function loadPages(url) {
    let topLevel = document.getElementById("grid");
    projectList = JSON.parse(getProjectsList(url));
    validatePageNum();
    pageNum = $_GET['p'];
    startEntry = (pageNum - 1) * 8;
    let output = "";
    output += "<div class=\"row\">";
    for (let i = 0; i < 8; i++) {
        if (i == 4) {
            output += "</div> <div class=\"row\">";
        }
        let item = projectList[startEntry + i];
        output += "<a href=\"" + item.link + "\" class=\"item\">" +
            "<div class=\"picture\">" +
            "<img alt=\"Image of the game\" src=\"img/" + item.img + "\">" +
            "</div>" +
            " <h3 class=\"item-head\">" + item.name + "</h3>" +
            "<p class=\"item-text\">" + item.blurb + "</p>" +
            "<p class=\"date\">" + item.date + "</p>" +
            "</a>";
    }
    output += "</div>";

    topLevel.innerHTML = output;
}

function validatePageNum() {
    numOfProjects = projectList.length;
    pagesNeeded = Math.ceil(numOfProjects / 8);
    currentPage = $_GET['p'];
    if (currentPage > pagesNeeded) {
        goPage(pagesNeeded);
    }
    if (currentPage < 1) {
        goPage(1);
    }
    if(currentPage == null || currentPage == "undefined") {
        goPage(1);
    }
}

function goPage(n) {
    window.location.replace(window.location.pathname + "?p=" + n);
}