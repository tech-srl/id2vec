"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Common_1 = require("./Common/Common");
var FeaturesExtractor_1 = require("./FeaturesExtractor");
var fs_1 = require("fs");
var fs = require("fs");
var path = require("path");
var ExtractFeaturesTask = /** @class */ (function () {
    function ExtractFeaturesTask() {
    }
    /**
     * Processes the command line values and returns the number of extracted files.
     */
    ExtractFeaturesTask.process = function () {
        ExtractFeaturesTask.log_file = this.m_CommandLineValues.logDir + ExtractFeaturesTask.log_file;
        var num_extracted = 0;
        if (this.m_CommandLineValues.File != null) {
            var extracted = ExtractFeaturesTask.processFile(this.m_CommandLineValues.File);
            if (extracted)
                num_extracted = 1;
        }
        else if (this.m_CommandLineValues.Dir != null) {
            num_extracted = ExtractFeaturesTask.processDir();
        }
        return num_extracted;
    };
    /**
     * Processes a file and returns true if it was extracted (meaning, if there were program features extracted out of it)
     * and false otherwise.
     * @param filePath - the file to be processed.
     */
    ExtractFeaturesTask.processFile = function (filePath) {
        var processing_msg = new Date().toLocaleString() + ": Processing file:\n\t\t\t\t\t\t" + filePath + "\n";
        fs_1.appendFileSync(ExtractFeaturesTask.log_file, processing_msg, Common_1.Common.UTF8);
        if (!filePath.endsWith('.ts')) {
            var processing_msg_1 = new Date().toLocaleString() + ": Given file is not a .ts file:\n\t\t\t\t\t\t" + filePath + "\n";
            fs_1.appendFileSync(ExtractFeaturesTask.log_file, processing_msg_1, Common_1.Common.UTF8);
            return false;
        }
        try {
            var featureExtractor = new FeaturesExtractor_1.FeatureExtractor(this.m_CommandLineValues, filePath);
            // var features: Array<ProgramFeatures> = featureExtractor.extractFeatures();
            var features = featureExtractor.extractFeatures();
            if (features == null || features.length == 0) {
                var no_paths_msg = new Date().toLocaleString() + ": No paths in file:\n\t\t\t\t\t\t" + filePath + "\n";
                fs_1.appendFileSync(ExtractFeaturesTask.log_file, no_paths_msg, Common_1.Common.UTF8);
                return false;
            }
            var toPrint = ExtractFeaturesTask.featuresToString(features);
            for (var i = 0; i < toPrint.length; i++) {
                console.log(toPrint[i]);
            }
        }
        catch (e) {
            var e_msg = new Date().toLocaleString() + ": Exception in file:\n\t\t\t\t\t\t" + filePath + ": \"" + e + "\"\n";
            fs_1.appendFileSync(ExtractFeaturesTask.log_file, e_msg, Common_1.Common.UTF8);
            return false;
        }
        var finished_msg = new Date().toLocaleString() + ": Finished processing file:\n\t\t\t\t\t\t" + filePath + "\n";
        fs_1.appendFileSync(ExtractFeaturesTask.log_file, finished_msg, Common_1.Common.UTF8);
        return true;
    };
    /**
     * Processes a directory and returns the number of .ts files that were extracted.
     */
    ExtractFeaturesTask.processDir = function () {
        var processing_msg = new Date().toLocaleString() + ": Processing directory:\n\t\t\t\t\t\t" + this.m_CommandLineValues.Dir + "\n";
        fs_1.appendFileSync(ExtractFeaturesTask.log_file, processing_msg, Common_1.Common.UTF8);
        var dir_path = this.m_CommandLineValues.Dir;
        var num_ts_files = 0, num_processed = 0, num_extracted = 0;
        var dir_path_splitted = dir_path.split("/");
        var dir_name = dir_path_splitted[dir_path_splitted.length - 1];
        var dir_progress_file = this.m_CommandLineValues.logDir + dir_name + "_progress.log";
        // count the number of .ts files
        walkDir(dir_path, function (filePath) {
            if (filePath.endsWith('.ts')) {
                num_ts_files++;
            }
        });
        var start_time = new Date();
        var progress_msg = ExtractFeaturesTask.getProgressMessage(num_processed, num_extracted, num_ts_files, dir_path, start_time, false);
        fs_1.writeFileSync(dir_progress_file, progress_msg);
        // extract all .ts files in the directory
        walkDir(dir_path, function (filePath) {
            if (!filePath.endsWith('.ts')) {
                return;
            }
            var extracted = ExtractFeaturesTask.processFile(filePath);
            num_processed++;
            if (extracted)
                num_extracted++;
            if (num_processed % 5 == 0 || num_processed == num_ts_files) {
                var progress_msg_1 = ExtractFeaturesTask.getProgressMessage(num_processed, num_extracted, num_ts_files, dir_path, start_time, false);
                fs_1.writeFileSync(dir_progress_file, progress_msg_1);
            }
        });
        progress_msg =
            ExtractFeaturesTask.getProgressMessage(num_processed, num_extracted, num_ts_files, dir_path, start_time, true);
        fs_1.writeFileSync(dir_progress_file, progress_msg);
        var finished_msg = new Date().toLocaleString() + ": Extracted a total of " + num_extracted.toString() + " .ts files out of " + num_ts_files + " from directory:\n\t\t\t\t\t\t" + dir_path + "\n";
        finished_msg += new Date().toLocaleString() + ": Finished processing directory:\n\t\t\t\t\t\t" + this.m_CommandLineValues.Dir + "\n";
        fs_1.appendFileSync(ExtractFeaturesTask.log_file, finished_msg, Common_1.Common.UTF8);
        fs_1.appendFileSync(this.m_CommandLineValues.logDir + "NumExtracted.log", num_extracted.toString() + "/" + num_processed.toString() + "\n", Common_1.Common.UTF8);
        return num_extracted;
    };
    /**
     * Generates a progress message. Meant to be used by ExtractFeaturesTask.processDir.
     * @param num_processed - the number of .ts files processed so far.
     * @param num_extracted - the number of .ts files extracted so far.
     * @param num_ts_files - the total number of .ts files in the directory.
     * @param dir_path - the directories' path.
     * @param start_time - the time when the processing started.
     * @param finished - a flag that indicates whether the directory has been wholy processed or not.
     */
    ExtractFeaturesTask.getProgressMessage = function (num_processed, num_extracted, num_ts_files, dir_path, start_time, finished) {
        var current_time = new Date();
        var progress = (num_processed / num_ts_files * 100) | 0;
        var progress_msg = "TSExtractor is processing directory " + dir_path + ": " + progress + "%\n";
        var processed_msg = "Processed " + num_processed.toString() + "/" + num_ts_files.toString() + " .ts files\n";
        var extracted_msg = "Extracted " + num_extracted.toString() + "/" + num_processed.toString() + " .ts files\n";
        var start_time_msg = "Processing started:\n\t\t\t\t\t" + start_time.toLocaleString() + "\n";
        var current_time_msg = "Last updated:\n\t\t\t\t\t" + current_time.toLocaleString() + "\n";
        if (finished) {
            progress_msg = "TSExtractor finished processing directory " + dir_path + ": " + progress + "%\n";
            current_time_msg = "Processing finished:\n\t\t\t\t\t" + current_time.toLocaleString() + "\n";
            var time_difference = new splittedTimeDifference(start_time, current_time);
            current_time_msg += "Total time:\n\t\t\t\t\t";
            if (time_difference.days > 0)
                current_time_msg += time_difference.days + " days, ";
            if (time_difference.hours > 0)
                current_time_msg += time_difference.hours + " hours, ";
            if (time_difference.minutes > 0)
                current_time_msg += time_difference.minutes + " minutes, ";
            current_time_msg = current_time_msg + time_difference.seconds + " seconds.\n";
        }
        return progress_msg + processed_msg + extracted_msg + "\n" + start_time_msg + current_time_msg;
    };
    /**
     * Renders an array of ProgramFeatures to printable strings.
     * @param features - the program features.
     */
    ExtractFeaturesTask.featuresToString = function (features) {
        var strings = new Array();
        for (var _i = 0, features_1 = features; _i < features_1.length; _i++) {
            var singleIdFeatures = features_1[_i];
            var toPrint = singleIdFeatures.toString();
            strings.push(toPrint);
        }
        return strings;
    };
    ExtractFeaturesTask.log_file = "TSE.log";
    return ExtractFeaturesTask;
}());
exports.ExtractFeaturesTask = ExtractFeaturesTask;
/**
 * Recursively walks a dir.
 * @param dir - the directory.
 * @param callback - the function to be applied on each file in the directory and in its subdirectories.
 */
function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(function (f) {
        var dirPath = path.join(dir, f);
        var isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ?
            walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}
;
/**
 * Calculates the time difference between two given dates in a human-readable form.
 * @param date1 - the first date.
 * @param date2 - the second date.
 */
function splittedTimeDifference(date1, date2) {
    var time_difference = date2.getTime() - date1.getTime();
    this.seconds = (time_difference / 1000) | 0;
    this.minutes = (time_difference / (1000 * 60)) | 0;
    this.hours = (time_difference / (1000 * 60 * 60)) | 0;
    this.days = (time_difference / (1000 * 60 * 60 * 24)) | 0;
    this.seconds = this.seconds - 60 * this.minutes;
    this.minutes = this.minutes - 60 * this.hours;
    this.hours = this.hours - 24 * this.days;
}
//# sourceMappingURL=ExtractFeaturesTask.js.map