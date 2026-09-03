// Мини-интерпретатор Python-подобного языка для темы "Программирование" (тема 16).
// Поддерживает: присваивание (+=, -=, *=, /=), if/elif/else, while, for..in range(),
// break/continue, print/input/int/float/str/abs/range. Наружу отдаём только
// runPyProgram — весь разбор и AST внутренние детали реализации.

class BreakSignal {}
class ContinueSignal {}
class InterpRuntimeError extends Error {}

function stripPyComment(line) {
  let inStr = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inStr) {
      if (ch === inStr) inStr = null;
    } else if (ch === '"' || ch === "'") {
      inStr = ch;
    } else if (ch === "#") {
      return line.slice(0, i);
    }
  }
  return line;
}
function pyIndentOf(line) {
  let i = 0;
  while (i < line.length && line[i] === " ") i++;
  return i;
}
function tokenizePyExpr(s) {
  const tokens = [];
  const re = /\s*(\*\*|\/\/|==|!=|<=|>=|[()[\],]|[+\-*/%<>=]|"[^"]*"|'[^']*'|[A-Za-z_]\w*|\d+\.\d+|\d+)/g;
  let m;
  let lastIndex = 0;
  while ((m = re.exec(s))) {
    if (m.index !== lastIndex) {
      const gap = s.slice(lastIndex, m.index).trim();
      if (gap.length > 0) throw new InterpRuntimeError("Не могу разобрать: " + gap);
    }
    tokens.push(m[1]);
    lastIndex = re.lastIndex;
  }
  const rest = s.slice(lastIndex).trim();
  if (rest.length > 0) throw new InterpRuntimeError("Не могу разобрать выражение: " + rest);
  return tokens;
}
function parsePyExprTokens(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  function parseOr() {
    let node = parseAnd();
    while (peek() === "or") { next(); node = { t: "or", a: node, b: parseAnd() }; }
    return node;
  }
  function parseAnd() {
    let node = parseNot();
    while (peek() === "and") { next(); node = { t: "and", a: node, b: parseNot() }; }
    return node;
  }
  function parseNot() {
    if (peek() === "not") { next(); return { t: "not", a: parseNot() }; }
    return parseCompare();
  }
  function parseCompare() {
    let node = parseAdd();
    const ops = ["==", "!=", "<=", ">=", "<", ">"];
    while (ops.includes(peek())) { const op = next(); node = { t: "cmp", op, a: node, b: parseAdd() }; }
    return node;
  }
  function parseAdd() {
    let node = parseMul();
    while (peek() === "+" || peek() === "-") { const op = next(); node = { t: "bin", op, a: node, b: parseMul() }; }
    return node;
  }
  function parseMul() {
    let node = parseUnary();
    while (peek() === "*" || peek() === "/" || peek() === "//" || peek() === "%") { const op = next(); node = { t: "bin", op, a: node, b: parseUnary() }; }
    return node;
  }
  function parseUnary() {
    if (peek() === "-" || peek() === "+") { const op = next(); return { t: "unary", op, a: parseUnary() }; }
    return parsePow();
  }
  function parsePow() {
    let node = parsePrimary();
    if (peek() === "**") { next(); return { t: "bin", op: "**", a: node, b: parseUnary() }; }
    return node;
  }
  function parsePrimary() {
    const tok = next();
    if (tok === undefined) throw new InterpRuntimeError("Неожиданный конец выражения");
    if (tok === "(") {
      const node = parseOr();
      if (next() !== ")") throw new InterpRuntimeError("Ожидалась )");
      return node;
    }
    if (/^\d+\.\d+$/.test(tok)) return { t: "num", v: parseFloat(tok) };
    if (/^\d+$/.test(tok)) return { t: "num", v: parseInt(tok, 10) };
    if (/^".*"$/.test(tok) || /^'.*'$/.test(tok)) return { t: "str", v: tok.slice(1, -1) };
    if (tok === "True") return { t: "num", v: true };
    if (tok === "False") return { t: "num", v: false };
    if (/^[A-Za-z_]\w*$/.test(tok)) {
      if (peek() === "(") {
        next();
        const args = [];
        if (peek() !== ")") {
          args.push(parseOr());
          while (peek() === ",") { next(); args.push(parseOr()); }
        }
        if (next() !== ")") throw new InterpRuntimeError("Ожидалась ) после аргументов " + tok);
        return { t: "call", name: tok, args };
      }
      return { t: "var", name: tok };
    }
    throw new InterpRuntimeError("Неожиданный токен: " + tok);
  }
  const node = parseOr();
  if (pos < tokens.length) throw new InterpRuntimeError("Лишние токены в выражении");
  return node;
}
function parsePyExprString(s) {
  return parsePyExprTokens(tokenizePyExpr(s));
}
function findPyChildIndent(lines, idx, parentIndent) {
  for (let i = idx; i < lines.length; i++) {
    if (lines[i].text === "") continue;
    if (lines[i].indent <= parentIndent) throw new InterpRuntimeError("Ожидался блок с отступом после строки " + idx);
    return lines[i].indent;
  }
  throw new InterpRuntimeError("Ожидался блок после :, но код закончился");
}
function parsePyBlock(lines, startIdx, blockIndent) {
  const stmts = [];
  let i = startIdx;
  while (i < lines.length) {
    const { indent, text } = lines[i];
    if (text === "") { i++; continue; }
    if (indent < blockIndent) break;
    if (indent > blockIndent) throw new InterpRuntimeError("Неожиданный отступ на строке: " + text);

    if (text.endsWith(":") && text.startsWith("if ")) {
      const cond = parsePyExprString(text.slice(3, -1).trim());
      const [body, ni] = parsePyBlock(lines, i + 1, findPyChildIndent(lines, i + 1, blockIndent));
      i = ni;
      const branches = [{ cond, body }];
      let elseBody = null;
      while (i < lines.length && lines[i].indent === blockIndent && lines[i].text.startsWith("elif ")) {
        const econd = parsePyExprString(lines[i].text.slice(5, -1).trim());
        const [ebody, ni2] = parsePyBlock(lines, i + 1, findPyChildIndent(lines, i + 1, blockIndent));
        branches.push({ cond: econd, body: ebody });
        i = ni2;
      }
      if (i < lines.length && lines[i].indent === blockIndent && lines[i].text === "else:") {
        const [ebody, ni3] = parsePyBlock(lines, i + 1, findPyChildIndent(lines, i + 1, blockIndent));
        elseBody = ebody;
        i = ni3;
      }
      stmts.push({ t: "if", branches, elseBody });
      continue;
    }
    if (text.endsWith(":") && text.startsWith("while ")) {
      const cond = parsePyExprString(text.slice(6, -1).trim());
      const [body, ni] = parsePyBlock(lines, i + 1, findPyChildIndent(lines, i + 1, blockIndent));
      stmts.push({ t: "while", cond, body });
      i = ni;
      continue;
    }
    if (text.endsWith(":") && text.startsWith("for ")) {
      const m = text.match(/^for\s+(\w+)\s+in\s+(.+):$/);
      if (!m) throw new InterpRuntimeError("Не могу разобрать for: " + text);
      const iterExpr = parsePyExprString(m[2].trim());
      const [body, ni] = parsePyBlock(lines, i + 1, findPyChildIndent(lines, i + 1, blockIndent));
      stmts.push({ t: "for", varName: m[1], iterExpr, body });
      i = ni;
      continue;
    }
    if (text === "break") { stmts.push({ t: "break" }); i++; continue; }
    if (text === "continue") { stmts.push({ t: "continue" }); i++; continue; }
    if (text === "pass") { i++; continue; }

    const asg = text.match(/^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=)\s*(.+)$/);
    if (asg) {
      const [, name, op, rhs] = asg;
      stmts.push({ t: "assign", name, expr: { t: "bin", op: op[0], a: { t: "var", name }, b: parsePyExprString(rhs) } });
      i++;
      continue;
    }
    const asg2 = text.match(/^([A-Za-z_]\w*)\s*=\s*(?!=)(.+)$/);
    if (asg2) {
      stmts.push({ t: "assign", name: asg2[1], expr: parsePyExprString(asg2[2]) });
      i++;
      continue;
    }
    stmts.push({ t: "expr", expr: parsePyExprString(text) });
    i++;
  }
  return [stmts, i];
}
function parsePyProgram(source) {
  const rawLines = source.replace(/\t/g, "    ").split("\n");
  const lines = rawLines
    .map((l) => {
      const noComment = stripPyComment(l);
      return { indent: pyIndentOf(noComment), text: noComment.trim() };
    })
    .filter((l) => l.text !== "");
  if (lines.length === 0) return [];
  const [stmts] = parsePyBlock(lines, 0, lines[0].indent);
  return stmts;
}
function pyTruthy(v) {
  if (typeof v === "number") return v !== 0;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.length > 0;
  return !!v;
}
function evalPyExpr(node, env, ctx) {
  switch (node.t) {
    case "num": return node.v;
    case "str": return node.v;
    case "var":
      if (!(node.name in env)) throw new InterpRuntimeError("Переменная не определена: " + node.name);
      return env[node.name];
    case "or": return pyTruthy(evalPyExpr(node.a, env, ctx)) ? evalPyExpr(node.a, env, ctx) : evalPyExpr(node.b, env, ctx);
    case "and": { const a = evalPyExpr(node.a, env, ctx); return pyTruthy(a) ? evalPyExpr(node.b, env, ctx) : a; }
    case "not": return !pyTruthy(evalPyExpr(node.a, env, ctx));
    case "unary": { const v = evalPyExpr(node.a, env, ctx); return node.op === "-" ? -v : +v; }
    case "cmp": {
      const a = evalPyExpr(node.a, env, ctx);
      const b = evalPyExpr(node.b, env, ctx);
      if (node.op === "==") return a === b;
      if (node.op === "!=") return a !== b;
      if (node.op === "<") return a < b;
      if (node.op === ">") return a > b;
      if (node.op === "<=") return a <= b;
      if (node.op === ">=") return a >= b;
      break;
    }
    case "bin": {
      const a = evalPyExpr(node.a, env, ctx);
      const b = evalPyExpr(node.b, env, ctx);
      if (node.op === "+") return a + b;
      if (node.op === "-") return a - b;
      if (node.op === "*") return a * b;
      if (node.op === "/") return a / b;
      if (node.op === "//") return Math.floor(a / b);
      if (node.op === "%") return ((a % b) + b) % b;
      if (node.op === "**") return Math.pow(a, b);
      break;
    }
    case "call": {
      const name = node.name;
      const args = node.args.map((a) => evalPyExpr(a, env, ctx));
      if (name === "print") { ctx.output.push(args.map((a) => String(a)).join(" ")); return null; }
      if (name === "input") {
        if (ctx.inputQueue.length === 0) throw new InterpRuntimeError("input(): входные данные закончились");
        return ctx.inputQueue.shift();
      }
      if (name === "int") return parseInt(args[0], 10);
      if (name === "float") return parseFloat(args[0]);
      if (name === "str") return String(args[0]);
      if (name === "abs") return Math.abs(args[0]);
      if (name === "range") {
        let a = args[0], b = args[1], step = args[2];
        if (b === undefined) { b = a; a = 0; }
        if (step === undefined) step = 1;
        const out = [];
        if (step > 0) for (let x = a; x < b; x += step) out.push(x);
        else for (let x = a; x > b; x += step) out.push(x);
        return out;
      }
      throw new InterpRuntimeError("Неизвестная функция: " + name);
    }
  }
  throw new InterpRuntimeError("Не удалось вычислить выражение");
}
function execPyBlock(stmts, env, ctx) {
  for (const s of stmts) execPyStmt(s, env, ctx);
}
function execPyStmt(s, env, ctx) {
  ctx.steps++;
  if (ctx.steps > ctx.stepLimit) throw new InterpRuntimeError("Превышено время выполнения (похоже на бесконечный цикл)");
  if (s.t === "assign") { env[s.name] = evalPyExpr(s.expr, env, ctx); return; }
  if (s.t === "expr") { evalPyExpr(s.expr, env, ctx); return; }
  if (s.t === "if") {
    for (const br of s.branches) {
      if (pyTruthy(evalPyExpr(br.cond, env, ctx))) { execPyBlock(br.body, env, ctx); return; }
    }
    if (s.elseBody) execPyBlock(s.elseBody, env, ctx);
    return;
  }
  if (s.t === "while") {
    while (pyTruthy(evalPyExpr(s.cond, env, ctx))) {
      ctx.steps++;
      if (ctx.steps > ctx.stepLimit) throw new InterpRuntimeError("Превышено время выполнения (похоже на бесконечный цикл)");
      try { execPyBlock(s.body, env, ctx); } catch (e) { if (e instanceof BreakSignal) break; if (e instanceof ContinueSignal) continue; throw e; }
    }
    return;
  }
  if (s.t === "for") {
    const iterable = evalPyExpr(s.iterExpr, env, ctx);
    for (const v of iterable) {
      env[s.varName] = v;
      ctx.steps++;
      if (ctx.steps > ctx.stepLimit) throw new InterpRuntimeError("Превышено время выполнения");
      try { execPyBlock(s.body, env, ctx); } catch (e) { if (e instanceof BreakSignal) break; if (e instanceof ContinueSignal) continue; throw e; }
    }
    return;
  }
  if (s.t === "break") throw new BreakSignal();
  if (s.t === "continue") throw new ContinueSignal();
}

export function runPyProgram(source, inputLines) {
  const ast = parsePyProgram(source);
  const ctx = { inputQueue: [...inputLines], output: [], steps: 0, stepLimit: 200000 };
  execPyBlock(ast, {}, ctx);
  return ctx.output;
}
