"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CommandLineValues = /** @class */ (function () {
    function CommandLineValues() {
        this.setArgsDeafultValues();
        var commandLineArgs = this.getCommandLineArgs();
        this.updateCommanLineArgs(commandLineArgs);
    }
    CommandLineValues.prototype.setArgsDeafultValues = function () {
        this.File = null;
        this.Dir = null;
        this.MaxPathLength = 100;
        this.MaxPathWidth = 10;
        this.NoHash = false;
        this.NumThreads = 32;
        this.MinCodeLength = 1;
        this.MaxCodeLength = 10000;
        this.PrettyPrint = false;
        this.MaxChildId = Number.MAX_SAFE_INTEGER;
        this.debugMode = false;
        this.testSetMode = false;
        this.logDir = "TSE_log/";
    };
    CommandLineValues.prototype.getCommandLineArgs = function () {
        var optionDefinitions = [
            { name: 'dir', type: String },
            { name: 'file', type: String },
            { name: 'max_path_length', type: Number },
            { name: 'max_path_width', type: Number },
            { name: 'no_hash', type: Boolean },
            { name: 'num_threads', type: Number },
            { name: 'min_code_len', type: Number },
            { name: 'max_code_len', type: Number },
            { name: 'pretty_print', type: Boolean },
            { name: 'max_child_id', type: Number },
            { name: 'debug', type: Number },
            { name: 'test_set', type: Number },
            { name: 'log_dir', type: String }
        ];
        var commandLineArgs = require('command-line-args');
        var options = commandLineArgs(optionDefinitions);
        return options;
    };
    CommandLineValues.prototype.updateCommanLineArgs = function (commandLineArgs) {
        if (commandLineArgs.max_path_length) {
            this.MaxPathLength = commandLineArgs.max_path_length;
        }
        if (commandLineArgs.max_path_width) {
            this.MaxPathWidth = commandLineArgs.max_path_width;
        }
        if (commandLineArgs.file) {
            this.File = commandLineArgs.file;
        }
        if (commandLineArgs.dir) {
            this.Dir = commandLineArgs.dir;
        }
        if (commandLineArgs.no_hash) {
            this.NoHash = commandLineArgs.no_hash;
        }
        if (commandLineArgs.num_threads) {
            this.NumThreads = commandLineArgs.num_threads;
        }
        if (commandLineArgs.min_code_len) {
            this.MinCodeLength = commandLineArgs.min_code_len;
        }
        if (commandLineArgs.max_code_len) {
            this.MaxCodeLength = commandLineArgs.max_code_len;
        }
        if (commandLineArgs.pretty_print) {
            this.PrettyPrint = commandLineArgs.pretty_print;
        }
        if (commandLineArgs.max_child_id) {
            this.MaxChildId = commandLineArgs.max_child_id;
        }
        if (commandLineArgs.debug) {
            this.debugMode = commandLineArgs.debug;
        }
        if (commandLineArgs.test_set) {
            this.testSetMode = commandLineArgs.test_set;
        }
        if (commandLineArgs.log_dir) {
            var log_dir = commandLineArgs.log_dir;
            if (!commandLineArgs.log_dir.endsWith("/"))
                log_dir += "/";
            this.logDir = log_dir;
        }
    };
    return CommandLineValues;
}());
exports.CommandLineValues = CommandLineValues;
//# sourceMappingURL=CommandLineValues.js.map