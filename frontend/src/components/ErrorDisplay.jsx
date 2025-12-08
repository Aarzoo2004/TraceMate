import React from 'react';
import { AlertTriangle, XCircle, Info } from 'lucide-react';

const ErrorDisplay = ({ error, onDismiss, isDarkMode }) => {
  if (!error) return null;

  const getErrorDetails = (errorMessage) => {
    if (errorMessage.includes('is not defined')) {
      const match = errorMessage.match(/Variable '(.+)' is not defined/);
      const varName = match ? match[1] : 'variable';
      return {
        type: 'Reference Error',
        message: errorMessage,
        hint: `Make sure you declare '${varName}' using let, const, or var before using it.`,
        example: `let ${varName} = ...;`
      };
    }

    if (errorMessage.includes('Infinite loop')) {
      return {
        type: 'Loop Error',
        message: errorMessage,
        hint: 'Your loop condition never becomes false. Check your loop logic.',
        example: 'for (let i = 0; i < 10; i++) { ... }'
      };
    }

    if (errorMessage.includes('Syntax Error')) {
      return {
        type: 'Syntax Error',
        message: errorMessage,
        hint: 'There\'s a problem with how your code is written. Check for missing semicolons, brackets, or quotes.',
        example: null
      };
    }

    if (errorMessage.includes('is not a function')) {
      return {
        type: 'Type Error',
        message: errorMessage,
        hint: 'You\'re trying to call something that isn\'t a function. Check the variable type.',
        example: null
      };
    }

    return {
      type: 'Runtime Error',
      message: errorMessage,
      hint: 'Something went wrong during execution.',
      example: null
    };
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className={`mb-6 rounded-lg p-5 shadow-lg border-2 ${
      isDarkMode
        ? 'bg-red-900/20 border-red-500'
        : 'bg-red-50 border-red-300'
    }`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <XCircle className="text-red-500" size={28} />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Error Type */}
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-bold flex items-center gap-2 ${
              isDarkMode ? 'text-red-300' : 'text-red-800'
            }`}>
              <AlertTriangle size={18} />
              {errorDetails.type}
            </h3>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`transition text-xl font-bold ${
                  isDarkMode
                    ? 'text-red-400 hover:text-red-300'
                    : 'text-red-600 hover:text-red-800'
                }`}
                title="Dismiss"
              >
                ×
              </button>
            )}
          </div>

          {/* Error Message */}
          <div className={`rounded p-3 mb-3 border ${
            isDarkMode
              ? 'bg-red-950/50 border-red-700'
              : 'bg-red-100 border-red-200'
          }`}>
            <code className={`text-sm font-mono ${
              isDarkMode ? 'text-red-200' : 'text-red-800'
            }`}>
              {errorDetails.message}
            </code>
          </div>

          {/* Hint */}
          {errorDetails.hint && (
            <div className={`border rounded p-3 mb-2 ${
              isDarkMode
                ? 'bg-yellow-900/20 border-yellow-600'
                : 'bg-yellow-50 border-yellow-300'
            }`}>
              <div className="flex items-start gap-2">
                <Info size={16} className={`flex-shrink-0 mt-0.5 ${
                  isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
                }`} />
                <div>
                  <div className={`text-sm font-semibold mb-1 ${
                    isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
                  }`}>
                    💡 Hint:
                  </div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-yellow-200' : 'text-yellow-900'
                  }`}>
                    {errorDetails.hint}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Example */}
          {errorDetails.example && (
            <div className={`rounded p-3 border ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-slate-100 border-slate-300'
            }`}>
              <div className={`text-xs mb-1 font-semibold ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Example:
              </div>
              <code className={`text-sm font-mono ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>
                {errorDetails.example}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;