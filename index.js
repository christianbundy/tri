const fs = require("fs");
const chalk = require("chalk");
const path = require("path");

const data = fs
  .readFileSync(path.join(__dirname, "README.md"))
  .toString()
  .split("");

function isSpan(a, b) {
  return (a === " ") === (b === " ");
}

function parseSpans(x) {
  return x.reduce((acc, cur) => {
    if (acc.length === 0) {
      acc.push({ type: "span", value: [cur] });
      return acc;
    }

    const lastSpan = acc[acc.length - 1].value;
    const lastChar = lastSpan[lastSpan.length - 1];

    if (isSpan(cur.value, lastChar.value)) {
      acc[acc.length - 1].value.push(cur);
    } else {
      acc.push({ type: "span", value: [cur] });
    }
    return acc;
  }, []);
}

function parseLines(x) {
  return x.reduce(
    (acc, cur) => {
      if (cur == "\n") {
        acc[acc.length - 1].value = parseSpans(acc[acc.length - 1].value);

        acc.push({ type: "line", value: [] });
      } else {
        acc[acc.length - 1].value.push({ type: "character", value: cur });
      }

      return acc;
    },
    [{ type: "line", value: [] }]
  );
}

const lines = parseLines(data);

function draw(node, previous = []) {
  if (Array.isArray(node)) {
    node.forEach((n, i) => draw(n, [...previous, i]));
  }

  switch (node.type) {
    case "line":
      draw(node.value, previous);
      process.stdout.write("\n");
      break;

    case "span":
      draw(node.value, previous);
      break;

    case "character":
      const hasCursor = cursor.every((x, i) => x === previous[i]);
      if (hasCursor) {
        process.stdout.write(chalk.bgGreen(node.value));
      } else {
        process.stdout.write(node.value);
      }
      break;
  }
}

const cursor = [0];
draw(lines);

const readline = require("readline");

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on("keypress", (str, key) => {
  process.stdin.write("\033[2J");
  switch (key.name) {
    case "escape":
    case "c":
      process.exit(0);
      break;
    case "o":
      cursor.pop();
      draw(lines);
      break;
    case "i":
      cursor.push(0);
      draw(lines);
      break;
    case "up":
    case "left":
    case "h":
    case "k":
      cursor[cursor.length - 1] -= 1;
      draw(lines);
      break;
    case "down":
    case "right":
    case "l":
    case "j":
      cursor[cursor.length - 1] += 1;
      draw(lines);
      break;

    case "r":
      cursor = [0]
      draw(lines);
      break;

    default:
      console.log(key);
  }
});
