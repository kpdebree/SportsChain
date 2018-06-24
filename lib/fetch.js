require('isomorphic-fetch');

const fn = async function (pathname) {
  // Pass hash in pathname
	console.log("called");
  const u = `http://localhost:5001/api/v0/cat?arg=${pathname}`
  //const u = `https://ipfs.io/ipfs/${pathname}`
	console.log("going to fetch");
  const res = await fetch(u)
	console.log("going to return");
  return res.json()
}

module.exports.fetch = fn;
