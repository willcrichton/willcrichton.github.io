

function getRandPath(){
    return paths[Math.ceil(Math.random() * pathsLen)];
}

function getRandChar(){
    return String.fromCharCode(97 + Math.random() * 26)
}

function getRandWord(){
    return words[Math.ceil(Math.random() * wordsLen)];
}
function dispWord(id){
    id.innerHTML = getRandWord();
}

//getRow, getCol, toIndex, isValidCoord are specific for 4x4 array

//returns true if item is in given array
function isIn(array, item){
    for(var i = 0; i < array.length; i++){
	if (array[i] === item){
	    return true;
	}
    }
    return false;
}

//returns a new array which is the old array plus the item added on 
function arrayCopyAppend(oldArray, item){
    var newArray = new Array(oldArray.length + 1);
    for (var i = 0; i < oldArray.length; i++){
	newArray[i] = oldArray[i];
    }
    newArray[oldArray.length] = item;
    return newArray;
}

function printArray(array){
    for (var i = 0; i < array.length; i++){
	console.log(array[i]);
    }
}
//displays error message regarding user input
function msg(word, str){
    document.getElementById('disp').innerHTML = "The word " + word + " " + str;
}

var Board = {
    //returns 16 length array which dictates the letters shown on the 4x4 board
    setLetterArray: function (path,word){
	var array = new Array(this.size);
	for(var i = 0; i < this.size; i++) {
	    array[i] = "";
	}
	for(var i = 0; i < 7; i++){
	    array[path[i]] = word[i];
	}
	for(var i = 0; i < this.size; i++) {
	    if(array[i] ==""){
		array[i] = getRandChar();
	    }
	}
        return array;
    },

    init: function(){
	this.height = 4;
	this.width = 4;
	this.size = this.width * this.height;
	this.word = getRandWord();
	this.path = getRandPath();
	this.letterArray = this.setLetterArray(this.path, this.word);
    },

    getCol: function(index){
	return index % this.width;
    },

    getRow: function (index){
	return Math.floor(index/this.height);
    },

    toIndex: function (row,col){
	return row * this.width + col;
    },

    isValidCoord: function (row,col){
	return (row >= 0 && row < this.width && col >= 0 && col < this.height);
    },

    //return an array of vertices which are adjacent to the node at (row,col)
    getAdjNodes: function (index){
	var row = this.getRow(index);
	var col = this.getCol(index);
	var array = new Array(0);

	//check above neighbors
	for(var i = 0; i < 3; i ++){
	    if (this.isValidCoord(row - 1, col - 1 + i)){
		array[array.length] = this.toIndex(row - 1, col - 1 + i);
	    }
	}

	//check left neighbor
	if (this.isValidCoord(row , col - 1)){
	    array[array.length] = this.toIndex(row, col - 1);
	}
	//check right neighbor
	if (this.isValidCoord(row, col + 1)){
	    array[array.length] = this.toIndex(row, col + 1);
	}
	//check below neighbors
	for(var i = 0; i < 3; i ++){
	    if (this.isValidCoord(row + 1, col - 1 + i)){
		array[array.length] = this.toIndex(row + 1, col - 1 + i);
	    }
	}
	return array;
    },

    //makes div for the board and fills board with letters 
    makeBoard: function(){
	var $box = $('<div id= "box"></div>');
	$('body').append($box);
	for(var i = 0; i < 16; i++) {
	    var num = new Number(i);
	    var $div = $('<div class = "board"></div>');
	    var $char = $('<p class = "boardtext">' + this.letterArray[i] + '</p>');
	    $div.append($char);
	    $box.append($div);
	    var x = 100* this.getCol(i);
	    var y = 100* this.getRow(i);
	    $div.css({ left: x, top: y
			});
	}
    },
    //returns an array of vertices whose value is the given letter
    //if letter is not in the letter array, then the empty array is returned
    findLetter: function(letter){
	var res = new Array(0);
	for (var i = 0; i < this.size; i++){
	    if (this.letterArray[i] == letter){
		res[res.length] = i;
	    }
	}
	return res;
    },

    getAdjLetter: function(index){
	var neighbors = this.getAdjNodes(index);
	var res = new Array(neighbors.length);

	for (var i = 0; i < neighbors.length; i++){
	    res[i] = this.letterArray[neighbors[i]];
	}
	return res;
    },

    //begin helper functions for inBoard
    getUnvisitedAdjNodes: function (index, visitedIndices){
	var neighbors = this.getAdjNodes(index);
	var unvisited = new Array(0);
	for (var i = 0; i < neighbors.length; i++){
	    if (!isIn(visitedIndices,neighbors[i])){
		unvisited[unvisited.length] = neighbors[i];
	    }
	}
	return unvisited;
    },
    
    getUnvisitedAdjLetters: function (index, visitedIndices){
	var unvisitedIndices = this.getUnvisitedAdjNodes(index,visitedIndices);
	var unvisitedLetters = new Array(unvisitedIndices.length);
	for (var i = 0; i < unvisitedIndices.length; i++){
	    unvisitedLetters[i] = this.letterArray[unvisitedIndices[i]];
	}
	return unvisitedLetters;
    },
    
    canFormWord: function(index, word, visitedIndices){
	if (word.length === 1){
	    if (isIn(this.getUnvisitedAdjLetters(index,visitedIndices),word)){
		return true;
	    }
	    else return false;
	}
	else{
	    var adjNodes = this.getUnvisitedAdjNodes(index, visitedIndices);
	    for (var i = 0; i < adjNodes.length; i++){
		if (this.letterArray[adjNodes[i]] === word[0]){
		    if (this.canFormWord(adjNodes[i], 
					 word.slice(1,word.length),
					 arrayCopyAppend(visitedIndices,
							 adjNodes[i]))){
			return true;
		    }
		}
 	    }
	    return false;
	}
    },
    //end helper functions for inBoard

    inBoard: function(word) {
	var startNodes = this.findLetter(word[0]);
	if (startNodes.length === 0) return false;
	else{
	    var visited = new Array(1);
	    for (var i = 0; i < startNodes.length; i++){
		visited[0] = startNodes[0];
		if (this.canFormWord(startNodes[0],word.slice(1,word.length),
				     visited)){
			return true;
		}
	    }
	    return false;
	}
    },
    //checks to see if word submitted is valid: has length 7, is a word, 
    //and can be formed in the board
    validateWord: function(input){
	if (input.length != 7){
	    msg(input,"is not the correct length");
	    return false;
	} 
	if (!this.inBoard(input)){
	    msg(input,"is not a valid word");
	    return false;
	}
	if (input == Board.word){
	    document.getElementById('disp').innerHTML = "Yay! You won!";
	    return true;
	} 
	
	else{
	    if(dict[input]){
		document.getElementById('disp').innerHTML = "Yay! You won!";
		return true;
	    }
	    else{
		msg(input, "is not a word");
		return false;
	    }
	}
    }
}
    



var Game = {
    start: function(){
	document.getElementById('startButton').style.display = 'none';
	document.getElementById('title').style.display = 'none';
	document.getElementById('dialogue').style.display = 'none';
	document.getElementById('enterWord').style.display = 'block';
	document.getElementById('giveUp').style.display = 'block';
	document.getElementById('disp').style.display = 'block';
	Board.init();
	Board.makeBoard();
    },
    checkInput: function(input){
	if (event.keyCode == 13){
	    if (Board.validateWord(input)){
		document.getElementById('enterWord').style.display = 'none';
		document.getElementById('giveUp').style.display = 'none';
		document.getElementById('box').style.display = 'none';
	    }
	}
	else return false;
    },

    gaveUp: function(){
	document.getElementById('enterWord').style.display = 'none';
	document.getElementById('giveUp').style.display = 'none';
	document.getElementById('disp').innerHTML ="The word was "  + Board.word;
    }
}


