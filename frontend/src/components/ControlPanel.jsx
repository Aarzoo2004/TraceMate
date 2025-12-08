import React from 'react';
import { SkipBack, SkipForward, Play, RotateCcw, Pause, SkipForwardIcon } from 'lucide-react';

const ControlPanel = ({
  onPrevious,
  onNext,
  onRun,
  onReset,
  onJumpToEnd,
  isRunning,
  canGoPrevious,
  canGoNext,
  currentStep,
  totalSteps,
  isDarkMode
}) => {
  return (
    <footer className={`px-8 py-4 border-t ${
      isDarkMode
        ? 'bg-slate-800 border-slate-700'
        : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-6">
        {/* Playback Controls */}
        <div className="flex gap-2">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious || isRunning}
            className={`p-2 rounded transition-colors ${
              isDarkMode
                ? 'hover:bg-slate-700 text-slate-300 hover:text-slate-100 disabled:text-slate-600'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800 disabled:text-slate-300'
            } disabled:cursor-not-allowed disabled:hover:bg-transparent`}
            title="Go to previous step"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={onRun}
            disabled={isRunning && currentStep >= totalSteps}
            className="p-3 bg-green-500 hover:bg-green-600 text-slate-900 rounded 
              disabled:bg-slate-300 disabled:cursor-not-allowed
              transition-colors"
            title={isRunning ? "Running..." : "Auto-run through all steps"}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <button
            onClick={onNext}
            disabled={!canGoNext || isRunning}
            className={`p-2 rounded transition-colors ${
              isDarkMode
                ? 'hover:bg-slate-700 text-slate-300 hover:text-100 disabled:text-slate-600'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800 disabled:text-slate-300'
            } disabled:cursor-not-allowed disabled:hover:bg-transparent`}
            title="Go to next step"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1">
          <div className={`flex items-center justify-between mb-1 text-xs ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            <span className="font-semibold">Step {currentStep} of {totalSteps}</span>
            {isRunning && (
              <span className={`flex items-center gap-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <span className="animate-pulse">●</span> Executing...
              </span>
            )}
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden ${
            isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
          }`}>
            <div 
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Jump to End Button */}
        <button
          onClick={onJumpToEnd}
          disabled={isRunning}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            isDarkMode
              ? 'bg-slate-600 hover:bg-slate-500 text-white disabled:bg-slate-700'
              : 'bg-slate-700 hover:bg-slate-800 text-white disabled:bg-slate-300'
          } disabled:cursor-not-allowed disabled:text-slate-500`}
          title="Jump to final output"
        >
          <SkipForwardIcon className="w-4 h-4" />
          Jump to End
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={isRunning}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            isDarkMode
              ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-700 disabled:text-slate-600'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100 disabled:text-slate-300'
          } disabled:cursor-not-allowed disabled:hover:bg-transparent`}
          title="Reset to beginning"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </footer>
  );
};

export default ControlPanel;