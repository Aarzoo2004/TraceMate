import React from 'react';
import { Code2 } from 'lucide-react';

const EXAMPLES = [
  {
    title: 'Variables & Math',
    code: `let x = 10;\nlet y = 20;\nlet sum = x + y;\nlet product = x * y;\nconsole.log(sum);`
  },
  {
    title: 'Arrays',
    code: `let numbers = [1, 2, 3, 4, 5];\nlet fruits = ["apple", "banana"];\nlet first = numbers[0];`
  },
  {
    title: 'Functions',
    code: `function add(a, b) {\n  let result = a + b;\n  return result;\n}\nlet answer = add(5, 3);\nconsole.log(answer);`
  },
  {
    title: 'Loops',
    code: `let sum = 0;\nfor (let i = 1; i <= 5; i++) {\n  sum = sum + i;\n}\nconsole.log(sum);`
  },
  {
    title: 'Conditionals',
    code: `let age = 18;\nif (age >= 18) {\n  let status = "adult";\n} else {\n  let status = "minor";\n}`
  },
  {
    title: 'While Loop',
    code: `let count = 0;\nwhile (count < 3) {\n  console.log(count);\n  count++;\n}`
  }
];

const ExamplesPanel = ({ onSelectExample }) => {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <Code2 size={20} />
        Code Examples
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {EXAMPLES.map((example, idx) => (
          <button
            key={idx}
            onClick={() => onSelectExample(example.code)}
            className="bg-slate-700 hover:bg-purple-600 text-white text-sm py-2 px-3 rounded transition-all duration-200 transform hover:scale-105"
          >
            {example.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamplesPanel;