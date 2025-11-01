import * as acorn from "acorn";

/**
 * Simple JavaScript interpreter that executes code step by step
 * and tracks variable states at each step
 */
class CodeInterpreter {
  constructor() {
    this.steps = [];
    this.variables = {};
  }

  /**
   * Parse and execute JavaScript code line by line
   * @param {string} code - The JavaScript code to execute
   * @returns {Array} - Array of execution steps with variable states
   */
  execute(code) {
    try {
      // Reset state
      this.steps = [];
      this.variables = {};

      // Add initial step
      this.steps.push({
        line: -1,
        lineNumber: 0,
        lineContent: "Program Start",
        variables: {},
        description: "Program execution begins",
        type: "start",
      });

      // Split code into lines
      const lines = code.split("\n").filter((line) => line.trim() !== "");

      // Process each line
      lines.forEach((line, index) => {
        this.executeLine(line.trim(), index);
      });

      // Add final step
      this.steps.push({
        line: lines.length,
        lineNumber: lines.length + 1,
        lineContent: "Program End",
        variables: { ...this.variables },
        description: "Program execution complete",
        type: "end",
      });
      console.log(this.steps)

      return {
        success: true,
        steps: this.steps,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        steps: this,
        steps,
      };
    }
  }

  /**
   * Execute a single line of code
   * @param {string} line - The line to execute
   * @param {number} lineIndex - Index of the line
   */

  executeLine(line, lineIndex) {
    // Skip empty lines and comments
    if (!line || line.startsWith("//") || line.startsWith("/*")) {
      return;
    }

    try {
      // Match variable declarations: let, const, var
      const declarationMatch = line.match(
        /^(let|const|var)\s+(\w+)\s*=\s*(.+?);?$/
      );

      if (declarationMatch) {
        const [, keyword, varName, expression] = declarationMatch;
        const value = this.evaluateExpression(expression);

        this.variables[varName] = value;

        this.steps.push({
          line: lineIndex,
          lineNumber: lineIndex + 1,
          lineContent: line,
          variables: { ...this.variables },
          description: `Declared '${varName}' with value ${this.formatValue(
            value
          )}`,
          type: "declaration",
          variable: varName,
          value: value,
        });
        return;
      }

      //   Match reassignements: x = value
      const assignmentMatch = line.match(/^(\w+)\s*=\s*(.+?);?$/);

      if (assignmentMatch) {
        const [, varName, expression] = assignmentMatch;

        if (!this.variables.hasOwnProperty(varName)) {
          throw new Error(`Variable '${varName}' is not defined`);
        }

        const value = this.evaluateExpression(expression);
        this.variables[varName] = value;

        this.steps.push({
          line: lineIndex,
          lineNumber: lineIndex + 1,
          lineContent: line,
          variables: { ...this.variables },
          description: `Updated '${varName}' to ${this.formatValue(value)}`,
          type: "assignment",
          variable: varName,
          value: value,
        });
        return 
      }

      // If we can't parse it, add it as an unsupported step
      this.steps.push({
        line: lineIndex,
        lineNumber: lineIndex + 1,
        lineContent: line,
        variables: { ...this.variables },
        description: `Unsupported syntax: ${line}`,
        type: 'unsupported'
      });
    } catch (error) {
           this.steps.push({
        line: lineIndex,
        lineNumber: lineIndex + 1,
        lineContent: line,
        variables: { ...this.variables },
        description: `Error: ${error.message}`,
        type: 'error',
        error: error.message
      });
    }
  }

   /**
   * Evaluate an expression in the context of current variables
   * @param {string} expression - The expression to evaluate
   * @returns {*} - The result of the evaluation
   */
  evaluateExpression(expression){
    try {
        // Remove semicolon
        expression = expression.replace(/;$/, '').trim()

        // Handle string literals
        if(expression.startsWith(' " ') || expression.startsWith(" ' ") || expression.startsWith(" ` ")){
            return expression.slice(1, -1)
        }

        // Handle array literals
        if (expression.startsWith['['] && expression.endsWith(']')){
            const arrayContent = expression.slice(1, -1)
            if (arrayContent.trim() === '') return []

            return arrayContent.split(",").map(item => {
                const trimmed = item.trim()
                // To handle ["1", " a", " 3+2"] etc
                return this.evaluateExpression(trimmed)
            })
        }

        // Handle object literals
        if (expression.startsWith('{') && expression.endsWith('}')){
            return expression
        }

        // Handle numbers
        if (!isNaN(expression) && expression.trim() !== ''){
            return Number(expression)
        }

        // Handle boolean literals 
        if(expression === 'true') return true
        if(expression === 'false') return false
        if(expression === 'null') return null
        if(expression === 'undefined') return undefined

        // Handle variable references and expressions
        // Create a function with variable names as parameters
        const varNames = Object.keys(this.variables)
        const varValues = Object.values(this.variables)

        // Create a safe evaluation function
        const func = new Function(...varNames, `'use strict'; return (${expression});`)
        return func(...varValues)


    } catch (error) {
        // If evaluation fails, return the expression as a string
        return expression
    }
  }

   /**
   * Format a value for display
   * @param {*} value - The value to format
   * @returns {string} - Formatted string representation
   */
  formatValue(value){
    if (typeof value === 'string'){
        return `"${value}`
    }
    if (Array.isArray(value)){
        return `[${value.map(v=>this.formatValue(v)).join(', ')}]`
    }
    if (typeof value === 'object' && value !== null){
        return JSON.stringify(value)
    }
    return String(value)
  }

   /**
   * Get current execution steps
   * @returns {Array} - Array of execution steps
   */
  getSteps(){
    return this.steps
  }

  /**
   * Get current variables
   * @returns {Object} - Current variable state
   */
  getVariables(){
    return {...this.variables}
  }
}

export default CodeInterpreter
