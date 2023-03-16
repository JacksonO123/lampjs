const fs = require("fs");
const path = require("path");

const TEMPLATE_DIR = path.join(__dirname, "template");

function copyFiles(source, dest) {
  const files = fs.readdirSync(source);
  for (const filename of files) {
    const isDirectory = fs.lstatSync(path.join(source, filename)).isDirectory();
    if (isDirectory) {
      fs.mkdirSync(path.join(dest, filename));
      copyFiles(path.join(source, filename), path.join(dest, filename));
    } else {
      fs.copyFileSync(path.join(source, filename), path.join(dest, filename));
    }
  }
}

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question("? What will your project be called: ", (test) => {
  console.log(test, process.cwd());
  readline.close();
});
