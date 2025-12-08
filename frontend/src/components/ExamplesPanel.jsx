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
    title: 'Array Methods',
    code: `let nums = [1, 2, 3];\nnums.push(4);\nnums.pop();\nlet len = nums.length;\nconsole.log(nums);`
  },
  {
    title: 'Array Map',
    code: `let numbers = [1, 2, 3, 4];\nlet doubled = numbers.map(x => x * 2);\nconsole.log(doubled);`
  },
  {
    title: 'Array Filter',
    code: `let numbers = [1, 2, 3, 4, 5, 6];\nlet evens = numbers.filter(x => x % 2 === 0);\nconsole.log(evens);`
  },
  {
    title: 'String Methods',
    code: `let text = "Hello World";\nlet upper = text.toUpperCase();\nlet sub = text.substring(0, 5);\nlet len = text.length;\nconsole.log(upper);`
  },
  {
    title: 'Template Literals',
    code: `let name = "Alice";\nlet age = 25;\nlet message = \`Hello \${name}, you are \${age} years old\`;\nconsole.log(message);`
  },
  {
    title: 'Arrow Functions',
    code: `const add = (a, b) => a + b;\nconst square = x => x * x;\nlet result = add(5, 3);\nlet sq = square(4);\nconsole.log(result);`
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
    title: 'Complex Example',
    code: `let numbers = [1, 2, 3, 4, 5];\nlet doubled = numbers.map(x => x * 2);\nlet sum = doubled.reduce((acc, val) => acc + val, 0);\nconsole.log(\`Sum: \${sum}\`);`
  }
];

const ExamplesPanel = ({ onSelectExample }) => {
  return (
    <div className="p-4 border-t border-slate-800">
      <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
        <Code2 size={14} />
        Quick Examples
      </h3>
      <div className="space-y-2">
        {EXAMPLES.map((example, idx) => (
          <button
            key={idx}
            onClick={() => onSelectExample(example.code)}
            className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors"
          >
            {example.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamplesPanel;