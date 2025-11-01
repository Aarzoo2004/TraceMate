import React from 'react';
import { SkipBack, SkipForward, Play, RotateCcw, Pause } from 'lucide-react';

/**
 * ControlPanel Component
 * Contains buttons to control code execution
 */
const ControlPanel = ({
  onPrevious,
  onNext,
  onRun,
  onReset,
  isRunning,
  canGoPrevious,
  canGoNext,
  currentStep,
  totalSteps
}) => {
  console.log(currentStep)
  console.log(isRunning)
  console.log(canGoNext)
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4">
      {/* Step Counter */}
      <div className="mb-4 text-center">
        <div className="text-sm text-slate-400 mb-1">Execution Step</div>
        <div className="text-2xl font-bold text-white">
          {currentStep} / {totalSteps}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Previous Button */}
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious || isRunning}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 
            disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50
            text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200
            transform hover:scale-105 active:scale-95"
          title="Go to previous step"
        >
          <SkipBack size={20} />
          <span>Previous</span>
        </button>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={!canGoNext || isRunning}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 
            disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50
            text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200
            transform hover:scale-105 active:scale-95"
          title="Go to next step"
        >
          <span>Next</span>
          <SkipForward size={20} />
        </button>

        {/* Run Button */}
        <button
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 
            disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50
            text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200
            transform hover:scale-105 active:scale-95"
          title="Auto-run through all steps"
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          <span>{isRunning ? 'Running...' : 'Run'}</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 
            disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50
            text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200
            transform hover:scale-105 active:scale-95"
          title="Reset to beginning"
        >
          <RotateCcw size={20} />
          <span>Reset</span>
        </button>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 text-center">
        {isRunning && (
          <div className="flex items-center justify-center gap-2 text-purple-400">
            <div className="animate-pulse">●</div>
            <span className="text-sm">Executing...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;