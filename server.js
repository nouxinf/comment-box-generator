import { join, resolve, sep } from "node:path";
import { stat } from "node:fs/promises";

const root = resolve(process.argv[2] || "./dist");
const port = process.env.PORT || 3054;

Bun.serve({
	port,
	async fetch(req) {
		const path = join(root, new URL(req.url).pathname);

		if (path !== root && !path.startsWith(root + sep)) {
			return new Response("Forbidden", { status: 403 });
		}

		try {
			let filePath = path;
			const info = await stat(filePath);

			if (info.isDirectory()) {
				filePath = join(filePath, "index.html");
				await stat(filePath);
			}

			return new Response(Bun.file(filePath));
		} catch {
			return new Response("Not Found", { status: 404 });
		}
	},
});

console.log(`Serving ${root} at http://localhost:${port}`);
