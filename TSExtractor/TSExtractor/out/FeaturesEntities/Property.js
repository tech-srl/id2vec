"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Common_1 = require("../Common/Common");
var typescript_1 = require("typescript");
var Property = /** @class */ (function () {
    function Property(node) {
        this.RawType = this.Type = typescript_1.SyntaxKind[node.kind];
        var nameToSplit = node.getFullText();
        var splitNameParts = Common_1.Common.splitToSubtokens(nameToSplit);
        this.SplitName = splitNameParts.join(Common_1.Common.internalSeparator);
        this.Name = Common_1.Common.normalizeName(node.getText(), Common_1.Common.BlankWord);
        if (this.Name.length > Common_1.Common.c_MaxLabelLength) {
            this.Name = this.Name.substring(0, Common_1.Common.c_MaxLabelLength);
        }
        if (this.SplitName.length == 0) {
            this.SplitName = this.Name;
        }
    }
    Property.prototype.getRawType = function () {
        return this.RawType;
    };
    Property.prototype.getType = function () {
        return this.Type;
    };
    Property.prototype.getName = function () {
        return this.Name;
    };
    return Property;
}());
exports.Property = Property;
//# sourceMappingURL=Property.js.map