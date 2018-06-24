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
	const locationReference = req.query.location;
	const playerReference = req.query.player;
	let LOCATION;
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
		let hash = upload('tx.json');
		people[playerReference] = hash;
	}
	/**
	* Check the state of the location to determine what action to take
	**/
	if (LOCATION.status === "gaming" || LOCATION.status === "endgame") {
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
	const location = req.query.location;
	const winner = req.query.winner;
	const blockReference = req.query.blockReference;
  	const playerReference = req.query.playerReference;
	let LOCATION = fetch(locations[locationReference]);
	let BLOCK = fetch(locations[blockReference]);
	// let PLAYER = fetch(people[playerReference]);
	if (LOCATION.status === "gaming") {
		/** CASE 1: First player to report */
		// Upload result, player, and block to IPFS
		fs.writeFile('tx.json', 
			`{prevBlock:${blockReference}, player: ${playerReference}, winner: ${winner}, status: endgame}`, 
			function(err, file) {
				if (err) throw err;
				console.log("Saved a new player file");
			});
		let hash = upload('tx.json');
		people[playerReference] = hash;
		location[locationReference] = hash;
	} else if (LOCATION.status === "endgame") {
		/** CASE 2: Second player to report */
		// Do the players disagree?
		if (winner !== BLOCK.winner) {
			// playerReference reports++
			let playerOneReports = BLOCK.playerOneReports + 1;
			// blockReference.playerReference.reports++
			let playerTwoReports = BLOCK.playerTwoReports + 1;
			// Generate block with DONE tag and upload to IPFS
			fs.writeFile('tx.json', 
			`{prevBlock:${blockReference}, player: ${playerReference}, winner: ${winner}, status: DONE, playerOneReports: ${playerOneReports}, playerTwoReports: ${playerTwoReports}}`, 
			function(err, file) {
				if (err) throw err;
				console.log("Saved a new player file");
			});
			let hash = upload('tx.json');
			location[locationReference] = hash;
			people[playerReference] = hash;
			people[BLOCK.playerReference] = hash;
		}
		// Do the players agree?
		else {
			// players adjust number of games
			let playerOneGames = BLOCK.playerOneGames + 1;
			let playerTwoGames = BLOCK.playerTwoGames + 1;
			// players adjust ELO
			let p1ELO = BLOCK.playerOneElo;
 			let p2ELO = BLOCK.playerTwoElo;
 			let Delta1 = (1 / (1 + Math.pow(10, ((p1ELO - p2ELO) / 400))));
 			let Delta2 = (1 / (1 + Math.pow(10, ((p2ELO - p1ELO) / 400))));
 			if (result === 'win') {
				playerOneNewElo = Math.floor(p1ELO + 30 * (1 - Delta1));
				playerTwoNewElo = Math.floor(p2ELO + 30 * (0 - Delta2));;
 			} else {
				playerTwoNewElo = Math.floor(p2ELO + 30 * (1 - Delta2));;
				playerOneNewElo = Math.floor(p1ELO + 30 * (0 - Delta1));
 			}
			// Generate block with DONE tag and upload to IPFS
			fs.writeFile('tx.json', 
			`{prevBlock:${blockReference}, player: ${playerReference}, 
			winner: ${winner}, status: DONE, 
			playerOneGames: ${playerOneReports}, 
			playerTwoGames: ${playerTwoReports},
			playerOneElo: ${playerOneNewElo}, 
			playerTwoElo: ${playerTwoNewElo},
			}`, 
			function(err, file) {
				if (err) throw err;
				console.log("Saved a new player file");
			});
			let hash = upload('tx.json');
			location[locationReference] = hash;
			people[playerReference] = hash;
			people[BLOCK.playerReference] = hash;
		}
	} else {
		res.send("You cannot end a game that does not exist");
	}
});

app.listen(PORT, () => console.log(`Sportschain app listening on port ${PORT}`));
