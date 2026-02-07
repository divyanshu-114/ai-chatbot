import dotenv from "dotenv";
import "dotenv/config";   // 👈 MUST be first
import { ingestPdf } from "../pdf/ingestPdf.js";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";
// import { ingestPdf } from "../pdf/ingestPdf.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log("📥 Starting PDF ingestion...");

  const pdfPath = path.join(
    __dirname,
    "../docs/Divyanshu_Raj_Proposal.pdf"
  );

  await ingestPdf(pdfPath);

  console.log("✅ Done");
  process.exit(0);
}

run();


