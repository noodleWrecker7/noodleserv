const wordList = { // is called in translator
    " ": " ", // important
    ".": ".",
    "one": "e", // english first then gingerise
    "ten": "tekk"
};

const gingList = _.invert(wordList); // to be called when translating from gingerese into english