const fs = require("fs-extra");
const path = require("path");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question("? What will your project be called: ", (name) => {
  const from = path.join(__dirname, "template");
  const to = path.join(process.cwd(), name);
  fs.renameSync(path.join(from, "_gitignore"), path.join(from, ".gitignore"));
  fs.copySync(from, to, { overwrite: true });
  console.log("Done!");
  console.log("Next steps:\n");
  if (name !== ".") {
    console.log(`-  "cd ${name}"`);
  }
  console.log('-  "npm install"\n-  "npm run dev"');
  readline.close();
});
