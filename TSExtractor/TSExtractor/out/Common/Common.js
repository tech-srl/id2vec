"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Common = /** @class */ (function () {
    function Common() {
    }
    Common.normalizeName = function (original, defaultString) {
        var carefulStripped = original.toLowerCase()
            .replace(/\s/g, "") // whitespaces
            .replace(/[\"',]/g, "") // quotes, apostrophies, commas
            .replace(/\\P{Print}/g, ""); // unicode weird characters
        var stripped = original.replace(/[^A-Za-z]/g, "");
        if (stripped.length == 0) {
            if (carefulStripped.length == 0) {
                return defaultString;
            }
            else {
                return carefulStripped;
            }
        }
        else {
            return stripped;
        }
    };
    Common.splitToSubtokens = function (str1) {
        var str2 = str1.trim();
        var strArray = str2.split("(?<=[a-z])(?=[A-Z])|_|[0-9]|(?<=[A-Z])(?=[A-Z][a-z])|\\s+");
        return strArray.filter(function (s) { return s.length > 0; }).map(function (s) { return Common.normalizeName(s, ""); })
            .filter(function (s) { return s.length > 0; });
    };
    Common.EmptyString = "";
    Common.UTF8 = "utf-8";
    Common.internalSeparator = "|";
    Common.EvaluateTempDir = "EvalTemp";
    Common.FieldAccessExpr = "FieldAccessExpr";
    Common.ClassOrInterfaceType = "ClassOrInterfaceType";
    Common.MethodDeclaration = "MethodDeclaration";
    Common.NameExpr = "NameExpr";
    Common.MethodCallExpr = "MethodCallExpr";
    Common.DummyNode = "DummyNode";
    Common.BlankWord = "BLANK";
    Common.c_MaxLabelLength = 50;
    Common.methodName = "METHOD_NAME";
    return Common;
}());
exports.Common = Common;
//# sourceMappingURL=Common.js.map