import React from 'react';

/**
 * CodeEditor Component
 * A simple code editor with line numbers and syntax highlighting
 */
const CodeEditor = ({ code, onChange, currentLine, disabled }) => {
  const lines = code.split('\n');

  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Code Editor</h2>
      </div>

      {/* Editor Container */}
      <div className="relative">
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-14 bg-slate-900 text-slate-500 text-sm font-mono select-none overflow-hidden">
          <div className="py-3 px-2">
            {lines.map((_, index) => (
              <div
                key={index}
                className={`h-6 flex items-center justify-end pr-3 transition-colors ${
                  currentLine === index
                    ? 'bg-yellow-500 text-slate-900 font-bold'
                    : 'hover:bg-slate-800'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Code Textarea */}
        <textarea
          value={code}
          onChange={handleChange}
          disabled={disabled}
          spellCheck="false"
          className={`w-full h-96 bg-slate-900 text-green-400 font-mono text-sm p-3 pl-16 
            focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none
            ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-text'}
          `}
          placeholder="// Write your JavaScript code here..."
        />
      </div>

      {/* Footer with helpful tips */}
      <div className="bg-slate-900 px-4 py-2 border-t border-slate-700 text-xs text-slate-400">
        <span className="mr-4">✨ Tip: Use let, const, or var for variables</span>
        <span>📝 Example: let x = 5;</span>
      </div>
    </div>
  );
};

export default CodeEditor;