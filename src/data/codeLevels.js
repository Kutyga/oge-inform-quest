// Уровни для тренажёра написания кода (тема 16, интерпретируются utils/pyInterpreter.js).

export const CODE_LEVELS = [
  {
    id: 1,
    title: "Максимум кратных 5",
    description: "Дано: сначала количество чисел N, затем N натуральных чисел. Среди них всегда есть хотя бы одно, кратное 5. Напиши программу, которая выведет наибольшее число, кратное 5.",
    example: { input: [4, 10, 25, 7, 30], output: [30] },
    hidden: [
      { input: [3, 12, 45, 9], output: [45] },
      { input: [5, 20, 20, 15, 3, 40], output: [40] },
    ],
    starter: "n = int(input())\n# твой код\n",
    solution: "n = int(input())\nm = -1\ni = 0\nwhile i < n:\n    x = int(input())\n    if x % 5 == 0:\n        if x > m:\n            m = x\n    i = i + 1\nprint(m)",
  },
  {
    id: 2,
    title: "Сумма кратных 7",
    description: "Вводятся натуральные числа, ввод заканчивается числом 0 (само 0 в сумму не входит). Напиши программу, которая выведет сумму всех введённых чисел, кратных 7.",
    example: { input: [14, 9, 21, 5, 0], output: [35] },
    hidden: [
      { input: [7, 7, 7, 3, 0], output: [21] },
      { input: [100, 49, 2, 0], output: [49] },
    ],
    starter: "s = 0\nx = int(input())\nwhile x != 0:\n    # твой код\n    x = int(input())\nprint(s)",
    solution: "s = 0\nx = int(input())\nwhile x != 0:\n    if x % 7 == 0:\n        s = s + x\n    x = int(input())\nprint(s)",
  },
  {
    id: 3,
    title: "Количество чисел, оканчивающихся на 8",
    description: "Вводятся натуральные числа, ввод заканчивается числом 0. Напиши программу, которая выведет количество введённых чисел, оканчивающихся цифрой 8.",
    example: { input: [18, 28, 33, 8, 0], output: [3] },
    hidden: [
      { input: [8, 118, 5, 0], output: [2] },
      { input: [19, 29, 39, 0], output: [0] },
    ],
    starter: "c = 0\nx = int(input())\nwhile x != 0:\n    # твой код\n    x = int(input())\nprint(c)",
    solution: "c = 0\nx = int(input())\nwhile x != 0:\n    if x % 10 == 8:\n        c = c + 1\n    x = int(input())\nprint(c)",
  },
  {
    id: 4,
    title: "Сумма и разность знаков",
    description: "Вводятся целые числа, ввод заканчивается числом 0. Напиши программу, которая выведет два числа: сумму всех введённых чисел, а затем разность количества положительных и количества отрицательных чисел.",
    example: { input: [5, -3, 10, -1, -1, 0], output: [10, -1] },
    hidden: [],
    starter: "s = 0\npos = 0\nneg = 0\nx = int(input())\nwhile x != 0:\n    # твой код\n    x = int(input())\nprint(s)\nprint(pos - neg)",
    solution: "s = 0\npos = 0\nneg = 0\nx = int(input())\nwhile x != 0:\n    s = s + x\n    if x > 0:\n        pos = pos + 1\n    if x < 0:\n        neg = neg + 1\n    x = int(input())\nprint(s)\nprint(pos - neg)",
  },
  {
    id: 5,
    title: "Сумма по двум условиям",
    description: "Вводятся натуральные числа, ввод заканчивается числом 0. Напиши программу, которая выведет сумму чисел, которые одновременно кратны 3 И оканчиваются цифрой 9.",
    example: { input: [9, 39, 30, 19, 0], output: [48] },
    hidden: [
      { input: [99, 9, 3, 0], output: [108] },
      { input: [19, 29, 3, 0], output: [0] },
    ],
    starter: "s = 0\nx = int(input())\nwhile x != 0:\n    # твой код\n    x = int(input())\nprint(s)",
    solution: "s = 0\nx = int(input())\nwhile x != 0:\n    if x % 3 == 0 and x % 10 == 9:\n        s = s + x\n    x = int(input())\nprint(s)",
  },
  {
    id: 6,
    title: "Количество чётных, кратных 5",
    description: "Вводятся натуральные числа, ввод заканчивается числом 0. Напиши программу, которая выведет количество чисел, которые одновременно чётные И кратны 5.",
    example: { input: [10, 15, 20, 7, 0], output: [2] },
    hidden: [
      { input: [30, 45, 60, 0], output: [2] },
      { input: [5, 15, 25, 0], output: [0] },
    ],
    starter: "c = 0\nx = int(input())\nwhile x != 0:\n    # твой код\n    x = int(input())\nprint(c)",
    solution: "c = 0\nx = int(input())\nwhile x != 0:\n    if x % 2 == 0 and x % 5 == 0:\n        c = c + 1\n    x = int(input())\nprint(c)",
  },
  {
    id: 7,
    title: "Сумма кратных 4, оканчивающихся на 8",
    description: "Вводятся натуральные числа, ввод заканчивается числом 0. Напиши программу, которая выведет сумму чисел, кратных 4 И оканчивающихся цифрой 8.",
    example: { input: [8, 48, 18, 28, 0], output: [84] },
    hidden: [
      { input: [4, 8, 12, 0], output: [8] },
      { input: [18, 38, 58, 0], output: [0] },
    ],
    starter: "s = 0\nx = int(input())\nwhile x != 0:\n    # твой код\n    x = int(input())\nprint(s)",
    solution: "s = 0\nx = int(input())\nwhile x != 0:\n    if x % 4 == 0 and x % 10 == 8:\n        s = s + x\n    x = int(input())\nprint(s)",
  },
];
