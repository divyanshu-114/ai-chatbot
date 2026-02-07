import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function parsePdf(path) {
  const buffer = fs.readFileSync(path);
  const data = await pdfParse(buffer);
  return data.text;
}
