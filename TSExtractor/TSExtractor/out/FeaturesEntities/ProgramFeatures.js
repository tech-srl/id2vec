"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProgramRelations_1 = require("./ProgramRelations");
var Property_1 = require("./Property");
var ProgramFeatures = /** @class */ (function () {
    function ProgramFeatures(commandLineValues, numOfInstances) {
        this.features = new Array();
        this.m_CommandLineValues = commandLineValues;
        this.numOfInstances = numOfInstances;
    }
    ProgramFeatures.prototype.toString = function () {
        var debugMode = this.m_CommandLineValues.debugMode;
        var testSetMode = this.m_CommandLineValues.testSetMode;
        var res;
        if (debugMode) {
            res = this.getVariableName();
            res += "|" + this.getVariableType();
        }
        else {
            res = this.getVariableType();
        }
        if (testSetMode) {
            res += " " + this.numOfInstances;
        }
        for (var _i = 0, _a = this.getFeatures(); _i < _a.length; _i++) {
            var feature = _a[_i];
            res += " " + feature.toString();
        }
        return res;
    };
    ProgramFeatures.prototype.addFeature = function (source, path, target) {
        var sourceProperty = new Property_1.Property(source);
        var targetProperty = new Property_1.Property(target);
        var newRelation = new ProgramRelations_1.ProgramRelation(sourceProperty, targetProperty, path);
        this.features.push(newRelation);
    };
    ProgramFeatures.prototype.getNumFeatures = function () {
        return this.features.length;
    };
    ProgramFeatures.prototype.isEmpty = function () {
        return this.features.length == 0;
    };
    ProgramFeatures.prototype.setVariableType = function (varType) {
        this.variableType = varType;
    };
    ProgramFeatures.prototype.getVariableType = function () {
        return this.variableType;
    };
    ProgramFeatures.prototype.setVariableName = function (varName) {
        this.variableName = varName;
    };
    ProgramFeatures.prototype.getVariableName = function () {
        return this.variableName;
    };
    ProgramFeatures.prototype.getFeatures = function () {
        return this.features;
    };
    return ProgramFeatures;
}());
exports.ProgramFeatures = ProgramFeatures;
//# sourceMappingURL=ProgramFeatures.js.map