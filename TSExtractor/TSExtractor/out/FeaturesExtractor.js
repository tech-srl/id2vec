"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProgramFeatures_1 = require("./FeaturesEntities/ProgramFeatures");
var Common_1 = require("./Common/Common");
var typescript_1 = require("typescript");
var ts_morph_1 = require("ts-morph");
var FeatureExtractor = /** @class */ (function () {
    function FeatureExtractor(commandLineValues, filePath) {
        this.m_CommandLineValues = commandLineValues;
        this.filePath = filePath;
        this.program = typescript_1.createProgram([this.filePath], typescript_1.getDefaultCompilerOptions());
        this.checker = this.program.getTypeChecker();
        this.project = new ts_morph_1.Project();
        this.sourceFile = this.project.addExistingSourceFile(filePath);
        this.sourceFile.getSymbol();
        this.findFunctionAndMethodEntries(this.sourceFile);
        this.root = this.sourceFile.compilerNode;
        this.functions = new Array();
        this.findFunctions(this.root);
    }
    FeatureExtractor.init = function () {
        FeatureExtractor.s_ParentTypeToAddChildId.add("AssignExpr");
        FeatureExtractor.s_ParentTypeToAddChildId.add("ArrayAccessExpr");
        FeatureExtractor.s_ParentTypeToAddChildId.add("FieldAccessExpr");
        FeatureExtractor.s_ParentTypeToAddChildId.add("MethodCallExpr");
    };
    /**
     * Extracts program features. Each feature contains all the contexts of a specific identifier in the AST.
     */
    FeatureExtractor.prototype.extractFeatures = function () {
        var programFeatures = new Array();
        for (var _i = 0, _a = this.functions; _i < _a.length; _i++) {
            var func = _a[_i];
            var identifiersSymbols = this.getFuncIdsSymbols(func);
            if (identifiersSymbols.length == 0)
                continue;
            var idsLeavesLists = this.createLeavesListForEachIdentifier(func);
            if (idsLeavesLists.length == 0)
                continue;
            var funcLeaves = this.getFunctionLeaves(func);
            var funcProgramFeatures = this.generatePathFeaturesForFunction(idsLeavesLists, funcLeaves, identifiersSymbols);
            programFeatures = programFeatures.concat(funcProgramFeatures);
        }
        return programFeatures;
    };
    /**
     * Gets the symbols of the identifiers in function /func.
     * @param func - the function whose identifiers' symbols should be returned.
     */
    FeatureExtractor.prototype.getFuncIdsSymbols = function (func) {
        var identifiersSymbols = new Array();
        var funcName;
        func.forEachChild(function (node) {
            if (node.kind == typescript_1.SyntaxKind.Identifier)
                funcName = node.getText();
        });
        var funcEntry = this.functionAndMethodEntries.filter(function (entry) { return entry.getName() == funcName; })[0];
        if (funcEntry == null)
            return identifiersSymbols;
        var variableEntries = funcEntry.valueDeclaration['locals'];
        variableEntries.forEach(function (id) {
            identifiersSymbols.push(id);
        });
        return identifiersSymbols;
    };
    /**
     * Creates for each identifier in the program an array of all its leaves. Then it returns
     * all these arrays (in an array).
     */
    FeatureExtractor.prototype.createLeavesListForEachIdentifier = function (func) {
        var lists = new Array();
        var idLeaves = this.getFunctionIdLeaves(func);
        if (idLeaves.length == 0)
            return null;
        idLeaves.sort(function (n1, n2) {
            var s1 = n1.getText(), s2 = n2.getText();
            if (s1 > s2)
                return 1;
            else if (s1 < s2)
                return -1;
            return 0;
        });
        lists.push(new Array());
        var prev_id = idLeaves[0];
        for (var i = 0, j = 0; i < idLeaves.length; i++) {
            if (idLeaves[i].getText() == prev_id.getText()) {
                lists[j].push(idLeaves[i]);
            }
            else {
                lists.push(new Array());
                lists[++j].push(idLeaves[i]);
                prev_id = idLeaves[i];
            }
        }
        return lists;
    };
    /**
     * Gets the leaves of the identifiers in function /func.
     * @param func - the function.
     */
    FeatureExtractor.prototype.getFunctionIdLeaves = function (func) {
        var functionIdLeaves = new Array();
        function findFunctionIdLeaves(node) {
            if (node.kind === typescript_1.SyntaxKind.Identifier) {
                functionIdLeaves.push(node);
            }
            node.forEachChild(findFunctionIdLeaves);
        }
        findFunctionIdLeaves(func);
        return functionIdLeaves;
    };
    /**
     * Gets the leaves of function /func.
     * @param func - the function.
     */
    FeatureExtractor.prototype.getFunctionLeaves = function (func) {
        var functionLeaves = new Array();
        function findFunctionIdLeaves(node) {
            if (node.getChildCount() == 0) {
                functionLeaves.push(node);
            }
            node.forEachChild(findFunctionIdLeaves);
        }
        findFunctionIdLeaves(func);
        return functionLeaves;
    };
    /**
     * Generates features (contexts; paths) for each identifier in the AST.
     * @param idLeavesLists - an array of arrays. Each array in idLeavesLists contains all the
     * leaves of a specific identifier.
     */
    FeatureExtractor.prototype.generatePathFeaturesForFunction = function (idLeavesLists, functionLeaves, identifiersSymbols) {
        var identifiersFeatures = new Array();
        for (var _i = 0, idLeavesLists_1 = idLeavesLists; _i < idLeavesLists_1.length; _i++) {
            var idLeaves = idLeavesLists_1[_i];
            var singleIdFeatures = this.generatePathFeaturesForIdentifier(idLeaves, functionLeaves, identifiersSymbols);
            if (!singleIdFeatures.isEmpty()) {
                identifiersFeatures.push(singleIdFeatures);
            }
        }
        return identifiersFeatures;
    };
    /**
     * Generates features (contexts; paths) for an identifier in the AST.
     * @param idLeaves - the identifier's leaves in the AST.
     */
    FeatureExtractor.prototype.generatePathFeaturesForIdentifier = function (idLeaves, functionLeaves, identifiersSymbols) {
        var programFeatures = new ProgramFeatures_1.ProgramFeatures(this.m_CommandLineValues, idLeaves.length);
        var identifier = idLeaves[0];
        programFeatures.setVariableName(identifier.getText());
        // Find and set the identifier's type:
        var idSymbol = identifiersSymbols.filter(function (id) { return id.getName() === identifier.getText(); })[0];
        if (idSymbol == null)
            return programFeatures;
        var currType = this.checker.getTypeOfSymbolAtLocation(idSymbol, identifier);
        if (currType.flags === typescript_1.TypeFlags.Object) {
            programFeatures.setVariableType(currType.symbol.name);
        }
        else if (typescript_1.TypeFlags[currType.flags]) {
            programFeatures.setVariableType(typescript_1.TypeFlags[currType.flags].toLowerCase());
        }
        else {
            return programFeatures;
        }
        // The following loop will create paths between the identifier's leaves themselves:
        for (var i = 0; i < idLeaves.length; i++) {
            for (var j = i + 1; j < idLeaves.length; j++) {
                var source = idLeaves[i];
                var target = idLeaves[j];
                var path = this.generatePath(source, target);
                if (path != Common_1.Common.EmptyString) {
                    programFeatures.addFeature(source, path, target);
                }
            }
        }
        /* The following loop will create paths between the identifier's leaves and
        all other leaves: */
        for (var i = 0; i < idLeaves.length; i++) {
            for (var j = 0; j < functionLeaves.length; j++) {
                var source = idLeaves[i];
                var target = functionLeaves[j];
                // This if statement makes sure we don't create a path between the identifier's leaves again:
                if (source.getText() == target.getText())
                    continue;
                var path = this.generatePath(source, target);
                if (path != Common_1.Common.EmptyString) {
                    programFeatures.addFeature(source, path, target);
                }
            }
        }
        return programFeatures;
    };
    /**
     * Finds the nodes of functions and methods in the AST whose root is /node.
     * @param node
     */
    FeatureExtractor.prototype.findFunctions = function (root) {
        var functions = new Array();
        function findFunctionNodes(node) {
            if (node.kind == typescript_1.SyntaxKind.FunctionDeclaration || node.kind == typescript_1.SyntaxKind.MethodDeclaration) {
                functions.push(node);
            }
            node.forEachChild(findFunctionNodes);
        }
        findFunctionNodes(root);
        this.functions = functions;
    };
    /**
     * Finds the symbols of the identifiers defined in functions and methods.
     * @param sourceFile - the source file.
     */
    FeatureExtractor.prototype.findFunctionAndMethodEntries = function (sourceFile) {
        var _this = this;
        // Get the identifiers table
        var localEntries = sourceFile.compilerNode['locals'];
        var functionAndMethodEntries = new Array();
        // The following forEach loop gets all the functions' entries and methods' entries:
        localEntries.forEach(function (entry) {
            if (entry.valueDeclaration && entry.valueDeclaration.kind == typescript_1.SyntaxKind.FunctionDeclaration) {
                // entry is a function
                functionAndMethodEntries.push(entry);
            }
            else if (entry.declarations && entry.declarations[0].kind == typescript_1.SyntaxKind.ClassDeclaration) {
                var members = _this.checker.getExportSymbolOfSymbol(entry).members;
                // entry is a class; The following forEach loop gets all the methods' entries of this class
                members.forEach(function (entry) {
                    if (entry.valueDeclaration && entry.valueDeclaration.kind == typescript_1.SyntaxKind.MethodDeclaration) {
                        // entry is a method
                        functionAndMethodEntries.push(entry);
                    }
                });
            }
            else
                return;
        });
        this.functionAndMethodEntries = functionAndMethodEntries;
    };
    /**
     * Generates a string which represents a path between two leaves in the AST.
     * @param source - a source node (leaf).
     * @param target - a target node (leaf).
     */
    FeatureExtractor.prototype.generatePath = function (source, target) {
        var down = FeatureExtractor.downSymbol;
        var up = FeatureExtractor.upSymbol;
        var startSymbol = FeatureExtractor.lparen;
        var endSymbol = FeatureExtractor.rparen;
        var stringBuilder = Common_1.Common.EmptyString;
        var sourceStack = FeatureExtractor.getTreeStack(source);
        var targetStack = FeatureExtractor.getTreeStack(target);
        var commonPrefix = 0;
        var currentSourceAncestorIndex = sourceStack.length - 1;
        var currentTargetAncestorIndex = targetStack.length - 1;
        while (currentSourceAncestorIndex >= 0 && currentTargetAncestorIndex >= 0
            && sourceStack[currentSourceAncestorIndex] == targetStack[currentTargetAncestorIndex]) {
            commonPrefix++;
            currentSourceAncestorIndex--;
            currentTargetAncestorIndex--;
        }
        var pathLength = sourceStack.length + targetStack.length - 2 * commonPrefix;
        if (pathLength > this.m_CommandLineValues.MaxPathLength) {
            return Common_1.Common.EmptyString;
        }
        /* Don't create a path between leaves that belong to different functions, classes and interfaces.
        This loop also makes sure that the path is created only between two leaves of the same line of code, or the same
        block (for example an if statement or a loop). This happens because we stop when we see that a FunctionDeclaration
        is in the path (the same happens with ClassDeclaration and InterfaceDeclaration). */
        for (var i = 0; i <= sourceStack.length - commonPrefix; i++) {
            var currentNode = sourceStack[i];
            var kind = currentNode.kind;
            var pathUpperBoundTypes = [typescript_1.SyntaxKind.SourceFile, typescript_1.SyntaxKind.FunctionDeclaration, typescript_1.SyntaxKind.MethodDeclaration, typescript_1.SyntaxKind.ClassDeclaration, typescript_1.SyntaxKind.InterfaceDeclaration];
            if (pathUpperBoundTypes.some(function (x) { return x === kind; })) {
                return Common_1.Common.EmptyString;
            }
        }
        // Build the string up the path
        for (var i = 0; i < sourceStack.length - commonPrefix; i++) {
            var currentNode = sourceStack[i];
            stringBuilder = stringBuilder + startSymbol +
                typescript_1.SyntaxKind[currentNode.kind] + endSymbol + up;
        }
        // Add the common ancestor
        var commonNode = sourceStack[sourceStack.length - commonPrefix];
        stringBuilder = stringBuilder + startSymbol +
            typescript_1.SyntaxKind[commonNode.kind] + endSymbol;
        // Continue building the string down the path
        for (var i = targetStack.length - commonPrefix - 1; i >= 0; i--) {
            var currentNode = targetStack[i];
            stringBuilder = stringBuilder + down + startSymbol +
                typescript_1.SyntaxKind[currentNode.kind] + endSymbol;
        }
        return stringBuilder;
    };
    /**
     * Gets the actual path in the AST between the given node and the root.
     * @param node - The returned path contains all the nodes between the node and the root
     */
    FeatureExtractor.getTreeStack = function (node) {
        var upStack = new Array();
        var currentNode = node;
        while (currentNode != null) {
            upStack.push(currentNode);
            currentNode = currentNode.parent;
        }
        return upStack;
    };
    FeatureExtractor.s_ParentTypeToAddChildId = new Set();
    FeatureExtractor.lparen = "(";
    FeatureExtractor.rparen = ")";
    FeatureExtractor.upSymbol = "^";
    FeatureExtractor.downSymbol = "_";
    return FeatureExtractor;
}());
exports.FeatureExtractor = FeatureExtractor;
//# sourceMappingURL=FeaturesExtractor.js.map