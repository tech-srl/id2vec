"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utilities_1 = require("../Common/utilities");
var ProgramRelation = /** @class */ (function () {
    function ProgramRelation(sourceName, targetName, path) {
        this.m_Source = sourceName;
        this.m_Target = targetName;
        this.m_Path = path;
        this.m_HashedPath = ProgramRelation.s_Hasher(this.m_Path);
    }
    ProgramRelation.setNoHash = function () {
        ProgramRelation.s_Hasher = function (str) { return str; };
    };
    ProgramRelation.prototype.toString = function () {
        return this.m_Source.getName() + ',' + this.m_HashedPath + ',' + this.m_Target.getName();
    };
    ProgramRelation.prototype.getPath = function () {
        return this.m_Path;
    };
    ProgramRelation.prototype.getSource = function () {
        return this.m_Source;
    };
    ProgramRelation.prototype.getTarget = function () {
        return this.m_Target;
    };
    ProgramRelation.prototype.getHashedPath = function () {
        return this.m_HashedPath;
    };
    ProgramRelation.s_Hasher = function (str) { return utilities_1.hashCode(str).toString(); };
    return ProgramRelation;
}());
exports.ProgramRelation = ProgramRelation;
//# sourceMappingURL=ProgramRelations.js.map