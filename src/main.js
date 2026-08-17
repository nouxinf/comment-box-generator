let symbols;
let leftSym;
let topLeftSym;
let topSym;
let topRightSym;
let rightSym;
let bottomRightSym;
let bottomSym;
let bottomLeftSym;
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
	/*
	Order for linesMap should be:
	left, top left corner, top, top right corner, right, bottom right corner, bottom, bottom left corner
	*/
	const linesMap = new Map([
		["parallel", "║╔═╗║╝═╚"],
		["equals", "========"],
		["solid", "│┌─┐│┘─└"],
		["thick", "┃┏━┓┃┛━┗"],
		["arc", "│╭─╮│╯─╰"],
		["crosses", "╳╳╳╳╳╳╳╳"],
		["x", "XXXXXXXX"],
		["boxes", "████████"],
		["lightshade", "░░░░░░░░"],
		["midshade", "▒▒▒▒▒▒▒▒"],
		["darkshade", "▓▓▓▓▓▓▓▓"],
	]);
	symbols = linesMap.get(boxSymbol);
	leftSym = symbols.charAt(0);
	topLeftSym = symbols.charAt(1);
	topSym = symbols.charAt(2);
	topRightSym = symbols.charAt(3);
	rightSym = symbols.charAt(4);
	bottomRightSym = symbols.charAt(5);
	bottomSym = symbols.charAt(6);
	bottomLeftSym = symbols.charAt(7);
	if (!isMultiline && commentType != "html") {
		const commentChar = langMap.get(commentType);
		const topLine =
			`${commentChar} ` +
			`${topLeftSym}` +
			`${topSym}`.repeat(width - 4) +
			`${topRightSym}`;
		const bottomLine =
			`${commentChar} ` +
			`${bottomLeftSym}` +
			`${topSym}`.repeat(width - 4) +
			`${bottomRightSym}`;
		const innerSpace = width - 4;

		const paddedText = ` ${text} `
			.padStart(Math.floor((innerSpace + text.length + 2) / 2), " ")
			.padEnd(innerSpace, " ");

		const middleLine = `${commentChar} ${leftSym}${paddedText}${rightSym}`;
		return `${topLine}\n${middleLine}\n${bottomLine}`;
	} else {
		const firstCommentChar = startingMultilineLangMap.get(commentType);
		const lastCommentChar = endingMultilineLangMap.get(commentType);
		const topLine =
			`${topLeftSym}` + `${topSym}`.repeat(width - 4) + `${topRightSym}`;
		const bottomLine =
			`${bottomLeftSym}` +
			`${topSym}`.repeat(width - 4) +
			`${bottomRightSym}`;
		const innerSpace = width - 4;

		const paddedText = ` ${text} `
			.padStart(Math.floor((innerSpace + text.length + 2) / 2), " ")
			.padEnd(innerSpace, " ");

		const middleLine = `${leftSym}${paddedText}${rightSym}`;
		return `${firstCommentChar}\n${topLine}\n${middleLine}\n${bottomLine}\n${lastCommentChar}`;
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

const colorScheme = document.getElementById("colorScheme");
colorScheme.addEventListener("change", (event) => {
	localStorage.setItem("color-scheme", event.target.value);
});

window.addEventListener("load", (event) => {
	const scheme = localStorage.getItem("color-scheme") || "auto";
	if (scheme) {
		document.documentElement.style.setProperty("--darkmode", scheme);
		const selected = [...colorScheme.elements].filter(
			(element) => element.value === scheme,
		);
		if (selected) selected[0].checked = true;
	}
});

const copyBtn = document.getElementById("copybtn");
const copyIco = document.getElementById("copyico");
copyBtn.addEventListener("click", () => {
	navigator.clipboard.writeText(document.getElementById("output").value).then(
		() => {
			console.log("Copied to clipboard successfully");
		},
		(err) => {
			console.error(`Couldnt copy text: ${err}`);
		},
	);
	copyIco.src = "assets/ico/tick.svg";
	setTimeout(() => {
		copyIco.src = "assets/ico/copy.svg";
	}, 1500);
});

const dialog = document.querySelector("dialog");
const closeBtn = document.querySelector(".dialog-close");

function closeDialog() {
	if (dialog.classList.contains("closing")) return;

	dialog.classList.add("closing");

	function onEnd(e) {
		if (e.target !== dialog) return;
		dialog.removeEventListener("animationend", onEnd);
		dialog.classList.remove("closing");
		dialog.close();
	}

	dialog.addEventListener("animationend", onEnd);
}

closeBtn.addEventListener("click", closeDialog);

dialog.addEventListener("cancel", (e) => {
	e.preventDefault();
	closeDialog();
});

dialog.addEventListener("click", (e) => {
	if (e.target === dialog) closeDialog();
});
