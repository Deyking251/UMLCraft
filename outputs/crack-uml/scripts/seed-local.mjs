import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const target = process.env.CRACK_UML_LOCAL_DATA_PATH || path.join(process.cwd(), ".data", "projects.json");
await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, "[]\n", "utf8");
console.log(`Initialized local project store at ${target}`);
