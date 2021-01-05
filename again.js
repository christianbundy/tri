const fs = require("fs");

const espree = require("espree");

const code = fs.readFileSync(__filename, "utf8");
const ast = espree.parse(code, { ecmaVersion: espree.latestEcmaVersion });

function display(node) {
  switch (node.type) {
    case "VariableDeclaration":
      return node.kind;
    case "Identifier":
      return node.name;
    case "Literal":
      return node.raw;
    case "TemplateElement":
      return node.value.raw;
    case "BinaryExpression":
    case "LogicalExpression":
    case "UnaryExpression":
      return node.operator;
    case "TemplateLiteral":
    case "SwitchCase":
    case "SwitchStatement":
    case "ReturnStatement":
    case "ObjectExpression":
    case "CallExpression":
    case "MemberExpression":
    case "Program":
    case "VariableDeclarator":
    case "Property":
    case "FunctionDeclaration":
    case "BlockStatement":
    case "ExpressionStatement":
    case "IfStatement":
    case "ArrowFunctionExpression":
      return null;
    default:
      console.log(node);
      return node.type;
  }
}

function walk(node, depth) {
  if (node.type) {
    const output = display(node);

    const indent = "→ ".repeat(depth);
    if (output === null) {
      console.log(`${indent}${node.type}`);
    } else {
      console.log(`${indent}${node.type}: ${output}`);
    }
  }

  Object.values(node).forEach((child) => {
    if (typeof child === "object" && child !== null) {
      if (Array.isArray(child)) {
        // Don't increment depth for arrays.
        walk(child, depth);
      } else {
        walk(child, depth + 1);
      }
    }
  });
}

walk(ast, 0);
