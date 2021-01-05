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
    case "SpreadElement":
      return "...";
    case "ArrayExpression":
      return "[]";
    case "TemplateElement":
      return node.value.raw;
    case "BinaryExpression":
    case "LogicalExpression":
    case "UnaryExpression":
      return node.operator;
    case "AssignmentExpression":
    case "VariableDeclarator":
    case "Property":
      return "=";
    case "CallExpression":
      return "()";
    case "MemberExpression":
      return ".";
    case "BlockStatement":
      return "{ ... }";
    case "IfStatement":
      return "if";
    case "FunctionDeclaration":
      return "function";
    case "ExpressionStatement":
      return ";";
    case "ArrowFunctionExpression":
      return "=>";
    case "ReturnStatement":
      return "return";
    case "SwitchCase":
      return "case";
    case "SwitchStatement":
      return "switch";
    case "Program":
      return "program";
    case "TemplateLiteral":
      return "TODO: TemplateLiteral";
    case "ObjectExpression":
      return "{ : }";
    default:
      console.log(node);
      return node.type;
  }
}

function walk(node, previous) {
  if (node.type) {
    const output = display(node);
    let indent = "";

    if (previous.length) {
      indent = previous.reduce((acc, cur) => acc + cur, "") + "── ";
    } else {
      indent = "   ";
    }

    console.log(`${indent}${output}`);
  }

  if (previous[previous.length - 1] === `   └`) {
    previous[previous.length - 1] = "    ";
  }
  if (previous[previous.length - 1] === `   ├`) {
    previous[previous.length - 1] = "   │";
  }

  Object.values(node).forEach((child, index, arr) => {
    if (typeof child === "object" && child !== null) {
      if (Array.isArray(child)) {
        // Don't increment depth for arrays.
        walk(child, [...previous]);
      } else {
        if (index === arr.length - 1) {
          // last
          walk(child, [...previous, `   └`]);
        } else {
          walk(child, [...previous, "   ├"]);
        }
      }
    }
  });
}

walk(ast, []);
