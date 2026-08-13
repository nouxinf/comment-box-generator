import { minify } from "html-minifier-terser";
import { transform as minifyCSS } from "lightningcss";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import subsetFont from "subset-font";

const srcDir = "src";
const outDir = "dist";

const startTime = performance.now();

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const entrypoints = [];
const cssFiles = [];
const htmlFiles = [];
const assetFiles = [];
const fontSubsets = new Map([
	[
		"assets/fonts/StackSansText-VariableFont_wght.ttf",
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:'\"-()#=",
	],
]);

const glob = new Bun.Glob("**/*");

function toBinaryBuffer(value) {
	if (Buffer.isBuffer(value)) return value;
	if (value instanceof ArrayBuffer) return Buffer.from(value);
	if (ArrayBuffer.isView(value)) {
		return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
	}
	return Buffer.from(value ?? []);
}

for await (const file of glob.scan(srcDir)) {
	if (file.endsWith(".html")) {
		htmlFiles.push(file);
	} else if (file.endsWith(".css")) {
		cssFiles.push(file);
	} else if (file.endsWith(".js")) {
		entrypoints.push(join(srcDir, file));
	} else {
		assetFiles.push(file);
	}
}

if (entrypoints.length) {
	await Bun.build({
		entrypoints,
		outdir: outDir,
		target: "browser",
		minify: true,
	});
}

for (const file of cssFiles) {
	const css = await readFile(join(srcDir, file), "utf8");

	const { code } = minifyCSS({
		filename: file,
		code: Buffer.from(css),
		minify: true,
	});

	const outPath = join(outDir, file);
	await mkdir(dirname(outPath), { recursive: true });
	await writeFile(outPath, code);
}

for (const file of htmlFiles) {
	const html = await readFile(join(srcDir, file), "utf8");

	const minified = await minify(html, {
		collapseWhitespace: true,
		removeComments: true,
		minifyCSS: true,
		minifyJS: true,
	});

	const outPath = join(outDir, file);
	await mkdir(dirname(outPath), { recursive: true });
	await writeFile(outPath, minified);
}

for (const file of assetFiles) {
	const inputPath = join(srcDir, file);
	const outputPath = join(outDir, file);
	await mkdir(dirname(outputPath), { recursive: true });

	const fontPath = file.replaceAll("\\", "/");
	const subsetCharacters = fontSubsets.get(fontPath);

	if (file.toLowerCase().endsWith(".ttf") && subsetCharacters) {
		try {
			const input = await readFile(inputPath);

			const result = await subsetFont(input, subsetCharacters);
			const font = result?.font ?? result;
			const data = toBinaryBuffer(font);

			if (!data.byteLength) {
				throw new Error("Empty font subset output");
			}

			await writeFile(outputPath, data);
		} catch (err) {
			console.warn(
				`Font subset failed for ${file}, copying original`,
				err,
			);
			await cp(inputPath, outputPath);
		}

		continue;
	}

	await cp(inputPath, outputPath);
}

function formatBytes(bytes) {
	if (bytes < 1024) return `${bytes}B`;

	const units = ["KB", "MB", "GB", "TB"];
	let value = bytes;
	let unit = -1;

	do {
		value /= 1024;
		unit++;
	} while (value >= 1024 && unit < units.length - 1);

	return `${value.toFixed(1).replace(/\.0$/, "")}${units[unit]}`;
}

export async function getFolderSize(dir, format = false) {
	let bytes = 0;
	const glob = new Bun.Glob("**/*");

	for await (const entry of glob.scan({
		cwd: dir,
		dot: true,
		onlyFiles: true,
		followSymlinks: false,
	})) {
		bytes += Bun.file(join(dir, entry)).size;
	}
	if (format) {
		return formatBytes(bytes);
	} else {
		return bytes;
	}
}

const elapsedMs = performance.now() - startTime;
console.log(`Built ${srcDir} into ${outDir} in ${elapsedMs.toFixed(1)}ms`);
const srcSize = await getFolderSize("./src");
const distSize = await getFolderSize("./dist");
console.log(`src size: ${formatBytes(srcSize)}`);
console.log(`dist size: ${formatBytes(distSize)}`);
console.log(`difference: -${formatBytes(srcSize - distSize)}`);
