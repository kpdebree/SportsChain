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

function generateBlock(
	status,
	location=null,
	player1=null,
	player2=null,
	winner=null
) {
	// you can trade STORAGE for COMPUTE by saving a hash of the previous block
	return `{
	status: ${status},
	location: ${location},	
	player1: ${player1},	
	player2: ${player2},	
	winner: ${winner}
	}`
	// player : { name, elo, numGames, reports}
}

app.get('/getinfo', (req, res) => {
	const playerReference = req.query.player;
	if (Object.keys(people).indexOf(playerReference) === -1) { // For a new account
		let player = {
			name: playerReference,
			elo: 1600,
			numGames: 0,
			reports: 0
		}
		res.send(JSON.stringify(player));
	} else { // Otherwise return account info from reference to most recent block
		let block = fetch(people[playerReference]);
		let player = (block.player1.name === playerReference) ? block.player1 : block.player2 ;
		res.send(JSON.stringify(player));
	}
});

// Starting a game
app.get('/startgame', (req, res) => {
	const locationReference = req.query.location;
	const playerReference = req.query.player;
	// For now we hardcode in our only location seed block. But there should be a method for generating one in the future
	let BLOCK = fetch(locations[locationReference]);
	/**
	* Check the state of BLOCK, aka game or location, to determine what action to take
	**/
	if (BLOCK.status === "gaming" || BLOCK.status === "endgame") {
		res.send("Rejection. A game is already being played.")
	} else if (BLOCK.status === "done" || BLOCK.status === "open") {
		fs.writeFile('tx.json', 
			generateBlock("waiting", location[locationReference], locationReference, playerReference),
			function(err, file) {
				if (err) throw err;
				console.log("Created a new waiting game");
			}
		);
		let hash = upload('tx.json');
		people[playerReference] = hash;
		location[locationReference] = hash;
		res.send("Open location. Starting a new game.")
	} else if (BLOCK.status === "waiting") {
		// If there is another player in this location, we want to append our info and start the game
		fs.writeFile('tx.json', 
			generateBlock("gaming", location[locationReference], locationReference, LOCATION.player1, playerReference),
			function(err, file) {
				if (err) throw err;
				console.log("Started a new game");
			}
		);
		let hash = upload('tx.json');
		people[playerReference] = hash;
		people[BLOCK.player1] = hash;
		location[locationReference] = hash;
		res.send("You have joined a game with the other player. Enjoy!")
	}
});

// Ending a game
app.get('/endgame', (req, res) => {
	const location = req.query.location;
	const winner = req.query.winner;
  	const playerReference = req.query.player;
	let BLOCK = fetch(locations[locationReference]);
	if (BLOCK.status === "gaming") {
		/** CASE 1: First player to report */
		fs.writeFile('tx.json', 
			generateBlock("endgame", location[locationReference], locationReference, BLOCK.player1, BLOCK.player2, winner),
			function(err, file) {
				if (err) throw err;
				console.log("Saved a new player file");
			}
		);
		let hash = upload('tx.json');
		people[playerReference] = hash;
		location[locationReference] = hash;
	} else if (BLOCK.status === "endgame") {
		/** CASE 2: Second player to report */
		if (winner !== BLOCK.winner) { // If there is disagreement among players
			let newPlayer1 = {...BLOCK.player1, reports: BLOCK.player1.reports + 1};
			let newPlayer2 = {...BLOCK.player2, reports: BLOCK.player2.reports + 1};
			fs.writeFile('tx.json', 
				generateBlock("done", location[locationReference], locationReference, newPlayer1, newPlayer2),				
				function(err, file) {
					if (err) throw err;
					console.log("Saved a new player file");
				}
			);
			let hash = upload('tx.json');
			location[locationReference] = hash;
			people[playerReference] = hash;
			people[BLOCK.playerReference] = hash;
		} else { // If there is agreement among players
			let p1ELO = BLOCK.player1.elo;
 			let p2ELO = BLOCK.player2.elo;
 			let Delta1 = (1 / (1 + Math.pow(10, ((p1ELO - p2ELO) / 400))));
 			let Delta2 = (1 / (1 + Math.pow(10, ((p2ELO - p1ELO) / 400))));
 			if (result === 'player1') {
				elo1 = Math.floor(p1ELO + 30 * (1 - Delta1));
				elo2 = Math.floor(p2ELO + 30 * (0 - Delta2));
 			} else {
				elo2 = Math.floor(p2ELO + 30 * (1 - Delta2));
				elo1 = Math.floor(p1ELO + 30 * (0 - Delta1));
 			}
			let newPlayer1 = {...BLOCK.player1, elo:elo1, numGames: BLOCK.player1.numGames + 1};
			let newPlayer2 = {...BLOCK.player2, elo:elo2, numGames: BLOCK.player2.numGames + 1};
			fs.writeFile('tx.json', 
				generateBlock("done", location[locationReference], locationReference, newPlayer1, newPlayer2),				
				function(err, file) {
					if (err) throw err;
					console.log("Saved a new player file");
				}
			);
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
