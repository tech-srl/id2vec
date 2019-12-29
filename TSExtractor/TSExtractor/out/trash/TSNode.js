"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var ts = require("typescript");
var CommandLineValues_1 = require("./Common/CommandLineValues");
// I set MaxPathLength to 8 and MaxPathWidth to 2 because these are the values that
// they used in the JavaExtractor project (you can see this when you debug it). The 
// difference is that they didn't set it as global variable like here, they sent it
// as a command line parameter. I'm not sure there is a need to do the same here.
// var MaxPathLength = 8;
// var MaxPathWidth = 2;
var s_CommandLineValues = new CommandLineValues_1.CommandLineValues();
var lparen = "(";
var rparen = ")";
var upSymbol = "^";
var downSymbol = "_";
var emptyString = "";
var leaves = new Array();
function getLeaves(node) {
    // let a = node.getChildCount;
    // let b = node.getChildren;
    // let c = b[0];
    if (node.getChildCount() == 0) {
        leaves.push(node);
    }
    node.forEachChild(getLeaves);
}
function getTreeStack(node) {
    var upStack = new Array();
    var current = node;
    while (current != null) {
        upStack.push(current);
        current = current.parent;
    }
    return upStack;
}
function generatePath(source, target) {
    var startSymbol = lparen;
    var endSymbol = rparen;
    var down = downSymbol;
    var up = upSymbol;
    // stringBuilder is what the function returns
    var stringBuilder = emptyString;
    var sourceStack = getTreeStack(source);
    var targetStack = getTreeStack(target);
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
    if (pathLength > s_CommandLineValues.MaxPathLength) {
        return emptyString;
    }
    // if (currentSourceAncestorIndex >= 0 && currentTargetAncestorIndex >= 0) {
    // 	// original line of code (from the JavaExtractor):
    // 	// int pathWidth = targetStack.get(currentTargetAncestorIndex).getUserData(Common.ChildId)
    // 	// 			- sourceStack.get(currentSourceAncestorIndex).getUserData(Common.ChildId);
    // 	// NOA: getUserData
    // 	var pathWidth: number = targetStack[currentTargetAncestorIndex].getUserData(Common.ChildId)
    // 			- sourceStack[currentSourceAncestorIndex].getUserData(Common.ChildId);
    // 	if (pathWidth > MaxPathWidth) {
    // 		return emptyString;
    // 	}
    // }
    for (var i = 0; i < sourceStack.length - commonPrefix; i++) {
        var currentNode = sourceStack[i];
        //var childId: string = emptyString;
        //String parentRawType = currentNode.getParentNode().getUserData(Common.PropertyKey).getRawType();
        /*if (i == 0 || s_ParentTypeToAddChildId.contains(parentRawType)) {
            childId = saturateChildId(currentNode.getUserData(Common.ChildId))
                    .toString();
        }*/
        stringBuilder = stringBuilder + startSymbol +
            ts.SyntaxKind[currentNode.kind] + /*childId +*/ endSymbol + up;
    }
    var commonNode = sourceStack[sourceStack.length - commonPrefix];
    stringBuilder = stringBuilder + startSymbol +
        ts.SyntaxKind[commonNode.kind] + /*commonNodeChildId +*/ endSymbol;
    for (var i = targetStack.length - commonPrefix - 1; i >= 0; i--) {
        var currentNode = targetStack[i];
        //String childId = Common.EmptyString;
        /*if (i == 0 || s_ParentTypeToAddChildId.contains(currentNode.getUserData(Common.PropertyKey).getRawType())) {
            childId = saturateChildId(currentNode.getUserData(Common.ChildId))
                    .toString();
        }*/
        stringBuilder = stringBuilder + down + startSymbol +
            ts.SyntaxKind[currentNode.kind] + /*childId +*/ endSymbol;
    }
    return stringBuilder;
}
function generatePathFeaturesForFunction( /*MethodContent methodContent*/) {
    //ArrayList<Node> functionLeaves = methodContent.getLeaves();
    //ProgramFeatures programFeatures = new ProgramFeatures(methodContent.getName());
    for (var i = 0; i < leaves.length; i++) {
        for (var j = i + 1; j < leaves.length; j++) {
            //String separator = Common.EmptyString;
            var path = generatePath(leaves[i], leaves[j] /*, separator*/);
            if (path != emptyString) {
                var hashed = StringHashCode(path);
                var noa = hashed.toString();
                console.log(noa);
                //var source:Property = functionLeaves.get(i).getUserData(Common.PropertyKey);
                //Property target = functionLeaves.get(j).getUserData(Common.PropertyKey);
                //programFeatures.addFeature(source, path, target);
            }
        }
    }
    //return programFeatures;
}
// taken from: https://lowrey.me/implementing-javas-string-hashcode-in-javascript/
// function hashString(str: string): number{
// 	let hash: number = 0;
// 	for (let i = 0; i < str.length; i++) {
// 		hash += Math.pow(str.charCodeAt(i) * 31, str.length - i);
// 		hash = hash & hash; // Convert to 32bit integer
// 	}
// 	return hash;
// }
function StringHashCode(str) {
    var str_size = str.length;
    var h = 0;
    var utf8 = unescape(encodeURIComponent(str));
    var arr = [];
    for (var i = 0; i < utf8.length; i++) {
        arr.push(utf8.charCodeAt(i));
    }
    var arr_size = arr.length;
    for (var i = 0; i < arr.length; i++) {
        h = 31 * h + (arr[i] & 0xff);
    }
    return h;
}
/**
 * taken from: https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
 *
 * Returns a hash code for a string.
 * (Compatible to Java's String.hashCode())
 *
 * The hash code for a string object is computed as
 *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
 * using number arithmetic, where s[i] is the i th character
 * of the given string, n is the length of the string,
 * and ^ indicates exponentiation.
 * (The hash value of the empty string is zero.)
 *
 * @param {string} s a string
 * @return {number} a hash code value for the given string.
 */
function hashCode(s) {
    var h = 0;
    var l = s.length;
    var i = 0;
    if (l > 0)
        while (i < l)
            h = (h << 5) - h + s.charCodeAt(i++) | 0;
    return h;
}
;
function instrument(fileName, sourceCode) {
    // sourceFile is the tree itself
    var sourceFile = ts.createSourceFile(fileName, sourceCode, ts.ScriptTarget.Latest, true);
    getLeaves(sourceFile);
}
main: var inputFile = s_CommandLineValues.File;
instrument(inputFile, fs.readFileSync(s_CommandLineValues.File, 'utf-8'));
generatePathFeaturesForFunction();
// if (s_CommandLineValues.File != null) {
// 	extractFeaturesTask:ExtractFeaturesTask = new ExtractFeaturesTask(s_CommandLineValues,
// 		s_CommandLineValues.File.toPath());
// // 	extractFeaturesTask.processFile();
// // } else if (s_CommandLineValues.Dir != null) {
// // 	extractDir();
// }
//# sourceMappingURL=TSNode.js.map