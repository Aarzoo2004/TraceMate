import React, { useState, useRef, useEffect } from "react";
import { Code, Moon, Sun } from 'lucide-react';
import CodeEditor from "./components/CodeEditor";
import ControlPanel from "./components/ControlPanel";
import VisualizationPanel from "./components/VisualizationPanel";
import CodeInterpreter from "./utils/interpreter";
import ExamplesPanel from "./components/ExamplesPanel";
import ErrorDisplay from './components/ErrorDisplay';

function App() {
  // Sample code to start with
  const initialCode = `let x = 5;\nlet y = 10;\nlet sum = x + y;\nlet message = "Hello World";\nlet numbers = [1, 2, 3, 4, 5];`;

  // State management
  const [code, setCode] = useState(initialCode);
  const [executionSteps, setExecutionSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Ref for auto-run interval
  const runIntervalRef = useRef(null);

  // Create interpreter instance
  const interpreterRef = useRef(new CodeInterpreter());

  // Handle code execution
  const executeCode = () => {
    setError("");
    const result = interpreterRef.current.execute(code);

    if (result.success) {
      setExecutionSteps(result.steps);
      setCurrentStep(0);
      return true;
    } else {
      setError(result.error);
      setExecutionSteps(result.steps);
      setCurrentStep(0);
      return false;
    }
  };

  // Control handlers
  const handleNext = () => {
    if (executionSteps.length === 0) {
      executeCode();
      return;
    }

    if (currentStep < executionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRun = () => {
    if (executionSteps.length === 0) {
      if (!executeCode()) return;
    }

    setIsRunning(true);
  };

  // Handle Jump to End
  const handleJumpToEnd = () => {
    if (executionSteps.length === 0) {
      if (!executeCode()) return;
      setTimeout(() => {
        setCurrentStep(interpreterRef.current.steps.length - 1);
      }, 0);
    } else {
      setCurrentStep(executionSteps.length - 1);
    }
  };

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    if (executionSteps.length === 0) {
      return;
    }

    let step = 0;
    setCurrentStep(0);

    runIntervalRef.current = setInterval(() => {
      step++;
      if (step >= executionSteps.length) {
        clearInterval(runIntervalRef.current);
        setIsRunning(false);
        setCurrentStep(executionSteps.length - 1);
      } else {
        setCurrentStep(step);
      }
    }, 1000);

    return () => clearInterval(runIntervalRef.current);
  }, [isRunning, executionSteps]);

  const handleReset = () => {
    if (runIntervalRef.current) {
      clearInterval(runIntervalRef.current);
    }
    setIsRunning(false);
    setCurrentStep(0);
    setExecutionSteps([]);
    setError("");
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (runIntervalRef.current) {
        clearInterval(runIntervalRef.current);
      }
    };
  }, []);

  // Get current step data
  const currentStepData = executionSteps[currentStep];
  const currentLine = currentStepData ? currentStepData.line : -1;

  return (
    <div className={`h-screen flex overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold">TraceMate</h1>
              <p className="text-xs text-slate-400">Code Visualizer</p>
            </div>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="p-4 border-b border-slate-800">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <span>Dark Mode</span>
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>

        {/* Examples Panel in Sidebar - Shows ALL examples */}
        <div className="flex-1 overflow-y-auto">
          <ExamplesPanel
            onSelectExample={(exampleCode) => {
              setCode(exampleCode);
              handleReset();
            }}
          />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={`px-8 py-4 flex-shrink-0 ${
          isDarkMode 
            ? 'bg-slate-800 border-b border-slate-700' 
            : 'bg-white border-b border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                Code Editor
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                main.js
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></div>
                {error ? 'Error' : 'Ready'}
              </div>
              <button 
                onClick={handleRun}
                disabled={isRunning}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-lg text-sm transition-colors"
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </div>
        </header>

        {/* Error Display (if any) */}
        {error && (
          <div className="px-8 pt-4">
            <ErrorDisplay error={error} onDismiss={() => setError('')} isDarkMode={isDarkMode} />
          </div>
        )}

        {/* Main Grid: Code Editor + Visualization */}
        <div className="flex-1 grid grid-cols-2 overflow-hidden min-h-0">
          {/* Code Editor Section */}
          <CodeEditor
            code={code}
            onChange={setCode}
            currentLine={currentLine}
            disabled={isRunning}
            isDarkMode={isDarkMode}
          />

          {/* Visualization Section */}
          <VisualizationPanel
            currentStep={currentStep}
            stepData={currentStepData}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Control Panel Footer */}
        <ControlPanel
          onPrevious={handlePrevious}
          onNext={handleNext}
          onRun={handleRun}
          onReset={handleReset}
          onJumpToEnd={handleJumpToEnd}
          isRunning={isRunning}
          canGoPrevious={currentStep > 0}
          canGoNext={currentStep < executionSteps.length - 1}
          currentStep={currentStep}
          totalSteps={executionSteps.length > 0 ? executionSteps.length - 1 : 0}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
}

export default App;