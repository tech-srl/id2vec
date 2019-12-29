"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MethodContent = /** @class */ (function () {
    function MethodContent() {
    }
    MethodContent.prototype.MethodContent = function (leaves, name, length) {
        this.leaves = leaves;
        this.name = name;
        this.length = length;
    };
    MethodContent.prototype.getLeaves = function () {
        return this.leaves;
    };
    MethodContent.prototype.getName = function () {
        return this.name;
    };
    MethodContent.prototype.getLength = function () {
        return this.length;
    };
    return MethodContent;
}());
exports.MethodContent = MethodContent;
//# sourceMappingURL=MethodContent.js.map