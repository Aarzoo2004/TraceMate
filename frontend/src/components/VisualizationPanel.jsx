import React from 'react';

const VisualizationPanel = ({ currentStep, stepData, isDarkMode }) => {
  if (!stepData) {
    return (
      <div className={`h-full flex flex-col ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className={`px-6 py-3 border-b ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-xs font-semibold uppercase tracking-wide ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Visualization
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">👨‍💻</div>
            <div className={`text-lg font-semibold ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>
              Ready to visualize
            </div>
            <div className={`text-sm mt-2 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Click "Next" or "Run" to start execution
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { lineContent, description, variables, type, variable, value, consoleOutput, callStack } = stepData;
  const variableEntries = Object.entries(variables);

  return (
    <div className={`h-full flex flex-col overflow-hidden ${
      isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
    }`}>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4">
          {/* Current Step Info */}
          <div className={`rounded-lg border shadow-sm p-5 ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Step {currentStep}
                </div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  {description}
                </h3>
                {lineContent && lineContent !== 'Program Start' && lineContent !== 'Program End' && !lineContent.startsWith('Line') && (
                  <div className={`rounded p-3 mt-3 ${
                    isDarkMode ? 'bg-slate-900' : 'bg-slate-100'
                  }`}>
                    <code className={`text-sm font-mono ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {lineContent}
                    </code>
                  </div>
                )}
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Call Stack */}
          {callStack && callStack.length > 0 && (
            <div className={`rounded-lg border shadow-sm p-5 ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-xs font-bold mb-3 uppercase tracking-wide ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Call Stack
              </h3>
              <div className="space-y-2">
                {callStack.map((func, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded ${
                      idx === 0
                        ? 'border-l-4 border-green-500 bg-green-500/20'
                        : isDarkMode
                          ? 'border-l-4 border-slate-600 bg-slate-900'
                          : 'border-l-4 border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className={`font-mono text-sm ${
                      idx === 0
                        ? isDarkMode ? 'text-slate-100 font-semibold' : 'text-slate-800 font-semibold'
                        : isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {func}()
                    </div>
                    <div className={`text-xs mt-1 ${
                      idx === 0
                        ? isDarkMode ? 'text-slate-300' : 'text-slate-600'
                        : isDarkMode ? 'text-slate-500' : 'text-slate-500'
                    }`}>
                      {idx === 0 ? 'Active' : 'Waiting'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Console Output */}
          {consoleOutput && consoleOutput.length > 0 && (
            <div className={`rounded-lg border shadow-sm p-5 ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-xs font-bold mb-3 uppercase tracking-wide ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Console Output
              </h3>
              <div className="bg-slate-900 rounded p-3 font-mono text-sm text-green-400 max-h-32 overflow-y-auto">
                {consoleOutput.map((output, idx) => (
                  <div key={idx} className="mb-1">
                    &gt; {output}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variables Section */}
          <div className={`rounded-lg border shadow-sm p-5 ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xs font-bold uppercase tracking-wide ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Variables
              </h3>
              <span className={`text-xs ${
                isDarkMode ? 'text-slate-500' : 'text-slate-500'
              }`}>
                {variableEntries.length} variable{variableEntries.length !== 1 ? 's' : ''}
              </span>
            </div>

            {variableEntries.length === 0 ? (
              <div className={`italic text-center py-4 text-sm ${
                isDarkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
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
                          ? 'bg-green-500/20 border-2 border-green-500' 
                          : isDarkMode
                            ? 'bg-slate-900 border border-slate-700'
                            : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-mono font-semibold ${
                              isDarkMode ? 'text-slate-200' : 'text-slate-700'
                            }`}>
                              {key}
                            </span>
                            {isJustChanged && (
                              <span className="text-xs bg-green-500 text-slate-900 px-2 py-0.5 rounded-full font-semibold">
                                UPDATED
                              </span>
                            )}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-slate-500' : 'text-slate-500'
                          }`}>
                            Type: {getValueType(val)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-mono font-semibold break-all max-w-xs ${
                            isJustChanged 
                              ? 'text-green-400' 
                              : isDarkMode ? 'text-slate-300' : 'text-slate-800'
                          }`}>
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
            <div className={`rounded-lg border shadow-sm p-5 ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-xs font-bold mb-3 uppercase tracking-wide ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Array Visualization
              </h3>
              <div className="space-y-3">
                {variableEntries
                  .filter(([, val]) => Array.isArray(val))
                  .map(([key, arr]) => (
                    <div key={key}>
                      <div className={`text-sm font-mono mb-2 font-semibold ${
                        isDarkMode ? 'text-slate-200' : 'text-slate-700'
                      }`}>
                        {key}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {arr.map((item, idx) => (
                          <div
                            key={idx}
                            className={`border rounded p-2 min-w-[60px] text-center ${
                              isDarkMode
                                ? 'bg-slate-900 border-slate-600'
                                : 'bg-slate-50 border-slate-300'
                            }`}
                          >
                            <div className={`text-xs mb-1 ${
                              isDarkMode ? 'text-slate-500' : 'text-slate-500'
                            }`}>
                              [{idx}]
                            </div>
                            <div className={`text-sm font-mono font-semibold ${
                              isDarkMode ? 'text-slate-200' : 'text-slate-800'
                            }`}>
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
    if (value.type === 'arrow-function' || value.type === 'ArrowFunctionExpression') {
      const params = value.params.map(p => p.name).join(', ');
      return `(${params}) => {...}`;
    }
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
