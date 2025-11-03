import React from 'react';

const VisualizationPanel = ({ currentStep, stepData }) => {
  if (!stepData) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Visualization</h2>
        <div className="flex items-center justify-center h-96 text-slate-400">
          <div className="text-center">
            <div className="text-6xl mb-4">👨‍💻</div>
            <div className="text-lg">Click "Next" or "Run" to start</div>
            <div className="text-sm mt-2">Watch your code come to life!</div>
          </div>
        </div>
      </div>
    );
  }

  const { lineContent, description, variables, type, variable, value, consoleOutput, callStack } = stepData;
  const variableEntries = Object.entries(variables);

  // Get step color based on type
  const getStepColor = () => {
    switch (type) {
      case 'error': return 'bg-red-900 border-red-500';
      case 'start': return 'bg-blue-900 border-blue-500';
      case 'end': return 'bg-green-900 border-green-500';
      case 'function-call': return 'bg-indigo-900 border-indigo-500';
      case 'function-return': return 'bg-teal-900 border-teal-500';
      case 'condition': return 'bg-yellow-900 border-yellow-500';
      case 'loop': return 'bg-orange-900 border-orange-500';
      case 'console': return 'bg-cyan-900 border-cyan-500';
      default: return 'bg-purple-900 border-purple-500';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden h-full">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Visualization</h2>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Current Step Info */}
        <div className={`rounded-lg p-4 border-2 ${getStepColor()}`}>
          <div className="text-sm text-slate-300 mb-1">
            Step {currentStep}
          </div>
          <div className="text-white font-semibold text-lg mb-2">
            {description}
          </div>
          {lineContent && lineContent !== 'Program Start' && lineContent !== 'Program End' && !lineContent.startsWith('Line') && (
            <div className="bg-slate-900 rounded p-2 mt-2">
              <code className="text-green-400 text-sm font-mono">
                {lineContent}
              </code>
            </div>
          )}
        </div>

        {/* Call Stack */}
        {callStack && callStack.length > 0 && (
          <div className="bg-slate-900 rounded-lg p-4 border border-indigo-500">
            <h3 className="text-lg font-semibold text-indigo-300 mb-2 flex items-center gap-2">
              <span>📚</span> Call Stack
            </h3>
            <div className="space-y-1">
              {callStack.map((func, idx) => (
                <div key={idx} className="bg-indigo-900 rounded p-2 text-indigo-200 font-mono text-sm">
                  {idx + 1}. {func}()
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Console Output */}
        {consoleOutput && consoleOutput.length > 0 && (
          <div className="bg-slate-900 rounded-lg p-4 border border-cyan-500">
            <h3 className="text-lg font-semibold text-cyan-300 mb-2 flex items-center gap-2">
              <span>💬</span> Console Output
            </h3>
            <div className="bg-black rounded p-3 font-mono text-sm text-green-400 max-h-32 overflow-y-auto">
              {consoleOutput.map((output, idx) => (
                <div key={idx} className="mb-1">
                  &gt; {output}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variables Section */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
              <span>📦</span> Variables
            </h3>
            <span className="text-sm text-slate-400">
              {variableEntries.length} variable{variableEntries.length !== 1 ? 's' : ''}
            </span>
          </div>

          {variableEntries.length === 0 ? (
            <div className="text-slate-400 italic text-center py-4">
              No variables yet
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {variableEntries.map(([key, val]) => {
                const isJustChanged = variable === key;
                
                return (
                  <div
                    key={key}
                    className={`rounded p-3 transition-all duration-300 ${
                      isJustChanged 
                        ? 'bg-yellow-500 bg-opacity-20 border-2 border-yellow-500 scale-105' 
                        : 'bg-slate-800 border border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-blue-400 font-mono font-semibold">
                            {key}
                          </span>
                          {isJustChanged && (
                            <span className="text-xs bg-yellow-500 text-slate-900 px-2 py-0.5 rounded-full font-semibold">
                              UPDATED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          Type: {getValueType(val)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-300 font-mono font-semibold break-all max-w-xs">
                          {formatValue(val)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Array Visualization */}
        {variableEntries.some(([, val]) => Array.isArray(val)) && (
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
              <span>📊</span> Array Visualization
            </h3>
            <div className="space-y-3">
              {variableEntries
                .filter(([, val]) => Array.isArray(val))
                .map(([key, arr]) => (
                  <div key={key}>
                    <div className="text-blue-400 font-mono text-sm mb-2">{key}</div>
                    <div className="flex gap-2 flex-wrap">
                      {arr.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-800 border border-purple-500 rounded p-2 min-w-[60px] text-center"
                        >
                          <div className="text-xs text-slate-400 mb-1">[{idx}]</div>
                          <div className="text-yellow-300 font-mono font-semibold text-sm">
                            {formatValue(item)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getValueType = (value) => {
  if (Array.isArray(value)) return 'Array';
  if (value === null) return 'null';
  if (typeof value === 'object') return 'Object';
  return typeof value;
};

const formatValue = (value) => {
  if (typeof value === 'string') return `"${value}"`;
  if (Array.isArray(value)) {
    if (value.length > 5) {
      return `[${value.slice(0, 5).map(v => formatValue(v)).join(', ')}, ...]`;
    }
    return `[${value.map(v => formatValue(v)).join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value);
    if (entries.length > 3) {
      return `{${entries.slice(0, 3).map(([k, v]) => `${k}: ${formatValue(v)}`).join(', ')}, ...}`;
    }
    return JSON.stringify(value);
  }
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  return String(value);
};

export default VisualizationPanel;