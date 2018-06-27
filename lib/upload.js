const fs = require("fs");

const fn = function upload(file) {
	let ipfs = require('ipfs-api')({host: "localhost", port: 5001, protocol: "http"});
	let cont = fs.readFileSync("./testfile.txt");
	cont = new Buffer(cont);
	ipfs.add(cont, function(err, files) {
		if(err) throw err;
		return files[0].hash ;
		// console.log(files[0].hash);
		// ipfs.files.cat(files[0].hash, function(err, file) {
			// if(err) throw err;
			// console.log(file.toString());
		// });
	});
}

module.exports.upload = fn;
