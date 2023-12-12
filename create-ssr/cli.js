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

const renamed = new Map();

const resetRename = () => {
  const keys = Array.from(renamed.keys());
  keys.forEach((key) => {
    const renamedFile = renamed.get(key);
    renameSync(renamedFile, key);
  });
};

readline.question("? What will your project be called: ", (name) => {
  const cwd = process.cwd();
  const from = join(__dirname, "template");
  const to = join(cwd, name);

  const fromRename = join(from, "_gitignore");
  const toRename = join(from, ".gitignore");
  renamed.set(fromRename, toRename);

  renameSync(fromRename, toRename);
  copySync(from, to, { overwrite: true });

  console.log("Done!");
  console.log("Next steps:\n");

  if (name !== ".") {
    console.log(`-  cd ${name}`);
  }

  console.log(
    "-  pnpm install\n-  pnpm start:dev\n\nNote: dev script requires bun runtime (might change in later versions)",
  );

  resetRename();
  readline.close();
});
