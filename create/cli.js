#!/usr/bin/env node

import fsPkg from "fs-extra";
import { join } from "path";
import rl from "readline";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { renameSync, copySync } = fsPkg;

const readline = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question("? What will your project be called: ", (name) => {
  const cwd = process.cwd();
  const from = join(__dirname, "template");
  const to = join(cwd, name);
  renameSync(join(from, "_gitignore"), join(from, ".gitignore"));
  copySync(from, to, { overwrite: true });
  console.log("Done!");
  console.log("Next steps:\n");
  if (name !== ".") {
    console.log(`-  cd ${name}`);
  }
  console.log("-  pnpm install\n-  pnpm dev");
  readline.close();
});
