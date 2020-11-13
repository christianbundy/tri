const fs = require("fs");

const espree = require("espree");

const code = fs.readFileSync(__filename, "utf8");
const ast = espree.parse(code, { ecmaVersion: espree.latestEcmaVersion });

function str(node) {
  if (node.type == null) {
    throw new Error("Must handle one ${node[0].type} node at a time");
  }

  switch (node.type) {
    case "TemplateLiteral":
      const quasis = node.quasis.map(str).join("");

      if (node.expressions.length) {
        const inner = node.expressions
          .reduce(function (acc, cur, index) {
            //            console.log('BEFORE', acc)
            acc.splice(
              cur.start - node.start - 3 - index,
              0,
              "${",
              ...str(cur).split(""),
              "}"
            );
            //           console.log('AFTER', acc)
            return acc;
          }, quasis.split(""))
          .join("");
        return `\`${inner}\``;
      } else {
        return `\`${quasis}\``;
      }
    case "ConditionalExpression":
      return `${str(node.test)} ? ${str(node.consequent)} : ${str(
        node.alternate
      )}`;

    case "TemplateElement":
      return node.value.raw;

    case "Identifier":
      return node.name;

    case "Program":
      return `${node.body.map(str).join("\n")}\n`;

    case "Literal":
      return node.raw;

    case "ExpressionStatement":
      return `${str(node.expression)};`;

    case "CallExpression":
      return `${str(node.callee)}(${node.arguments.map(str).join(", ")})`;

    case "BlockStatement":
      return `{ ${node.body.map(str).join("\n")} }`;

    case "IfStatement":
      const alternate =
        node.alternate == null ? "" : ` else ${str(node.alternate)}`;
      return `if (${str(node.test)}) ${str(node.consequent)}${alternate}`;

    case "BinaryExpression":
      return `${str(node.left)} ${node.operator} ${str(node.right)}`;

    case "ThrowStatement":
      return `throw ${str(node.argument)}`;

    case "NewExpression":
      return `new ${str(node.callee)}(${node.arguments.map(str).join(", ")})`;

    case "SwitchStatement":
      return `switch (${str(node.discriminant)}) {\n${node.cases
        .map(str)
        .join(" ")}\n}`;

    case "SwitchCase":
      const consequent = node.consequent.map(str).join("\n");

      if (node.test === null) {
        return `default:\n${consequent}\n`;
      } else {
        return `case ${str(node.test)}:\n${consequent}\n`;
      }

    case "ReturnStatement":
      return `return ${str(node.argument)};\n`;

    case "FunctionDeclaration":
      const id1 = node.id === null ? "" : str(node.id);
      return `function ${id1} (${node.params.map(str).join(", ")}) ${str(
        node.body
      )}`;

    case "FunctionExpression":
      const id2 = node.id === null ? "" : str(node.id);
      return `function ${id2} (${node.params.map(str).join(", ")}) ${str(
        node.body
      )}`;

    case "MemberExpression":
      return `${str(node.object)}.${str(node.property)}`;

    case "ObjectExpression":
      return `{ ${node.properties.map(str).join(", ")} }`;

    case "Property":
      return `${str(node.key)}: ${str(node.value)}`;

    case "VariableDeclaration":
      return `${node.kind} ${node.declarations.map(str).join(", ")};`;

    case "VariableDeclarator":
      return `${str(node.id)} = ${str(node.init)}`;

    case "SpreadElement":
      return `...${str(node.argument)}`;

    default:
      throw node;
  }
}

process.stdout.write(str(ast));
