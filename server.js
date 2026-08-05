const express = require("express");
const app = express();
const port = 3054;

app.use(express.static("public"));

app.listen(port, () => {
	console.log(`Comment Box Generator listening on port ${port}`);
	console.log(`Check it out at http://localhost:${port}`);
});
