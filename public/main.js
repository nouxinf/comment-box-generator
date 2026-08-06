// const textValue = () => document.getElementById("text").value;

const banner = (
	text,
	width = 40, // fallback to 40
	commentType = "python",
	isMultiline = false,
) => {
	if (text.length + 2 > width) {
		width = text.length + 6;
	}
	const langMap = new Map([
		["python", "#"],
		["c", "//"],
		["sql", "--"],
		["asm", ";"],
	]);
	const commentChar = langMap.get(commentType);
	const outerLine = `${commentChar} ` + "=".repeat(width - 2);
	const innerSpace = width - 4;

	const paddedText = ` ${text} `
		.padStart(Math.floor((innerSpace + text.length + 2) / 2), " ")
		.padEnd(innerSpace, " ");

	const middleLine = `${commentChar} =${paddedText}=`;
	return `${outerLine}\n${middleLine}\n${outerLine}`;
};

document.getElementById("mainform").addEventListener("submit", (event) => {
	event.preventDefault(); // this prevents pressing submit from refreshing the page
	const data = new FormData(document.getElementById("mainform"));
	console.log(data);
	document.getElementById("output").value = banner(
		data.get("text"),
		data.get("minwidth"),
		data.get("commenttype"),
		data.get("ismultiline") === "yes",
	);
});
