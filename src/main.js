const banner = (
	text,
	width = 40, // fallback to 40
	commentType = "python",
	isMultiline = false,
	boxSymbol = "=",
) => {
	if (text.length + 6 > width) {
		width = text.length + 6;
	}
	const langMap = new Map([
		["python", "#"],
		["c", "//"],
		["sql", "--"],
		["asm", ";"],
	]);
	const startingMultilineLangMap = new Map([
		["html", "<!--"],
		["c", "/*"],
		["asm", "/*"],
		["sql", "/*"],
		["python", `"""`],
	]);
	const endingMultilineLangMap = new Map([
		["html", "-->"],
		["c", "*/"],
		["asm", "*/"],
		["sql", "*/"],
		["python", `"""`],
	]);
	if (!isMultiline && commentType != "html") {
		const commentChar = langMap.get(commentType);
		const outerLine = `${commentChar} ` + `${boxSymbol}`.repeat(width - 2);
		const innerSpace = width - 4;

		const paddedText = ` ${text} `
			.padStart(Math.floor((innerSpace + text.length + 2) / 2), " ")
			.padEnd(innerSpace, " ");

		const middleLine = `${commentChar} ${boxSymbol}${paddedText}${boxSymbol}`;
		return `${outerLine}\n${middleLine}\n${outerLine}`;
	} else {
		const firstCommentChar = startingMultilineLangMap.get(commentType);
		const lastCommentChar = endingMultilineLangMap.get(commentType);
		const outerLine = `${boxSymbol}`.repeat(width - 2);
		const innerSpace = width - 4;

		const paddedText = ` ${text} `
			.padStart(Math.floor((innerSpace + text.length + 2) / 2), " ")
			.padEnd(innerSpace, " ");

		const middleLine = `${boxSymbol}${paddedText}${boxSymbol}`;
		return `${firstCommentChar}\n${outerLine}\n${middleLine}\n${outerLine}\n${lastCommentChar}`;
	}
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
		data.get("boxsymbol"),
	);
});

window.addEventListener("pageshow", () => {
	document.getElementById("output").value = "";
});
