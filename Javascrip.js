var board = {
    boardSize: 0,
	numShips: 0,
	shipLength: 1,
	shipsSunk: 0,
	ships: [],

    Board: function() {
        var alphabet = "ABCDEFGHIJKLM";
		var board = document.getElementById("Table");
		for (var i = 0; i < this.boardSize; i++) {
			var row = board.insertRow(i);
			for (var j = 0; j < this.boardSize; j++) {
				var col = row.insertCell(j);
				col.setAttribute("id", i+""+j)
			}
			var col = row.insertCell(0);
			col.setAttribute("class", "axis")
			col.innerHTML = alphabet.charAt(i)
		}
		var row = board.insertRow(this.boardSize);
		for (var j = 0; j < this.boardSize; j++) {
			var col = row.insertCell(j);
			col.setAttribute("class", "axis")
			axis_bottom = "0" + "" + j
			if (axis_bottom.length === 3) {
				col.innerHTML = axis_bottom.substring(1);
			} else {
				col.innerHTML = axis_bottom;
			}

			
		}
		var col = row.insertCell(0);
		col.setAttribute("class", "axis");
    },

    resetBoard: function() {
        var board = document.getElementById("Table");
        for (var i = 0; i <= this.boardSize; i++) {
            board.deleteRow(0);
        }
        this.Board();
        this.setupShips();
        this.generateShipLocations();
		view.updateRemainingShips();
    },

	setupShips: function() {
		this.shipsSunk = 0;
		this.ships = [];
		for (var i = 0; i < this.numShips; i++) {
			this.ships.push({locations:0, hits:""});
		}
	},

	generateShipLocations: function() {
		var locations;
		for (var i = 0; i < this.numShips; i++) {
			do {
				locations = this.generateShip();
				console.log(locations)
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
	},

	generateShip: function() {
		var row, col;

		row = Math.floor(Math.random() * this.boardSize);
		col = Math.floor(Math.random() * this.boardSize);

		var newShipLocations = 0;
		newShipLocations = row + "" + col;

		return newShipLocations;
	},

	collision: function(locations) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			if (ship.locations === locations) {
				return true;
			}
		}
		return false;
	},

	fire: function(guess) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			console.log(guess)
			if (ship.locations === guess && ship.hits === "") {
				ship.hits = "hit";
				view.displayHit(guess);
				view.displayMessage("HIT!");

				if (this.isSunk(ship)) {
					view.displayMessage("You sank my battleship!");
					this.shipsSunk++;
					referee.addScore();
					view.updateRemainingShips();
					referee.endSet();
					referee.endGame();
				}
				return true;
			} else if (ship.locations === guess && ship.hits === "hit") {
				view.displayMessage("You've hit that one, take the other one");
				return false;
			}
		}
		view.displayMiss(guess);
		console.log("mehh")
		view.displayMessage("You missed.");
		referee.takeTurns();
		return false;
	},

	isSunk: function(ship) {
		if (ship.hits !== "hit") {
			return false;
		}
	    return true;
	}
	
}; 


var view = {
	displayMessage: function(msg) {
		var messageArea = document.getElementById("messageArea");
		messageArea.innerHTML = msg;
	},

	displayHit: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "hit");
	},

	displayMiss: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "miss");
	},

	updateTurn: function() {
		document.getElementById("player_turn").innerHTML = referee.cur_player + 1;
	},

	updateScore: function() {
		document.getElementById("score_player_1").innerHTML = referee.score[0];
		document.getElementById("score_player_2").innerHTML = referee.score[1];
	},

	updateSets: function() {
		document.getElementById("cur_set").innerHTML = referee.cur_set;
		document.getElementById("player_1_win").innerHTML = referee.win_set[0];
		document.getElementById("player_2_win").innerHTML = referee.win_set[1];
	},

	updateRemainingShips: function() {
		document.getElementById("alive_ship").innerHTML = board.numShips - board.shipsSunk;
		document.getElementById("dead_ship").innerHTML = board.shipsSunk;
	} 


}; 

var controller = {
	processGuess: function(guess) {
		var location = parseGuess(guess);
		if (location) {
			var hit = board.fire(location);
			}
		}
}


var referee = {
	score: [0, 0],
	sets: 1,
	cur_set: 1,
	cur_player: 0,
	win_set: [0, 0],

	takeTurns: function() {
		this.cur_player = (this.cur_player + 1) % 2;
		view.updateTurn();
		console.log("ganti")
	},

	addScore: function() {
		this.score[this.cur_player] += (4 - board.shipLength) * 10;
		view.updateScore();
	},

	endSet: function() {
		if ((this.score[0] > ((4 - board.shipLength) * 10 * board.numShips) / 2) || (this.score[1] > ((4 - board.shipLength) * 10 * board.numShips) / 2)) {
			view.displayMessage("Player " + (referee.cur_player + 1) + " win!")
			board.resetBoard();
			this.score = [0, 0];
			this.cur_set++;
			this.win_set[this.cur_player]++;
			view.updateScore();
			view.updateSets();
		}
	},

	endGame: function() {
		if (this.win_set[this.cur_player] > (referee.sets / 2)) {
		model.resetBoard();
		this.score = [0, 0];
		this.cur_set = 1;
		this.win_set = [0, 0];
		view.updateScore();
		view.updateSets();
		view.displayMessage("Player " + (referee.cur_player + 1) + " win the game!!")
		this.cur_player = 0;
		}
	}
}

// helper function to parse a guess from the user

function parseGuess(guess) {
	var alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"];

	if (guess === null || guess.length !== 2) {
		alert("Oops, please enter a letter and a number on the board.");
	} else {
		var firstChar = guess.charAt(0);
		var row = alphabet.indexOf(firstChar);
		var column = guess.charAt(1);
		
		if (isNaN(row) || isNaN(column)) {
			alert("Oops, that isn't on the board.");
		} else if (row < 0 || row >= board.boardSize ||
		           column < 0 || column >= board.boardSize) {
			alert("Oops, that's off the board!");
		} else {
			return row + column;
		}
	}
	return null;
}


// event handlers

function handleFireButton() {
	var guessInput = document.getElementById("guessInput");
	var guess = guessInput.value.toUpperCase();

	controller.processGuess(guess);

	guessInput.value = "";
}

function handleKeyPress(e) {
	var fireButton = document.getElementById("fireButton");

	// in IE9 and earlier, the event object doesn't get passed
	// to the event handler correctly, so we use window.event instead.
	e = e || window.event;

	if (e.keyCode === 13) {
		fireButton.click();
		return false;
	}
}

function handleSubmit() {
	board.boardSize = parseInt(document.getElementById("boardSize").value);
	referee.sets = parseInt(document.getElementById("setAmount").value);
	board.numShips = parseInt(document.getElementById("shipAmount").value);
	console.log(board.boardSize)
	board.Board();
	board.setupShips();
	board.generateShipLocations();
	view.updateRemainingShips();
}


// init - called when the page has completed loading
window.onload = init;

function init() {
	// Fire! button onclick handler
	var fireButton = document.getElementById("fireButton");
	fireButton.onclick = handleFireButton;

	// handle "return" key press
	var guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress;

	var submit = document.getElementById("submit");
	submit.onclick = handleSubmit;

	
}





