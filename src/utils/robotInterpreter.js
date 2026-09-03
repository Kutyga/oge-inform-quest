// Интерпретатор языка программирования Робота (тема 15) — упрощённый КуМир.
// Команды: вверх/вниз/влево/вправо/закрасить.
// Условия: сверху|снизу|слева|справа свободно|стена, и/или/не, скобки.
// Управляющие конструкции: если...то...(иначе...)все; нц N раз...кц; нц пока...кц.
// "#" до конца строки — комментарий. Блоки закрываются ключевыми словами (без отступов).

class RobotProgramError extends Error {}

const MOVE_CMDS = { вверх: "up", вниз: "down", влево: "left", вправо: "right" };
const SENSOR_DIRS = { сверху: "up", снизу: "down", слева: "left", справа: "right" };
const DIR_VECT = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

function tokenize(source) {
  const noComments = source
    .split("\n")
    .map((line) => {
      const idx = line.indexOf("#");
      return idx === -1 ? line : line.slice(0, idx);
    })
    .join("\n");
  return noComments.match(/[а-яёА-ЯЁ]+|\d+|[()]/g) || [];
}

function parseProgram(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  function expect(word) {
    if (peek() !== word) {
      throw new RobotProgramError(`Ожидалось "${word}", а найдено "${peek() ?? "конец программы"}"`);
    }
    return next();
  }

  function parseBody(stopSet) {
    const stmts = [];
    while (pos < tokens.length && !stopSet.has(peek())) {
      stmts.push(parseStmt());
    }
    return stmts;
  }

  function parseStmt() {
    const tok = peek();
    if (tok in MOVE_CMDS) {
      next();
      return { t: "move", dir: MOVE_CMDS[tok] };
    }
    if (tok === "закрасить") {
      next();
      return { t: "paint" };
    }
    if (tok === "если") return parseIf();
    if (tok === "нц") return parseLoop();
    throw new RobotProgramError(`Неизвестная команда: "${tok ?? "конец программы"}"`);
  }

  function parseIf() {
    expect("если");
    const cond = parseCond();
    expect("то");
    const thenBody = parseBody(new Set(["иначе", "все"]));
    let elseBody = null;
    if (peek() === "иначе") {
      next();
      elseBody = parseBody(new Set(["все"]));
    }
    expect("все");
    return { t: "if", cond, thenBody, elseBody };
  }

  function parseLoop() {
    expect("нц");
    if (peek() === "пока") {
      next();
      const cond = parseCond();
      const body = parseBody(new Set(["кц"]));
      expect("кц");
      return { t: "while", cond, body };
    }
    const countTok = next();
    if (!countTok || !/^\d+$/.test(countTok)) {
      throw new RobotProgramError(`После "нц" ожидалось число или "пока", а найдено "${countTok ?? "конец программы"}"`);
    }
    expect("раз");
    const body = parseBody(new Set(["кц"]));
    expect("кц");
    return { t: "repeat", count: parseInt(countTok, 10), body };
  }

  function parseCond() {
    return parseOr();
  }
  function parseOr() {
    let node = parseAnd();
    while (peek() === "или") {
      next();
      node = { t: "or", a: node, b: parseAnd() };
    }
    return node;
  }
  function parseAnd() {
    let node = parseNot();
    while (peek() === "и") {
      next();
      node = { t: "and", a: node, b: parseNot() };
    }
    return node;
  }
  function parseNot() {
    if (peek() === "не") {
      next();
      return { t: "not", a: parseNot() };
    }
    if (peek() === "(") {
      next();
      const node = parseCond();
      expect(")");
      return node;
    }
    return parseSensor();
  }
  function parseSensor() {
    const dirTok = next();
    if (!dirTok || !(dirTok in SENSOR_DIRS)) {
      throw new RobotProgramError(`Ожидалось условие (сверху/снизу/слева/справа ...), а найдено "${dirTok ?? "конец программы"}"`);
    }
    const kindTok = next();
    if (kindTok === "свободно") return { t: "sensor", dir: SENSOR_DIRS[dirTok], kind: "free" };
    if (kindTok === "стена") return { t: "sensor", dir: SENSOR_DIRS[dirTok], kind: "wall" };
    throw new RobotProgramError(`После "${dirTok}" ожидалось "свободно" или "стена", а найдено "${kindTok ?? "конец программы"}"`);
  }

  const body = parseBody(new Set());
  if (pos < tokens.length) {
    throw new RobotProgramError(`Лишний текст в программе, начиная с "${peek()}"`);
  }
  return body;
}

export function hasWall(level, r, c, dir) {
  const walls = level.walls || [];
  if (dir === "right") return c + 1 >= level.cols || walls.includes(`${r},${c},right`);
  if (dir === "left") return c - 1 < 0 || walls.includes(`${r},${c - 1},right`);
  if (dir === "down") return r + 1 >= level.rows || walls.includes(`${r},${c},down`);
  return r - 1 < 0 || walls.includes(`${r - 1},${c},down`); // up
}

function evalCond(node, ctx) {
  if (node.t === "sensor") {
    const wall = hasWall(ctx.level, ctx.pos.row, ctx.pos.col, node.dir);
    return node.kind === "wall" ? wall : !wall;
  }
  if (node.t === "not") return !evalCond(node.a, ctx);
  if (node.t === "and") return evalCond(node.a, ctx) && evalCond(node.b, ctx);
  return evalCond(node.a, ctx) || evalCond(node.b, ctx); // "or"
}

function bumpSteps(ctx) {
  ctx.steps++;
  if (ctx.steps > ctx.stepLimit) {
    throw new RobotProgramError("Превышено число шагов — похоже на бесконечный цикл");
  }
}

function execBody(stmts, ctx) {
  for (const s of stmts) {
    if (ctx.crashed) return;
    execStmt(s, ctx);
  }
}
function execStmt(s, ctx) {
  bumpSteps(ctx);
  if (s.t === "move") {
    if (hasWall(ctx.level, ctx.pos.row, ctx.pos.col, s.dir)) {
      ctx.crashed = true;
      return;
    }
    const [dr, dc] = DIR_VECT[s.dir];
    ctx.pos = { row: ctx.pos.row + dr, col: ctx.pos.col + dc };
    return;
  }
  if (s.t === "paint") {
    ctx.painted.add(`${ctx.pos.row},${ctx.pos.col}`);
    return;
  }
  if (s.t === "if") {
    if (evalCond(s.cond, ctx)) execBody(s.thenBody, ctx);
    else if (s.elseBody) execBody(s.elseBody, ctx);
    return;
  }
  if (s.t === "repeat") {
    for (let i = 0; i < s.count && !ctx.crashed; i++) execBody(s.body, ctx);
    return;
  }
  if (s.t === "while") {
    while (evalCond(s.cond, ctx)) {
      bumpSteps(ctx);
      execBody(s.body, ctx);
      if (ctx.crashed) return;
    }
  }
}

// Парсит и выполняет программу над уровнем { rows, cols, walls, start, target }.
// Возвращает { painted, crashed, matches, finalPos }. Бросает Error с понятным
// .message при синтаксической ошибке или превышении лимита шагов.
export function runRobotProgram(level, source) {
  const tokens = tokenize(source);
  const program = parseProgram(tokens);
  const ctx = {
    level,
    pos: { ...level.start },
    painted: new Set(),
    crashed: false,
    steps: 0,
    stepLimit: 20000,
  };
  execBody(program, ctx);
  const targetSet = new Set(level.target);
  const paintedArr = Array.from(ctx.painted);
  const matches = !ctx.crashed && paintedArr.length === targetSet.size && paintedArr.every((k) => targetSet.has(k));
  return { painted: ctx.painted, crashed: ctx.crashed, matches, finalPos: ctx.pos };
}
