window.onload = function () {
    console.log("Loading...");
    console.log("Translator has been initiated");
};

function string2Gin(form) {
    let string = form.engIn.value;
    let gingerString = "";
    const stringArray = string.split(" ");
    for (let i = 0; i < stringArray.length; i++) {
        let s = stringArray[i].toLowerCase();
        let w = word2Gin(s);
        if (w != null) {
            gingerString += w;
        } else {
            gingerString += s;
            console.log("could not translate word: " +s);
        }
        gingerString += " ";
    }
    document.getElementById("gingerIn").value = gingerString;
    return gingerString;
}

function string2Eng(form) {
    let string = form.ginIn.value;
    let englishString = "";
    const stringArray = string.split(" ");
    for (let i = 0; i < stringArray.length; i++) {
        let s = stringArray[i].toLowerCase();
        let w = word2Eng(s);
        if (w != null) {
            englishString += w;
        } else {
            englishString += s;
            console.log("could not translate word: " +s);
        }
        englishString += " ";
    }
    document.getElementById("englishIn").value = englishString;
    return englishString;
}

function word2Gin(english) {
    return wordList[english];
}

function word2Eng(ginger) {
    return gingList[ginger];
}


