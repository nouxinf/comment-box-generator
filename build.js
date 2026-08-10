import { minify } from "html-minifier-terser";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const srcDir = "src";
const outDir = "dist";

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const entrypoints = [];
const htmlFiles = [];
const assetFiles = [];

const glob = new Bun.Glob("**/*");

for await (const file of glob.scan(srcDir)) {
	if (file.endsWith(".html")) {
		htmlFiles.push(file);
	} else if (/\.(js|css)$/.test(file)) {
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
	await cp(inputPath, outputPath);
}

console.log(`Built ${srcDir} into ${outDir}`);
