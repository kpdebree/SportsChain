const express = require('express');
const app = express();
import fetch from '/lib/fetch';
var fs = require('fs');
app.set('view engine', 'pug');
const PORT = 3000;

var locations = {
	PingPongTable: 'QmTQqczEPUzyaArjSzpLqH2EGQ2y8Mzc3AY9wR5u1XsgjL'
};
var people = {
	Luigi: null,
	Patrick: null,
	Kevin: null
};

app.get('/', (req, res) => {
	let response = JSON.stringify(locations);
	response += '\n';
	response += JSON.stringify(people);
	res.render('index', { data: response });
})

// Starting a game
app.get('/startgame', (req, res) => {
	locationReference = req.query.location;
	playerReference = req.query.player;
	var LOCATION;
	var PLAYER;
	/**
	* Will check if there are any null references, and if so generate initial ones. Or else fetch those references
	**/
	if (locations[locationReference] === null) {
		// There should be a method for adding a new location. Let's just assume there is one location for now.
		console.log("This is never going to happen");
	} else {
		LOCATION = fetch(locations[locationReference]);
	}
	if (people[playerReference] === null) {
		fs.writeFile('tx.json', 
		`{name:${playerReference},ELO:1600,numGames:0,reports:0}`, 
		function(err, file) {
			if (err) throw err;
			console.log("Saved a new player file");
		});
		// Push a new block with ELO = 1600, NumGames = 0, Reports = 0
		// Set people dictionary reference to this new blokc
	} else {
		PLAYER = fetch(people[playerReference]);
	}
	/**
	* Check the state of the location to determine what action to take
	**/
	if (LOCATION.status === "gaming") {
		// If the block is a GAME block, send back a rejection
		res.send("Rejection. A game is already being played.")
	} else if (LOCATION.status === "done" || LOCATION.status === "open") {
		// If the block is a DONE block, this is a new game so start it
		// Upload Location and Reference to Last Block into IPFS
		fs.writeFile('tx.json', 
		`{prevBlock:${locations[locationReference]},status:waiting, location:${locationReference}, player:${playerReference}}`, 
		function(err, file) {
			if (err) throw err;
			console.log("Created a new waiting game");
		});
		let hash = upload('tx.json');
		people[playerReference] = hash;
		location[locationReference] = hash;
		res.send("Open location. Starting a new game.")
	} else if (LOCATION.status === "waiting") {
		// If there is another player in this location, we want to append our info and start the game
		// Upload Location and Player into IPFS
		fs.writeFile('tx.json', 
		`{prevBlock:${locations[locationReference]},status:gaming, location:${locationReference}, player:${LOCATION.player}, player2:${playerReference}}`, 
		function(err, file) {
			if (err) throw err;
			console.log("Started a new game");
		});
		let hash = upload('tx.json');
		people[playerReference] = hash;
		people[LOCATION.player] = hash;
		location[locationReference] = hash;
		res.send("You have joined a game with the other player. Enjoy!")
	}
});

// Ending a game
app.get('/endgame', (req, res) => {
	location = req.query.location;
	winner = req.query.winner;
	blockReference = req.query.blockReference;
  	playerReference = req.query.playerReference;
	// Check the case by seeing if location references matches the player's block reference
	/**
		* CASE 1 : First player to report
		**/
	// Upload result, player, and block to IPFS
	// Update Location reference
	// Update Player reference
	/**
		* CASE 2: Second player to report
		**/
	// Do the players disagree?
  if (winner !== blockReference.winner) {
    // Generate block with DONE tag
		// playerReference reports++
		// blockReference.playerReference.reports++
		// Set Location reference to the returned Tx
		// Set Player reference to the return Tx
	}
  // Do the players agree?
  else {
		// Generate block with DONE tag
		// playerReference num_games++
		// blockReference.playerReference num_games++
		// calculate ELO for playerReference
		// calculate ELO for blockReference.playerReference
		// Set Location reference to the return Tx
		// Set Player reference to the return Tx
	}
	res.render('index', { data: response });
});

app.listen(PORT, () => console.log(`Sportschain app listening on port ${PORT}`));
