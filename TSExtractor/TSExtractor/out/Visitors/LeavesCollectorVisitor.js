"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LeavesCollectorVisitor = /** @class */ (function () {
    function LeavesCollectorVisitor() {
    }
    LeavesCollectorVisitor.getLeaves = function (node) {
        if (node.getChildCount() == 0) {
            LeavesCollectorVisitor.leaves.push(node);
        }
        node.forEachChild(LeavesCollectorVisitor.getLeaves);
    };
    LeavesCollectorVisitor.getLeavesArray = function () {
        return LeavesCollectorVisitor.leaves;
    };
    LeavesCollectorVisitor.leaves = new Array();
    return LeavesCollectorVisitor;
}());
exports.LeavesCollectorVisitor = LeavesCollectorVisitor;
//# sourceMappingURL=LeavesCollectorVisitor.js.map