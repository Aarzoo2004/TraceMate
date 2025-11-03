import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

/**
 * Enhanced JavaScript interpreter with support for functions, loops, and conditionals
 */
class CodeInterpreter {
  constructor() {
    this.steps = [];
    this.variables = {};
    this.scopes = [{}]; // Stack of scopes
    this.functions = {};
    this.consoleOutput = [];
    this.callStack = [];
  }

  /**
   * Parse and execute JavaScript code
   */
  execute(code) {
    try {
      // Reset state
      this.steps = [];
      this.variables = {};
      this.scopes = [{}];
      this.functions = {};
      this.consoleOutput = [];
      this.callStack = [];

      // Add initial step
      this.addStep({
        line: -1,
        lineNumber: 0,
        lineContent: 'Program Start',
        variables: {},
        description: 'Program execution begins',
        type: 'start',
        consoleOutput: [],
        callStack: []
      });

      // Parse code with Acorn
      let ast;
      try {
        ast = acorn.parse(code, { 
          ecmaVersion: 2020,
          locations: true 
        });
      } catch (parseError) {
        return {
          success: false,
          error: `Syntax Error: ${parseError.message}`,
          steps: this.steps
        };
      }

      // Execute the AST
      this.executeNode(ast);

      // Add final step
      this.addStep({
        line: code.split('\n').length,
        lineNumber: code.split('\n').length + 1,
        lineContent: 'Program End',
        variables: { ...this.getCurrentScope() },
        description: 'Program execution complete',
        type: 'end',
        consoleOutput: [...this.consoleOutput],
        callStack: []
      });

      return {
        success: true,
        steps: this.steps
      };

    } catch (error) {
      this.addStep({
        line: -1,
        lineNumber: 0,
        lineContent: 'Error',
        variables: { ...this.getCurrentScope() },
        description: `Runtime Error: ${error.message}`,
        type: 'error',
        error: error.message,
        consoleOutput: [...this.consoleOutput],
        callStack: [...this.callStack]
      });

      return {
        success: false,
        error: error.message,
        steps: this.steps
      };
    }
  }

  /**
   * Execute AST node
   */
  executeNode(node) {
    if (!node) return;

    switch (node.type) {
      case 'Program':
        node.body.forEach(statement => this.executeNode(statement));
        break;

      case 'VariableDeclaration':
        this.handleVariableDeclaration(node);
        break;

      case 'ExpressionStatement':
        this.executeNode(node.expression);
        break;

      case 'AssignmentExpression':
        this.handleAssignment(node);
        break;

      case 'FunctionDeclaration':
        this.handleFunctionDeclaration(node);
        break;

      case 'CallExpression':
        return this.handleFunctionCall(node);

      case 'IfStatement':
        this.handleIfStatement(node);
        break;

      case 'ForStatement':
        this.handleForLoop(node);
        break;

      case 'WhileStatement':
        this.handleWhileLoop(node);
        break;

      case 'BlockStatement':
        node.body.forEach(statement => this.executeNode(statement));
        break;

      case 'ReturnStatement':
        return this.evaluateExpression(node.argument);

      default:
        // Silently ignore unsupported node types
        break;
    }
  }

  /**
   * Handle variable declarations
   */
  handleVariableDeclaration(node) {
    node.declarations.forEach(declaration => {
      const varName = declaration.id.name;
      const value = declaration.init ? this.evaluateExpression(declaration.init) : undefined;
      
      this.setVariable(varName, value);
      
      this.addStep({
        line: node.loc ? node.loc.start.line - 1 : -1,
        lineNumber: node.loc ? node.loc.start.line : 0,
        lineContent: this.getLineContent(node),
        variables: { ...this.getCurrentScope() },
        description: `Declared '${varName}' = ${this.formatValue(value)}`,
        type: 'declaration',
        variable: varName,
        value: value,
        consoleOutput: [...this.consoleOutput],
        callStack: [...this.callStack]
      });
    });
  }

  /**
   * Handle assignments
   */
  handleAssignment(node) {
    const varName = node.left.name;
    const value = this.evaluateExpression(node.right);
    
    this.setVariable(varName, value);
    
    this.addStep({
      line: node.loc ? node.loc.start.line - 1 : -1,
      lineNumber: node.loc ? node.loc.start.line : 0,
      lineContent: this.getLineContent(node),
      variables: { ...this.getCurrentScope() },
      description: `Updated '${varName}' = ${this.formatValue(value)}`,
      type: 'assignment',
      variable: varName,
      value: value,
      consoleOutput: [...this.consoleOutput],
      callStack: [...this.callStack]
    });

    return value;
  }

  /**
   * Handle function declarations
   */
  handleFunctionDeclaration(node) {
    const funcName = node.id.name;
    this.functions[funcName] = node;
    
    this.addStep({
      line: node.loc ? node.loc.start.line - 1 : -1,
      lineNumber: node.loc ? node.loc.start.line : 0,
      lineContent: this.getLineContent(node),
      variables: { ...this.getCurrentScope() },
      description: `Declared function '${funcName}'`,
      type: 'function-declaration',
      functionName: funcName,
      consoleOutput: [...this.consoleOutput],
      callStack: [...this.callStack]
    });
  }

  /**
   * Handle function calls
   */
  handleFunctionCall(node) {
    const funcName = node.callee.name;

    // Handle console.log
    if (node.callee.type === 'MemberExpression' && 
        node.callee.object.name === 'console' && 
        node.callee.property.name === 'log') {
      const args = node.arguments.map(arg => this.evaluateExpression(arg));
      const output = args.map(arg => this.formatValue(arg)).join(' ');
      this.consoleOutput.push(output);
      
      this.addStep({
        line: node.loc ? node.loc.start.line - 1 : -1,
        lineNumber: node.loc ? node.loc.start.line : 0,
        lineContent: this.getLineContent(node),
        variables: { ...this.getCurrentScope() },
        description: `Console: ${output}`,
        type: 'console',
        output: output,
        consoleOutput: [...this.consoleOutput],
        callStack: [...this.callStack]
      });
      return;
    }

    // Handle user-defined functions
    if (this.functions[funcName]) {
      const func = this.functions[funcName];
      const args = node.arguments.map(arg => this.evaluateExpression(arg));
      
      this.callStack.push(funcName);
      
      this.addStep({
        line: node.loc ? node.loc.start.line - 1 : -1,
        lineNumber: node.loc ? node.loc.start.line : 0,
        lineContent: this.getLineContent(node),
        variables: { ...this.getCurrentScope() },
        description: `Calling function '${funcName}(${args.map(a => this.formatValue(a)).join(', ')})'`,
        type: 'function-call',
        functionName: funcName,
        arguments: args,
        consoleOutput: [...this.consoleOutput],
        callStack: [...this.callStack]
      });

      // Create new scope for function
      this.pushScope();

      // Bind parameters
      func.params.forEach((param, idx) => {
        this.setVariable(param.name, args[idx]);
      });

      // Execute function body
      const result = this.executeNode(func.body);

      // Pop scope
      this.popScope();
      this.callStack.pop();

      this.addStep({
        line: node.loc ? node.loc.start.line - 1 : -1,
        lineNumber: node.loc ? node.loc.start.line : 0,
        lineContent: this.getLineContent(node),
        variables: { ...this.getCurrentScope() },
        description: `Function '${funcName}' returned ${this.formatValue(result)}`,
        type: 'function-return',
        functionName: funcName,
        returnValue: result,
        consoleOutput: [...this.consoleOutput],
        callStack: [...this.callStack]
      });

      return result;
    }

    throw new Error(`Function '${funcName}' is not defined`);
  }

  /**
   * Handle if statements
   */
  handleIfStatement(node) {
    const condition = this.evaluateExpression(node.test);
    
    this.addStep({
      line: node.loc ? node.loc.start.line - 1 : -1,
      lineNumber: node.loc ? node.loc.start.line : 0,
      lineContent: this.getLineContent(node),
      variables: { ...this.getCurrentScope() },
      description: `If condition is ${condition ? 'TRUE' : 'FALSE'}`,
      type: 'condition',
      condition: condition,
      consoleOutput: [...this.consoleOutput],
      callStack: [...this.callStack]
    });

    if (condition) {
      this.executeNode(node.consequent);
    } else if (node.alternate) {
      this.executeNode(node.alternate);
    }
  }

  /**
   * Handle for loops
   */
  handleForLoop(node) {
    // Initialize
    if (node.init) {
      this.executeNode(node.init);
    }

    let iterations = 0;
    const MAX_ITERATIONS = 1000;

    while (true) {
      if (iterations++ > MAX_ITERATIONS) {
        throw new Error('Infinite loop detected');
      }

      // Test condition
      const condition = node.test ? this.evaluateExpression(node.test) : true;
      
      this.addStep({
        line: node.loc ? node.loc.start.line - 1 : -1,
        lineNumber: node.loc ? node.loc.start.line : 0,
        lineContent: this.getLineContent(node),
        variables: { ...this.getCurrentScope() },
        description: `Loop condition: ${condition ? 'continue' : 'exit'}`,
        type: 'loop',
        condition: condition,
        consoleOutput: [...this.consoleOutput],
        callStack: [...this.callStack]
      });

      if (!condition) break;

      // Execute body
      this.executeNode(node.body);

      // Update
      if (node.update) {
        this.executeNode(node.update);
      }
    }
  }

  /**
   * Handle while loops
   */
  handleWhileLoop(node) {
    let iterations = 0;
    const MAX_ITERATIONS = 1000;

    while (true) {
      if (iterations++ > MAX_ITERATIONS) {
        throw new Error('Infinite loop detected');
      }

      const condition = this.evaluateExpression(node.test);
      
      this.addStep({
        line: node.loc ? node.loc.start.line - 1 : -1,
        lineNumber: node.loc ? node.loc.start.line : 0,
        lineContent: this.getLineContent(node),
        variables: { ...this.getCurrentScope() },
        description: `While condition: ${condition ? 'continue' : 'exit'}`,
        type: 'loop',
        condition: condition,
        consoleOutput: [...this.consoleOutput],
        callStack: [...this.callStack]
      });

      if (!condition) break;

      this.executeNode(node.body);
    }
  }

  /**
   * Evaluate expressions
   */
  evaluateExpression(node) {
    if (!node) return undefined;

    switch (node.type) {
      case 'Literal':
        return node.value;

      case 'Identifier':
        return this.getVariable(node.name);

      case 'BinaryExpression':
        const left = this.evaluateExpression(node.left);
        const right = this.evaluateExpression(node.right);
        return this.evaluateBinaryOp(node.operator, left, right);

      case 'UnaryExpression':
        const arg = this.evaluateExpression(node.argument);
        return this.evaluateUnaryOp(node.operator, arg);

      case 'ArrayExpression':
        return node.elements.map(el => this.evaluateExpression(el));

      case 'ObjectExpression':
        const obj = {};
        node.properties.forEach(prop => {
          const key = prop.key.name || prop.key.value;
          obj[key] = this.evaluateExpression(prop.value);
        });
        return obj;

      case 'CallExpression':
        return this.handleFunctionCall(node);

      case 'UpdateExpression':
        return this.handleUpdateExpression(node);

      case 'MemberExpression':
        const object = this.evaluateExpression(node.object);
        const property = node.computed ? 
          this.evaluateExpression(node.property) : 
          node.property.name;
        return object[property];

      default:
        return undefined;
    }
  }

  /**
   * Handle update expressions (++, --)
   */
  handleUpdateExpression(node) {
    const varName = node.argument.name;
    const currentValue = this.getVariable(varName);
    const newValue = node.operator === '++' ? currentValue + 1 : currentValue - 1;
    this.setVariable(varName, newValue);
    return node.prefix ? newValue : currentValue;
  }

  /**
   * Evaluate binary operations
   */
  evaluateBinaryOp(operator, left, right) {
    switch (operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case '%': return left % right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      case '==': return left == right;
      case '===': return left === right;
      case '!=': return left != right;
      case '!==': return left !== right;
      case '&&': return left && right;
      case '||': return left || right;
      default: return undefined;
    }
  }

  /**
   * Evaluate unary operations
   */
  evaluateUnaryOp(operator, arg) {
    switch (operator) {
      case '-': return -arg;
      case '+': return +arg;
      case '!': return !arg;
      default: return undefined;
    }
  }

  /**
   * Scope management
   */
  pushScope() {
    this.scopes.push({});
  }

  popScope() {
    this.scopes.pop();
  }

  getCurrentScope() {
    return this.scopes[this.scopes.length - 1];
  }

  setVariable(name, value) {
    this.getCurrentScope()[name] = value;
  }

  getVariable(name) {
    // Look through scopes from innermost to outermost
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].hasOwnProperty(name)) {
        return this.scopes[i][name];
      }
    }
    throw new Error(`Variable '${name}' is not defined`);
  }

  /**
   * Helper to get line content
   */
  getLineContent(node) {
    if (!node.loc) return '';
    // This is a simplified version - in production you'd extract from source
    return `Line ${node.loc.start.line}`;
  }

  /**
   * Add a step to execution history
   */
  addStep(step) {
    this.steps.push(step);
  }

  /**
   * Format value for display
   */
  formatValue(value) {
    if (typeof value === 'string') return `"${value}"`;
    if (Array.isArray(value)) return `[${value.map(v => this.formatValue(v)).join(', ')}]`;
    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    return String(value);
  }
}

export default CodeInterpreter;