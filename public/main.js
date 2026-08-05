const textValue = () => document.getElementById("text").value;

const banner = (
	text,
	width = document.getElementById("minwidth").value || 40, // fallback to 40
) => {
	if (text.length + 2 > width) {
		width = text.length + 6;
	}
	const outerLine = "# " + "=".repeat(width - 2);
	const innerSpace = width - 4;

	const paddedText = ` ${text} `
		.padStart(Math.floor((innerSpace + text.length + 2) / 2), " ")
		.padEnd(innerSpace, " ");

	const middleLine = `# =${paddedText}=`;
	return `${outerLine}\n${middleLine}\n${outerLine}`;
};

document.getElementById("submit").addEventListener("click", (event) => {
	event.preventDefault(); // this prevents pressing submit from refreshing the page
	document.getElementById("output").value = banner(textValue());
});
