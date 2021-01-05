const fs = require("fs");

const get = require('lodash.get')
const espree = require("espree");

const code = fs.readFileSync(__filename, "utf8");
const ast = espree.parse(code, { ecmaVersion: espree.latestEcmaVersion });

let path = [];

function show(input) {
  const node = get(ast, input, ast)
  console.log('CURRENT')
  console.dir(node.type)
  console.log()

  let children = Object.values(node).find((v) => {
    if (Array.isArray(v) && v.every((c) => c.type != null)) {
      return true
    }
  }).map((c) => c.type)

  console.log('CHILDREN')
  console.log(children)
}
console.log('\033[2J');
show('')
