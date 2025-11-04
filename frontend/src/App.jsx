import React, { useState, useRef, useEffect } from "react";
import CodeEditor from "./components/CodeEditor";
import ControlPanel from "./components/ControlPanel";
import VisualizationPanel from "./components/VisualizationPanel";
import CodeInterpreter from "./utils/interpreter";
import ExamplesPanel from "./components/ExamplesPanel";

function App() {
  // Sample code to start with
  const initialCode = `let x = 5;\nlet y = 10;\nlet sum = x + y;\nlet message = "Hello World";\nlet numbers = [1, 2, 3, 4, 5];`;

  // State management
  const [code, setCode] = useState(initialCode);
  const [executionSteps, setExecutionSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    if (executionSteps.length === 0) {
      // Steps not ready yet - wait for them
      return;
    }
    // Start play
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Code Visualizer
          </h1>
          <p className="text-purple-200 text-lg">
            Step through your code and watch variables come to life! ✨
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900 border-2 border-red-500 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-200">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-semibold">Execution Error</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Code Editor (takes 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            <CodeEditor
              code={code}
              onChange={setCode}
              currentLine={currentLine}
              disabled={isRunning}
            />

            <ControlPanel
              onPrevious={handlePrevious}
              onNext={handleNext}
              onRun={handleRun}
              onReset={handleReset}
              isRunning={isRunning}
              canGoPrevious={currentStep > 0}
              canGoNext={currentStep < executionSteps.length - 1}
              currentStep={currentStep}
              totalSteps={
                executionSteps.length > 0 ? executionSteps.length - 1 : 0
              }
            />
          </div>

          {/* Right Column - Visualization */}
          <div className="lg:col-span-1">
            <VisualizationPanel
              currentStep={currentStep}
              stepData={currentStepData}
            />
          </div>
        </div>
        
        <ExamplesPanel
          onSelectExample={(exampleCode) => {
            setCode(exampleCode);
            handleReset();
          }}
        />
        {/* Instructions Footer */}
        <div className="mt-8 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            How to Use 📚
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <div className="flex gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <div className="font-semibold text-purple-300">Write Code</div>
                <div className="text-sm">
                  Type JavaScript code in the editor (supports let, const, var)
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <div className="font-semibold text-purple-300">
                  Step Through
                </div>
                <div className="text-sm">
                  Use Next/Previous to navigate line by line
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <div className="font-semibold text-purple-300">Auto Run</div>
                <div className="text-sm">
                  Click Run to automatically execute all steps
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <div className="font-semibold text-purple-300">
                  Watch Variables
                </div>
                <div className="text-sm">
                  See variables update in real-time on the right panel
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
