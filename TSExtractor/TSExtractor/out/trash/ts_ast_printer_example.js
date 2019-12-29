"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
function makeFactorialFunction() {
    var functionName = ts.createIdentifier("factorial");
    var paramName = ts.createIdentifier("n");
    var parameter = ts.createParameter(
    /*decorators*/ undefined, 
    /*modifiers*/ undefined, 
    /*dotDotDotToken*/ undefined, paramName);
    var condition = ts.createBinary(paramName, ts.SyntaxKind.LessThanEqualsToken, ts.createLiteral(1));
    var ifBody = ts.createBlock([ts.createReturn(ts.createLiteral(1))], 
    /*multiline*/ true);
    var decrementedArg = ts.createBinary(paramName, ts.SyntaxKind.MinusToken, ts.createLiteral(1));
    var recurse = ts.createBinary(paramName, ts.SyntaxKind.AsteriskToken, ts.createCall(functionName, /*typeArgs*/ undefined, [decrementedArg]));
    var statements = [ts.createIf(condition, ifBody), ts.createReturn(recurse)];
    return ts.createFunctionDeclaration(
    /*decorators*/ undefined, 
    /*modifiers*/ [ts.createToken(ts.SyntaxKind.ExportKeyword)], 
    /*asteriskToken*/ undefined, functionName, 
    /*typeParameters*/ undefined, [parameter], 
    /*returnType*/ ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword), ts.createBlock(statements, /*multiline*/ true));
}
var resultFile = ts.createSourceFile("someFileName.ts", "", ts.ScriptTarget.Latest, 
/*setParentNodes*/ false, ts.ScriptKind.TS);
var printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
});
var result = printer.printNode(ts.EmitHint.Unspecified, makeFactorialFunction(), resultFile);
console.log(result);
//# sourceMappingURL=ts_ast_printer_example.js.map