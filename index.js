const express = require('express');
const app = express();
app.set('view engine', 'pug');
const PORT = 3000;

var locations = {
	PingPongTable: null
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
app.post('/startgame', (req, res) => {
	locationReference = req.params.location;
	playerReference = req.params.player;
	/**
		* Will check if there are any null references, and if so generate initial ones
		**/
	if (locations[locationReference] === null) {
		// There should be a method for adding a new location
	}
	if (people[playerReference] === null) {
		// Push a new block with ELO = 1600, NumGames = 0, Reports = 0
		// Set people dictionary reference to this new blokc
	}
	/**
		* Check if there is already a game going on in this location
		**/
  // If the block is a GAME block, send back a rejection
	/**
		* Check if the location is available, to start a new game
		**/
	// If the block is a DONE block, this is a new game so start it
	// Upload Location and Reference to Last Block into IPFS
	// Set Location reference to the returned Tx
	// Set Player reference to the returned Tx
	// Set Other Player reference to the returned Tx
	/**
		* Check if the location is waiting for another player,  
		**/
	// If there is not a player in this location, do this
	// Upload Location and Player into IPFS
	// Set Location reference to the returned Tx
	// Set Player reference to the returned Tx
	res.render('index', { data: response });
});

// Ending a game
app.post('/endgame', (req, res) => {
	location = req.params.location;
	winner = req.params.winner;
	blockReference = req.params.blockReference;
  playerReference = req.params.playerReference;
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
