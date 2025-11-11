import React from 'react';
import { AlertTriangle, XCircle, Info } from 'lucide-react';

const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;

  const getErrorDetails = (errorMessage) => {
    // Parse common errors and provide helpful hints
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
    <div className="mb-6 bg-red-900 border-2 border-red-500 rounded-lg p-6 shadow-xl animate-shake">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <XCircle className="text-red-300" size={32} />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Error Type */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-red-200 flex items-center gap-2">
              <AlertTriangle size={20} />
              {errorDetails.type}
            </h3>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-300 hover:text-white transition"
                title="Dismiss"
              >
                ✕
              </button>
            )}
          </div>

          {/* Error Message */}
          <div className="bg-red-950 rounded p-3 mb-3">
            <code className="text-red-200 text-sm font-mono">
              {errorDetails.message}
            </code>
          </div>

          {/* Hint */}
          {errorDetails.hint && (
            <div className="bg-yellow-900 border border-yellow-600 rounded p-3 mb-2">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-yellow-300 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-yellow-200 text-sm font-semibold mb-1">
                    💡 Hint:
                  </div>
                  <div className="text-yellow-100 text-sm">
                    {errorDetails.hint}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Example */}
          {errorDetails.example && (
            <div className="bg-slate-900 rounded p-3">
              <div className="text-slate-400 text-xs mb-1">Example:</div>
              <code className="text-green-400 text-sm font-mono">
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