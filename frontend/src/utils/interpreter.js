import * as acorn from "acorn";
import * as walk from "acorn-walk";

class CodeInterpreter {
  constructor() {
    this.steps = []; // Tracks variable states
    this.variables = {}; // Tracks variables and their values
    this.scopes = [{}]; // Stack of scopes
    this.functions = {};
    this.consoleOutput = [];
    this.callStack = [];
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
      this.scopes = [{}];
      this.functions = {};
      this.consoleOutput = [];
      this.callStack = [];

      // Add initial step
      this.addStep({
        line: -1,
        lineNumber: 0,
        lineContent: "Program Start",
        variables: {},
        description: "Program execution begins",
        type: "start",
        consoleOutput: [],
        callStack: [],
      });

      let ast;
      try {
        ast = acorn.parse(code, {
          ecmaVersion: 2020,
          locations: true,
        });
      } catch (parseError) {
        return {
          success: false,
          error: `Syntax Error: ${parseError.message}`,
          steps: this.steps,
        };
      }

      // Execute the AST
      this.executeNode(ast);

      // Add final step
      this.addStep({
        line: code.split("\n").length,
        lineNumber: code.split("\n").length + 1,
        lineContent: "Program End",
        // variables: { ...this.getCurrentScope() },
        variables: this.deepClone(this.getCurrentScope()),
        description: "Program execution complete",
        type: "end",
        consoleOutput: this.deepClone(this.consoleOutput),
        callStack: [],
      });

      return {
        success: true,
        steps: this.steps,
      };
    } catch (error) {
      this.addStep({
        line: -1,
        lineNumber: 0,
        lineContent: "Error",
        // variables: { ...this.getCurrentScope() },
        variables: this.deepClone(this.getCurrentScope()),
        description: `Runtime Error: ${error.message}`,
        type: "error",
        error: error.message,
        consoleOutput: this.deepClone(this.consoleOutput),
        callStack: this.deepClone(this.callStack),
      });

      return {
        success: false,
        error: error.message,
        steps: this.steps,
      };
    }
  }

  // Execute AST node
  executeNode(node) {
    if (!node) return;
    // console.log(`node type ${node.type}`);
    switch (node.type) {
      case "Program":
        for (const statement of node.body) {
          // console.log(`statement ${statement}`);
          // console.log(`statement type ${statement.type}`);

          const result = this.executeNode(statement);
          if (result !== undefined) return result;
        }
        break;

      case "VariableDeclaration":
        this.handleVariableDeclaration(node);
        break;

      case "ExpressionStatement":
        this.executeNode(node.expression);
        break;

      case "AssignmentExpression":
        this.handleAssignment(node);
        break;

      case "UpdateExpression":
        this.evaluateExpression(node);
        break;

      case "FunctionDeclaration":
        this.handleFunctionDeclaration(node);
        break;

      case "CallExpression":
        return this.handleFunctionCall(node);

      case "IfStatement":
        this.handleIfStatement(node);
        break;

      case "ForStatement":
        this.handleForLoop(node);
        break;

      case "WhileStatement":
        this.handleWhileLoop(node);
        break;

      case "BlockStatement":
        for (const statement of node.body) {
          const result = this.executeNode(statement);
          if (result !== undefined) return result; // ⬅️ Propagate return
        }
        break;

      case "ReturnStatement":
        return this.evaluateExpression(node.argument);

      case "ArrowFunctionExpression":
        return this.createArrowFunction(node);

      default:
        // Silently ignore unsupported node types
        break;
    }
  }

  // Handle Variable Declaration
  handleVariableDeclaration(node) {
    // console.log(`inside handleVariabledeclaration`);
    node.declarations.forEach((declaration) => {
      const varName = declaration.id.name;
      const value = declaration.init
        ? this.evaluateExpression(declaration.init)
        : undefined;

      this.setVariable(varName, value);

      // store arrow function for future calls
      if (value && value.type === "arrow-function") {
        this.functions[varName] = value;
      }

      this.addStep({
        line: node.loc ? node.loc.start.line - 1 : -1,
        lineNumber: node.loc ? node.loc.start.line : 0,
        lineContent: this.getLineContent(node),
        // variables: { ...this.getCurrentScope() },
        variables: this.deepClone(this.getCurrentScope()),
        description: `Declared '${varName}' = ${this.formatValue(value)}`,
        type: "declaration",
        variable: varName,
        value: value,
        consoleOutput: this.deepClone(this.consoleOutput),
        callStack: this.deepClone(this.callStack),
      });
    });
  }

  // Handle Assignments
  handleAssignment(node) {
    // Handle member expression assignments (arr[0] = value, obj.prop = value)
    if ((node.left.type = "MemberExpression")) {
      const object = this.evaluateExpression(node.left.object);
      const property = node.left.computed
        ? this.evaluateExpression(node.left.property)
        : node.left.property.name;
      const value = this.evaluateExpression(node.right);

      object[property] = value;

      this.addStep({
        line: node.loc ? node.loc.start.line - 1 : -1,
        lineNumber: node.loc ? node.loc.start.line : 0,
        lineContent: this.getLineContent(node),
        // variables: { ...this.getCurrentScope() },
        variables: this.deepClone(this.getCurrentScope()),
        description: `Set ${
          node.left.object.name
        }[${property}] = ${this.formatValue(value)}`,
        type: "assignment",
        consoleOutput: this.deepClone(this.consoleOutput),
        callStack: this.deepClone(this.callStack),
      });

      return value;
    }

    // Regular variable assignment
    const varName = node.left.name;
    const value = this.evaluateExpression(node.right);

    this.setVariable(varName, value);

    this.addStep({
      line: node.loc ? node.loc.start.line - 1 : -1,
      lineNumber: node.loc ? node.loc.start.line : 0,
      lineContent: this.getLineContent(node),
      // variables: { ...this.getCurrentScope() },
      variables: this.deepClone(this.getCurrentScope()),
      description: `Updated '${varName}' = ${this.formatValue(value)}`,
      type: "assignment",
      variable: varName,
      value: value,
      consoleOutput: this.deepClone(this.consoleOutput),
      callStack: this.deepClone(this.callStack),
    });

    return value;
  }

  // Handle function declarations
  handleFunctionDeclaration(node) {
    const funcName = node.id.name;

    this.functions[funcName] = node;

    this.addStep({
      line: node.loc ? node.loc.start.line - 1 : -1,
      lineNumber: node.loc ? node.loc.start.line : 0,
      lineContent: this.getLineContent(node),
      // variables: { ...this.getCurrentScope() },
      variables: this.deepClone(this.getCurrentScope()),
      description: `Declared function '${funcName}'`,
      type: "function-declaration",
      functionName: funcName,
      consoleOutput: this.deepClone(this.consoleOutput),
      callStack: this.deepClone(this.callStack),
    });
  }

  // Create arrow function
  createArrowFunction(node) {
    return {
      type: "arrow-function",
      params: node.params,
      body: node.body,
      isExpression: node.body.type !== "BlockStatement",
    };
  }

  // Handle function calls
  handleFunctionCall(node) {
    // console.log(`callee type ${node.callee.type}`);
    // Handle console.log **before** evaluating expressions
    if (
      node.callee.type === "MemberExpression" &&
      node.callee.object.name === "console" &&
      node.callee.property.name === "log"
    ) {
      const args = node.arguments.map((arg) => this.evaluateExpression(arg));
      const output = args.map((arg) => this.formatValue(arg)).join(" ");
      this.consoleOutput.push(output);

      this.addStep({
        line: node.loc ? node.loc.start.line - 1 : -1,
        lineNumber: node.loc ? node.loc.start.line : 0,
        lineContent: this.getLineContent(node),
        // variables: { ...this.getCurrentScope() },
        variables: this.deepClone(this.getCurrentScope()),
        description: `Console: ${output}`,
        type: "console",
        output: output,
        consoleOutput: this.deepClone(this.consoleOutput),
        callStack: this.deepClone(this.callStack),
      });
      return;
    }

    // Now safely handle other MemberExpressions
    if (node.callee.type === "MemberExpression") {
      // console.log("inside memberExpression");
      const object = this.evaluateExpression(node.callee.object);
      const methodName = node.callee.property.name;

      // Array / String / Object method handling
      if (Array.isArray(object)) {
        return this.handleArrayMethod(node, object, methodName);
      }
      if (typeof object === "string") {
        return this.handleStringMethod(node, object, methodName);
      }
      if (typeof object === "object" && object !== null) {
        return this.handleObjectMethod(node, object, methodName);
      }
    }

    const funcName = node.callee.name;
    let funcValue = this.getVariable(funcName);

    // Check if it's an arrow function object
    if (funcValue && funcValue.type === "arrow-function") {
      // Create a new local scope for this function
      this.scopes.push({});

      // Evaluate arguments and assign them to params
      node.arguments.forEach((argNode, i) => {
        const paramName = funcValue.params[i].name;
        const argValue = this.evaluateExpression(argNode);
        this.setVariable(paramName, argValue);
      });

      // Execute function body and store the result
      let result;
      if (funcValue.body.type === "BlockStatement") {
        result = this.executeNode(funcValue.body);
      } else {
        // For concise arrow function (e.g. (a, b) => a + b)
        result = this.evaluateExpression(funcValue.body);
      }

      // Pop the local scope after function execution
      this.scopes.pop();

      return result;
    }

    // For normal user-defined (non-arrow) functions
    if (this.functions[funcName]) {
      return this.executeUserFunction(node, funcName);
    }
    throw new Error("Unsupported function call type");
  }

  // Handle user-defined functions
  executeUserFunction(node, funcName) {
    const func = this.functions[funcName];
    const args = node.arguments.map((arg) => this.evaluateExpression(arg));

    this.callStack.push(funcName);

    this.addStep({
      line: node.loc ? node.loc.start.line - 1 : -1,
      lineNumber: node.loc ? node.loc.start.line : 0,
      lineContent: this.getLineContent(node),
      // variables: { ...this.getCurrentScope() },
      variables: this.deepClone(this.getCurrentScope()),
      description: `Calling function '${funcName}(${args
        .map((a) => this.formatValue(a))
        .join(", ")})'`,
      type: "function-call",
      functionName: funcName,
      arguments: args,
      consoleOutput: this.deepClone(this.consoleOutput),
      callStack: this.deepClone(this.callStack),
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
      // variables: { ...this.getCurrentScope() },
      variables: this.deepClone(this.getCurrentScope()),
      description: `Function '${funcName}' returned ${this.formatValue(
        result
      )}`,
      type: "function-return",
      functionName: funcName,
      returnValue: result,
      consoleOutput: this.deepClone(this.consoleOutput),
      callStack: this.deepClone(this.callStack),
    });

    return result;
  }

  // FIXED: Helper to create callback preview
  getCallbackPreview(callback) {
  if (!callback) return "(no callback)";

  if (callback.type === "arrow-function") {
    try {
      const params = callback.params.map((p) => p.name || "?").join(", ");
      const body = callback.body;

      // Helper: recursively convert any expression to string
      const stringifyExpr = (node) => {
        if (!node) return "?";
        switch (node.type) {
          case "BinaryExpression":
            return `${stringifyExpr(node.left)} ${node.operator} ${stringifyExpr(node.right)}`;
          case "Identifier":
            return node.name;
          case "Literal":
            return JSON.stringify(node.value);
          default:
            return "?";
        }
      };

      if (callback.isExpression && body) {
        // 🔍 Handle binary and nested binary expressions properly
        if (body.type === "BinaryExpression") {
          const exprString = stringifyExpr(body);
          return exprString;
        }
        if (body.type === "Identifier") return body.name;
        if (body.type === "Literal") return JSON.stringify(body.value);
      }

      return `(${params}) => {...}`;
    } catch (e) {
      console.log("Preview Error:", e);
      return "(callback)";
    }
  }

  if (typeof callback === "function") return "(function)";
  return "(callback)";
}


  // FIXED: Handle array methods with proper node passing
  handleArrayMethod(node, array, methodName) {
    const args = node.arguments.map((arg) => this.evaluateExpression(arg));
    let result;
    let description;

    // Define which methods need detailed visualization
    const iteratorMethods = [
      "map",
      "filter",
      "forEach",
      "find",
      "findIndex",
      "some",
      "every",
      "reduce",
    ];

    if (iteratorMethods.includes(methodName)) {
      // Call the iterator handler which will create its own detailed steps
      switch (methodName) {
        case "map":
          result = this.handleArrayIteratorMethod(array, args[0], "map", node);
          return result; // Don't create duplicate step

        case "filter":
          result = this.handleArrayIteratorMethod(
            array,
            args[0],
            "filter",
            node
          );
          return result;

        case "forEach":
          this.handleArrayIteratorMethod(array, args[0], "forEach", node);
          return undefined;

        case "reduce":
          result = this.handleArrayReduce(array, args[0], args[1], node);
          return result;

        case "find":
          result = this.handleArrayIteratorMethod(array, args[0], "find", node);
          return result;

        case "findIndex":
          result = this.handleArrayIteratorMethod(
            array,
            args[0],
            "findIndex",
            node
          );
          return result;

        case "some":
          result = this.handleArrayIteratorMethod(array, args[0], "some", node);
          return result;

        case "every":
          result = this.handleArrayIteratorMethod(
            array,
            args[0],
            "every",
            node
          );
          return result;
      }
    }

    // Handle non-iterator methods (push, pop, etc.)
    switch (methodName) {
      case "push":
        result = array.push(...args);
        description = `Array.push(${args
          .map((a) => this.formatValue(a))
          .join(", ")}) → length: ${result}`;
        break;

      case "pop":
        result = array.pop();
        description = `Array.pop() → ${this.formatValue(result)}`;
        break;

      case "shift":
        result = array.shift();
        description = `Array.shift() → ${this.formatValue(result)}`;
        break;

      case "unshift":
        result = array.unshift(...args);
        description = `Array.unshift(${args
          .map((a) => this.formatValue(a))
          .join(", ")}) → length: ${result}`;
        break;

      case "slice":
        result = array.slice(...args);
        description = `Array.slice(${args.join(", ")}) → ${this.formatValue(
          result
        )}`;
        break;

      case "splice":
        result = array.splice(...args);
        description = `Array.splice(${args.join(
          ", "
        )}) → removed: ${this.formatValue(result)}`;
        break;

      case "join":
        result = array.join(args[0] !== undefined ? args[0] : ",");
        description = `Array.join('${args[0]}') → "${result}"`;
        break;

      case "reverse":
        result = array.reverse();
        description = `Array.reverse() → ${this.formatValue(result)}`;
        break;

      case "sort":
        result = array.sort(args[0]);
        description = `Array.sort() → ${this.formatValue(result)}`;
        break;

      case "includes":
        result = array.includes(...args);
        description = `Array.includes(${this.formatValue(
          args[0]
        )}) → ${result}`;
        break;

      case "indexOf":
        result = array.indexOf(...args);
        description = `Array.indexOf(${this.formatValue(args[0])}) → ${result}`;
        break;

      default:
        throw new Error(`Array method '${methodName}' is not supported`);
    }

    this.addStep({
      line: node.loc ? node.loc.start.line - 1 : -1,
      lineNumber: node.loc ? node.loc.start.line : 0,
      lineContent: this.getLineContent(node),
      // variables: { ...this.getCurrentScope() },
      variables: this.deepClone(this.getCurrentScope()),
      description: description,
      type: "array-method",
      method: methodName,
      result: result,
      consoleOutput: this.deepClone(this.consoleOutput),
      callStack: this.deepClone(this.callStack),
    });

    return result;
  }

  // FIXED: Enhanced array iterator method with detailed visualization
  handleArrayIteratorMethod(array, callback, methodName, node) {
    if (!callback) {
      throw new Error(`${methodName} requires a callback function`);
    }

    const results = [];
    const PREVIEW_LIMIT = 3;

    // Start step with preview
    const previewVals = array
      .slice(0, PREVIEW_LIMIT)
      .map((v) => this.formatValue(v))
      .join(", ");
    const previewDesc =
      array.length > PREVIEW_LIMIT
        ? `[${previewVals}, ...] (${array.length} items)`
        : `[${previewVals}] (${array.length} items)`;

    this.addStep({
      line: node && node.loc ? node.loc.start.line - 1 : -1,
      lineNumber: node && node.loc ? node.loc.start.line : 0,
      lineContent: this.getLineContent(node),
      variables: this.deepClone(this.getCurrentScope()),
      description: `${methodName}() starting on ${previewDesc}`,
      type: "array-iterator-start",
      method: methodName,
      consoleOutput: this.deepClone(this.consoleOutput),
      callStack: this.deepClone(this.callStack),
    });

    // Process each element
    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      const callbackResult = this.executeCallback(callback, [
        element,
        i,
        array,
      ]);

      // Handle method-specific logic
      switch (methodName) {
        case "map":
          results.push(callbackResult);
          break;
        case "filter":
          if (callbackResult) results.push(element);
          break;
        case "find":
          if (callbackResult) {
            this.addStep({
              line: node && node.loc ? node.loc.start.line - 1 : -1,
              lineNumber: node && node.loc ? node.loc.start.line : 0,
              lineContent: this.getLineContent(node),
              variables: this.deepClone(this.getCurrentScope()),
              description: `${methodName}() found at index ${i}: ${this.formatValue(
                element
              )}`,
              type: "array-iterator-end",
              consoleOutput: this.deepClone(this.consoleOutput),
              callStack: this.deepClone(this.callStack),
            });
            return element;
          }
          break;
        case "findIndex":
          if (callbackResult) return i;
          break;
        case "some":
          if (callbackResult) return true;
          break;
        case "every":
          if (!callbackResult) return false;
          break;
        case "forEach":
          // Just execute
          break;
      }

      // Detailed steps for first PREVIEW_LIMIT items
      if (i < PREVIEW_LIMIT) {
        const cbPreview = this.getCallbackPreview(callback);
        const inputVal = this.formatValue(element);
        const outputVal = this.formatValue(callbackResult);

        this.addStep({
          line: node && node.loc ? node.loc.start.line - 1 : -1,
          lineNumber: node && node.loc ? node.loc.start.line : 0,
          lineContent: this.getLineContent(node),
          variables: this.deepClone(this.getCurrentScope()),
          description: `${methodName}[${i}]: ${inputVal} → ${cbPreview} → ${outputVal}`,
          type: "array-iterator",
          index: i,
          consoleOutput: this.deepClone(this.consoleOutput),
          callStack: this.deepClone(this.callStack),
        });
      }
    }

    // Default returns
    if (methodName === "findIndex") return -1;
    if (methodName === "some") return false;
    if (methodName === "every") return true;
    if (methodName === "forEach") {
      this.addStep({
        line: node && node.loc ? node.loc.start.line - 1 : -1,
        lineNumber: node && node.loc ? node.loc.start.line : 0,
        lineContent: this.getLineContent(node),
        variables: this.deepClone(this.getCurrentScope()),
        description: `${methodName}() completed`,
        type: "array-iterator-end",
        consoleOutput: this.deepClone(this.consoleOutput),
        callStack: this.deepClone(this.callStack),
      });
      return undefined;
    }

    // Final result step
    this.addStep({
      line: node && node.loc ? node.loc.start.line - 1 : -1,
      lineNumber: node && node.loc ? node.loc.start.line : 0,
      lineContent: this.getLineContent(node),
      variables: this.deepClone(this.getCurrentScope()),
      description: `${methodName}() result → ${this.formatValue(results)}`,
      type: "array-iterator-end",
      consoleOutput: this.deepClone(this.consoleOutput),
      callStack: this.deepClone(this.callStack),
    });

    return results;
  }

  // FIXED: Add node parameter to reduce
 handleArrayReduce(array, callback, initialValue, node) {
  if (!callback) {
    throw new Error("reduce requires a callback function");
  }

  const PREVIEW_LIMIT = 5; // show first 5 reduce steps

  let accumulator = initialValue !== undefined ? initialValue : array[0];
  const startIndex = initialValue !== undefined ? 0 : 1;

  // Step 1: Start visualization
  const previewVals = array
    .slice(0, PREVIEW_LIMIT)
    .map((v) => this.formatValue(v))
    .join(", ");
  const previewDesc =
    array.length > PREVIEW_LIMIT
      ? `[${previewVals}, ...] (${array.length} items)`
      : `[${previewVals}] (${array.length} items)`;

  this.addStep({
    line: node && node.loc ? node.loc.start.line - 1 : -1,
    lineNumber: node && node.loc ? node.loc.start.line : 0,
    lineContent: this.getLineContent(node),
    variables: this.deepClone(this.getCurrentScope()),
    description: `reduce() starting with accumulator = ${this.formatValue(
      accumulator
    )}, array = ${previewDesc}`,
    type: "array-reduce-start",
    method: "reduce",
    consoleOutput: this.deepClone(this.consoleOutput),
    callStack: this.deepClone(this.callStack),
  });

  // Step 2: Iteration
  for (let i = startIndex; i < array.length; i++) {
    const current = array[i];
    const prevAccumulator = accumulator;

    // Execute callback
    const callbackResult = this.executeCallback(callback, [
      accumulator,
      current,
      i,
      array,
    ]);

    accumulator = callbackResult;

    // Detailed visualization for first few items
    if (i - startIndex < PREVIEW_LIMIT) {
      const cbPreview = this.getCallbackPreview(callback);
      this.addStep({
        line: node && node.loc ? node.loc.start.line - 1 : -1,
        lineNumber: node && node.loc ? node.loc.start.line : 0,
        lineContent: this.getLineContent(node),
        variables: this.deepClone(this.getCurrentScope()),
        description: `reduce[${i}]: acc=${this.formatValue(
          prevAccumulator
        )}, cur=${this.formatValue(current)} → ${cbPreview} → result=${this.formatValue(
          accumulator
        )}`,
        type: "array-reduce-step",
        index: i,
        consoleOutput: this.deepClone(this.consoleOutput),
        callStack: this.deepClone(this.callStack),
      });
    }
  }

  // Step 3: Final result
  this.addStep({
    line: node && node.loc ? node.loc.start.line - 1 : -1,
    lineNumber: node && node.loc ? node.loc.start.line : 0,
    lineContent: this.getLineContent(node),
    variables: this.deepClone(this.getCurrentScope()),
    description: `reduce() → final result = ${this.formatValue(accumulator)}`,
    type: "array-reduce-end",
    method: "reduce",
    result: accumulator,
    consoleOutput: this.deepClone(this.consoleOutput),
    callStack: this.deepClone(this.callStack),
  });

  return accumulator;
}


  // Execute callback function (for array methods)
  executeCallback(callback, args) {
    if (callback.type === "arrow-function") {
      // Arrow function
      this.pushScope();

      callback.params.forEach((param, idx) => {
        this.setVariable(param.name, args[idx]);
      });

      let result;
      if (callback.isExpression) {
        result = this.evaluateExpression(callback.body);
      } else {
        result = this.executeNode(callback.body);
      }

      this.popScope();
      return result;
    } else if (typeof callback === "function") {
      // Native JS function
      return callback(...args);
    } else {
      throw new Error("Invalid callback");
    }
  }

  // Handle string methods
  handleStringMethod(node, string, methodName) {
    const args = node.arguments.map((arg) => this.evaluateExpression(arg));
    let result;
    let description;

    switch (methodName) {
      case "toUpperCase":
        result = string.toUpperCase();
        description = `String.toUpperCase() → "${result}"`;
        break;

      case "toLowerCase":
        result = string.toLowerCase();
        description = `String.toLowerCase() → "${result}"`;
        break;

      case "substring":
      case "substr":
        result = string.substring(...args);
        description = `String.substring(${args.join(", ")}) → "${result}"`;
        break;

      case "slice":
        result = string.slice(...args);
        description = `String.slice(${args.join(", ")}) → "${result}"`;
        break;

      case "split":
        result = string.split(args[0]);
        description = `String.split('${args[0]}') → ${this.formatValue(
          result
        )}`;
        break;

      case "trim":
        result = string.trim();
        description = `String.trim() → "${result}"`;
        break;

      case "replace":
        result = string.replace(args[0], args[1]);
        description = `String.replace('${args[0]}', '${args[1]}') → "${result}"`;
        break;

      case "includes":
        result = string.includes(args[0]);
        description = `String.includes('${args[0]}') → ${result}`;
        break;

      case "indexOf":
        result = string.indexOf(args[0]);
        description = `String.indexOf('${args[0]}') → ${result}`;
        break;

      case "charAt":
        result = string.charAt(args[0]);
        description = `String.charAt(${args[0]}) → "${result}"`;
        break;

      case "startsWith":
        result = string.startsWith(args[0]);
        description = `String.startsWith('${args[0]}') → ${result}`;
        break;

      case "endsWith":
        result = string.endsWith(args[0]);
        description = `String.endsWith('${args[0]}') → ${result}`;
        break;

      case "repeat":
        result = string.repeat(args[0]);
        description = `String.repeat(${args[0]}) → "${result}"`;
        break;

      case "padStart":
        result = string.padStart(args[0], args[1]);
        description = `String.padStart(${args[0]}, '${args[1]}') → "${result}"`;
        break;

      case "padEnd":
        result = string.padEnd(args[0], args[1]);
        description = `String.padEnd(${args[0]}, '${args[1]}') → "${result}"`;
        break;

      default:
        throw new Error(`String method '${methodName}' is not supported`);
    }

    this.addStep({
      line: node.loc ? node.loc.start.line - 1 : -1,
      lineNumber: node.loc ? node.loc.start.line : 0,
      lineContent: this.getLineContent(node),
      // variables: { ...this.getCurrentScope() },
      variables: this.deepClone(this.getCurrentScope()),
      description: description,
      type: "string-method",
      method: methodName,
      result: result,
      consoleOutput: this.deepClone(this.consoleOutput),
      callStack: this.deepClone(this.callStack),
    });

    return result;
  }

  // Handle object methods
  handleObjectMethod(node, object, methodName) {
    // This is for future Object.keys(), Object.values(), etc.
    throw new Error(`Object method '${methodName}' is not yet supported`);
  }

  // Handle if statements
  handleIfStatement(node) {
    const condition = this.evaluateExpression(node.test);

    this.addStep({
      line: node.loc ? node.loc.start.line - 1 : -1,
      lineNumber: node.loc ? node.loc.start.line : 0,
      lineContent: this.getLineContent(node),
      // variables: { ...this.getCurrentScope() },
      variables: this.deepClone(this.getCurrentScope()),
      description: `If condition is ${condition ? "TRUE" : "FALSE"}`,
      type: "condition",
      condition: condition,
      consoleOutput: this.deepClone(this.consoleOutput),
      callStack: this.deepClone(this.callStack),
    });

    if (condition) {
      this.executeNode(node.consequent);
    } else if (node.alternate) {
      this.executeNode(node.alternate);
    }
  }

  // Handle for loops
  handleForLoop(node) {
    // Initialize
    if (node.init) {
      this.executeNode(node.init);
    }

    let iterations = 0;
    const MAX_ITERATIONS = 1000;

    while (true) {
      if (iterations++ > MAX_ITERATIONS) {
        throw new Error("Infinite loop detected");
      }

      const condition = node.test ? this.evaluateExpression(node.test) : true;
      this.addStep({
        line: node.loc ? node.loc.start.line - 1 : -1,
        lineNumber: node.loc ? node.loc.start.line : 0,
        lineContent: this.getLineContent(node),
        // variables: { ...this.getCurrentScope() },
        variables: this.deepClone(this.getCurrentScope()),
        description: `Loop condition: ${condition ? "continue" : "exit"}`,
        type: "loop",
        condition: condition,
        consoleOutput: this.deepClone(this.consoleOutput),
        callStack: this.deepClone(this.callStack),
      });

      if (!condition) break;

      // Execute body
      this.executeNode(node.body);

      // Update
      if (node.update) {
        this.evaluateExpression(node.update);
      }
    }
  }

  // Handle while loops
  handleWhileLoop(node) {
    let iterations = 0;
    const MAX_ITERATIONS = 1000;

    while (true) {
      if (iterations++ > MAX_ITERATIONS) {
        throw new Error("Infinite loop detected");
      }

      const condition = this.evaluateExpression(node.test);
      // console.log(`condition = ${condition}`);

      this.addStep({
        line: node.loc ? node.loc.start.line - 1 : -1,
        lineNumber: node.loc ? node.loc.start.line : 0,
        lineContent: this.getLineContent(node),
        // variables: { ...this.getCurrentScope() },
        variables: this.deepClone(this.getCurrentScope()),
        description: `While condition: ${condition ? "continue" : "exit"}`,
        type: "loop",
        condition: condition,
        consoleOutput: this.deepClone(this.consoleOutput),
        callStack: this.deepClone(this.callStack),
      });

      if (!condition) break;

      this.executeNode(node.body);
      console.log("Current count value:", this.getVariable("count"));
    }
  }

  // Evaluate expressions
  evaluateExpression(node) {
    // console.log(`inside evaluate expression ${node.type}`);
    if (!node) return undefined;

    switch (node.type) {
      case "Literal":
        return node.value;

      case "Identifier":
        //  console.log(`inside evaluate ${this.getVariable(node.name)}`);
        return this.getVariable(node.name);

      case "BinaryExpression":
        const left = this.evaluateExpression(node.left);
        const right = this.evaluateExpression(node.right);
        return this.evaluateBinaryOp(node.operator, left, right);

      case "UnaryExpression":
        const arg = this.evaluateExpression(node.argument);
        return this.evaluateUnaryOp(node.operator, arg);

      case "ArrayExpression":
        return node.elements.map((el) => this.evaluateExpression(el));

      case "ObjectExpression":
        const obj = {};
        node.properties.forEach((prop) => {
          const key = prop.key.name || prop.key.value;
          obj[key] = this.evaluateExpression(prop.value);
        });
        return obj;

      case "CallExpression":
        return this.handleFunctionCall(node);

      case "UpdateExpression":
        return this.handleUpdateExpression(node);

      case "MemberExpression":
        const object = this.evaluateExpression(node.object);
        const property = node.computer
          ? this.evaluateExpression(node.property)
          : node.property.name;

        // Handle .length property
        if (
          property === "length" &&
          (typeof object === "string" || Array.isArray(object))
        ) {
          return object.length;
        }

        return object[property];

      case "ArrowFunctionExpression":
        return this.createArrowFunction(node);

      case "TemplateLiteral":
        return this.evaluateTemplateLiteral(node);

      case "ConditionalExpression":
        const test = this.evaluateExpression(node.test);
        return test
          ? this.evaluateExpression(node.consequent)
          : this.evaluateExpression(node.alternate);

      case "LogicalExpression":
        const leftLog = this.evaluateExpression(node.left);
        if (node.operator === "&&") {
          return leftLog ? this.evaluateExpression(node.right) : leftLog;
        } else if (node.operator === "||") {
          return leftLog ? leftLog : this.evaluateExpression(node.right);
        }
        break;

      default:
        return undefined;
    }
  }

  // Evaluate template literals
  evaluateTemplateLiteral(node) {
    let result = "";
    node.quasis.forEach((quasis, i) => {
      result += quasis.value.cooked;
      if (node.expressions[i]) {
        result += String(this.evaluateExpression(node.expressions[i]));
      }
    });
    return result;
  }

  // Handle update expressions (++, --)
  handleUpdateExpression(node) {
    // console.log("inside handleupdate");
    const varName = node.argument.name;
    const currentValue = this.getVariable(varName);
    const newValue =
      node.operator === "++" ? currentValue + 1 : currentValue - 1;
    this.setVariable(varName, newValue);
    return node.prefix ? newValue : currentValue;
  }

  // Evaluate binary operations
  evaluateBinaryOp(operator, left, right) {
    switch (operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return left / right;
      case "%":
        return left % right;
      case "<":
        return left < right;
      case ">":
        return left > right;
      case "<=":
        return left <= right;
      case ">=":
        return left >= right;
      case "==":
        return left == right;
      case "===":
        return left === right;
      case "!=":
        return left != right;
      case "!==":
        return left !== right;
      case "&&":
        return left && right;
      case "||":
        return left || right;
      default:
        return undefined;
    }
  }

  // Evalutate Unary operations
  evaluateUnaryOp(operator, arg) {
    switch (operator) {
      case "-":
        return -arg;
      case "+":
        return +arg;
      case "!":
        return !arg;
      default:
        return undefined;
    }
  }

  //  Scope Management
  pushScope() {
    this.scopes.push({});
  }

  popScope() {
    this.scopes.pop();
  }

  getCurrentScope() {
    // Merge all scopes for visualization
    return this.scopes.reduce((acc, scope) => ({ ...acc, ...scope }), {});
  }

  setVariable(name, value) {
    this.scopes[this.scopes.length - 1][name] = value;
    // console.log(
    //   `inside setVariable ${(this.scopes[this.scopes.length - 1][name] =
    //     value)}`
    // );
  }

  /**
   * Get current variables
   * @returns {Object} - Current variable state
   */
  getVariable(name) {
    // Look through scopes from innermost to outermost
    // console.log(`inside get variable ${name}`);
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].hasOwnProperty(name)) {
        return this.scopes[i][name];
      }
    }
    throw new Error(`Variable '${name}' is not defined`);
  }

  deepClone(obj) {
    if (typeof structuredClone === "function") {
      try {
        return structuredClone(obj);
      } catch (e) {
        // structuredClone fails on functions/AST nodes
        return JSON.parse(JSON.stringify(obj, this.getCircularReplacer()));
      }
    }
    return JSON.parse(JSON.stringify(obj, this.getCircularReplacer()));
  }

  getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      // Skip functions and AST-like objects
      if (typeof value === "function") {
        return undefined;
      }
      if (
        value &&
        value.type &&
        (value.type.includes("Expression") || value.type.includes("Statement"))
      ) {
        return undefined;
      }
      return value;
    };
  }

  // Helper to get source line content
  getLineContent(node) {
    if (!node.loc) return "";
    return `Line ${node.loc.start.line}`;
  }

  //Add a step to execution history
  addStep(step) {
    this.steps.push(step);
  }

  /**
   * Format a value for display
   * @param {*} value - The value to format
   * @returns {string} - Formatted string representation
   */
  formatValue(value) {
    if (typeof value === "string") return `"${value}"`;
    if (Array.isArray(value)) {
      if (value.length > 10) {
        return `[${value.map((v) => this.formatValue(v)).join(", ")}, ... +${
          value.length - 10
        } more]`;
      }
      return `[${value.map((v) => this.formatValue(v)).join(", ")}]`;
    }

    if (typeof value === "object" && value !== null) {
      if (
        value.type === "arrow-function" ||
        value.type === "ArrowFunctionExpression"
      ) {
        const params = value.params.map((p) => p.name).join(", ");
        return `(${params}) => {...}`;
      }
      const entries = Object.entries(value);
      if (entries.length > 3) {
        return `{${entries
          .slice(0, 3)
          .map(([k, v]) => `${k}: ${this.formatValue(v)}`)
          .join(", ")},...}`;
      }
      return JSON.stringify(value);
    }
    if (value === undefined) return "undefined";
    if (value === null) return "null";
    if (typeof value === "function") return "(function)";
    return String(value);
  }
}

export default CodeInterpreter;
