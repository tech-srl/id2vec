"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        var chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
exports.hashCode = hashCode;
;
//# sourceMappingURL=utilities.js.map