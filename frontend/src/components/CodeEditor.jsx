import React from 'react';

const CodeEditor = ({ code, onChange, currentLine, disabled, isDarkMode }) => {
  const lines = code.split('\n');

  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`flex flex-col h-full ${
      isDarkMode 
        ? 'bg-slate-900 border-r border-slate-700' 
        : 'bg-white border-r border-slate-200'
    }`}>
      {/* Header */}
      <div className={`px-6 py-3 border-b ${
        isDarkMode
          ? 'bg-slate-800 border-slate-700'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <h2 className={`text-xs font-semibold uppercase tracking-wide ${
          isDarkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Source Code
        </h2>
      </div>

      {/* Editor Container */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className={`text-xs font-mono px-3 py-4 select-none border-r ${
          isDarkMode
            ? 'bg-slate-800 text-slate-400 border-slate-700'
            : 'bg-slate-100 text-slate-500 border-slate-200'
        } overflow-hidden`}>
          {lines.map((_, index) => (
            <div
              key={index}
              className={`h-6 flex items-center justify-end transition-colors ${
                currentLine === index
                  ? 'bg-green-500 text-slate-900 font-bold px-2 -mx-2'
                  : isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          value={code}
          onChange={handleChange}
          disabled={disabled}
          spellCheck="false"
          className={`flex-1 font-mono text-sm p-4 
            focus:outline-none focus:ring-2 focus:ring-green-500 resize-none
            ${isDarkMode 
              ? 'bg-slate-900 text-slate-100' 
              : 'bg-white text-slate-800'
            }
            ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-text'}
          `}
          placeholder="// Write your JavaScript code here..."
        />
      </div>

      {/* Footer with helpful tips */}
      <div className={`px-6 py-2 border-t flex items-center justify-between text-xs ${
        isDarkMode
          ? 'bg-slate-800 border-slate-700 text-slate-400'
          : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}>
        <span>✨ Tip: Use let, const, or var for variables</span>
        <span>{lines.length} lines</span>
      </div>
    </div>
  );
};

export default CodeEditor;