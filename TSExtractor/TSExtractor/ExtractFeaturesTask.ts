import { CommandLineValues } from './Common/CommandLineValues';
import { ProgramFeatures } from './FeaturesEntities/ProgramFeatures';
import { Common } from './Common/Common';
import { FeatureExtractor } from './FeaturesExtractor';
import { appendFileSync, writeFileSync } from 'fs';
import fs = require('fs');
import path = require('path');

export class ExtractFeaturesTask {
	static log_file: string = "TSE.log";
	static m_CommandLineValues: CommandLineValues;
	
	/**
	 * Processes the command line values and returns the number of extracted files.
	 */
	public static process(): number {
		ExtractFeaturesTask.log_file = this.m_CommandLineValues.logDir + ExtractFeaturesTask.log_file;
		let num_extracted: number = 0;
		if (this.m_CommandLineValues.File != null) {
			let extracted: boolean = ExtractFeaturesTask.processFile(this.m_CommandLineValues.File);
			if (extracted) num_extracted = 1;
		} else if (this.m_CommandLineValues.Dir != null) {
			num_extracted = ExtractFeaturesTask.processDir();
		}
		return num_extracted;
	}

	/**
	 * Processes a file and returns true if it was extracted (meaning, if there were program features extracted out of it)
	 * and false otherwise.
	 * @param filePath - the file to be processed.
	 */
	private static processFile(filePath: string): boolean {
		let processing_msg: string =  new Date().toLocaleString() + ": Processing file:\n\t\t\t\t\t\t" + filePath + "\n";
		appendFileSync(ExtractFeaturesTask.log_file, processing_msg, Common.UTF8);
		if (!filePath.endsWith('.ts')) {
			let processing_msg: string =  new Date().toLocaleString() + ": Given file is not a .ts file:\n\t\t\t\t\t\t" + filePath + "\n";
			appendFileSync(ExtractFeaturesTask.log_file, processing_msg, Common.UTF8);
			return false;
		}
		try {
			var featureExtractor: FeatureExtractor = new FeatureExtractor(this.m_CommandLineValues, filePath);
			// var features: Array<ProgramFeatures> = featureExtractor.extractFeatures();
			var features: Array<ProgramFeatures> = featureExtractor.extractFeatures();
			if (features == null || features.length == 0) {
				let no_paths_msg: string = new Date().toLocaleString() + ": No paths in file:\n\t\t\t\t\t\t" + filePath + "\n";
				appendFileSync(ExtractFeaturesTask.log_file, no_paths_msg, Common.UTF8);
				return false;
			}
			var toPrint: Array<string> = ExtractFeaturesTask.featuresToString(features);
			for (let i = 0; i < toPrint.length; i++) {
				console.log(toPrint[i]);
			}
		}
		catch(e) {
			let e_msg: string = new Date().toLocaleString() + ": Exception in file:\n\t\t\t\t\t\t" + filePath + ": \"" + e + "\"\n";
			appendFileSync(ExtractFeaturesTask.log_file, e_msg, Common.UTF8);
			return false;
		}
		let finished_msg: string = new Date().toLocaleString() + ": Finished processing file:\n\t\t\t\t\t\t" + filePath + "\n";
		appendFileSync(ExtractFeaturesTask.log_file, finished_msg, Common.UTF8);
		return true;
	}

	/**
	 * Processes a directory and returns the number of .ts files that were extracted.
	 */
	private static processDir(): number {
		let processing_msg: string =  new Date().toLocaleString() + ": Processing directory:\n\t\t\t\t\t\t" + this.m_CommandLineValues.Dir + "\n";
		appendFileSync(ExtractFeaturesTask.log_file, processing_msg, Common.UTF8);
		let dir_path: string = this.m_CommandLineValues.Dir;
		var num_ts_files: number = 0, num_processed: number = 0, num_extracted: number = 0;
		let dir_path_splitted: Array<string> = dir_path.split("/");
		let dir_name: string = dir_path_splitted[dir_path_splitted.length-1];
		let dir_progress_file: string = this.m_CommandLineValues.logDir + dir_name + "_progress.log";
		
		// count the number of .ts files
		walkDir(dir_path, function(filePath: string) {
			if (filePath.endsWith('.ts')) {
				num_ts_files++;
			}
		});

		let start_time: Date = new Date();
		let progress_msg: string = 
					ExtractFeaturesTask.getProgressMessage(num_processed, num_extracted, num_ts_files, dir_path, start_time, false);
		writeFileSync(dir_progress_file, progress_msg);
		
		// extract all .ts files in the directory
		walkDir(dir_path, function(filePath: string) {
			if (!filePath.endsWith('.ts')) {
				return;
			}
			let extracted: boolean = ExtractFeaturesTask.processFile(filePath);
			num_processed++;
			if (extracted) num_extracted++;
			if (num_processed%5 == 0 || num_processed == num_ts_files) {
				let progress_msg: string = 
					ExtractFeaturesTask.getProgressMessage(num_processed, num_extracted, num_ts_files, dir_path, start_time, false);
				writeFileSync(dir_progress_file, progress_msg);
			}
		});
		
		progress_msg = 
			ExtractFeaturesTask.getProgressMessage(num_processed, num_extracted, num_ts_files, dir_path, start_time, true);
		writeFileSync(dir_progress_file, progress_msg);

		let finished_msg: string = new Date().toLocaleString() + ": Extracted a total of " + num_extracted.toString() + " .ts files out of " + num_ts_files + " from directory:\n\t\t\t\t\t\t" + dir_path + "\n";
		finished_msg += new Date().toLocaleString() + ": Finished processing directory:\n\t\t\t\t\t\t" + this.m_CommandLineValues.Dir + "\n";
		appendFileSync(ExtractFeaturesTask.log_file, finished_msg, Common.UTF8);
		appendFileSync(this.m_CommandLineValues.logDir + "NumExtracted.log", num_extracted.toString() + "/" + num_processed.toString() + "\n", Common.UTF8)
		return num_extracted;
	}

	/**
	 * Generates a progress message. Meant to be used by ExtractFeaturesTask.processDir.
	 * @param num_processed - the number of .ts files processed so far.
	 * @param num_extracted - the number of .ts files extracted so far.
	 * @param num_ts_files - the total number of .ts files in the directory.
	 * @param dir_path - the directories' path.
	 * @param start_time - the time when the processing started.
	 * @param finished - a flag that indicates whether the directory has been wholy processed or not.
	 */
	private static getProgressMessage(num_processed:number, num_extracted:number, num_ts_files:number, dir_path:string, start_time:Date, finished:boolean) {
		let current_time: Date = new Date();
		let progress = (num_processed/num_ts_files*100) | 0;
		let progress_msg: string = "TSExtractor is processing directory " + dir_path + ": " + progress + "%\n";
		let processed_msg: string = "Processed " + num_processed.toString() + "/" + num_ts_files.toString() + " .ts files\n";
		let extracted_msg: string = "Extracted " + num_extracted.toString() + "/" + num_processed.toString() + " .ts files\n";
		let start_time_msg: string = "Processing started:\n\t\t\t\t\t" + start_time.toLocaleString() + "\n";
		let current_time_msg: string = "Last updated:\n\t\t\t\t\t" + current_time.toLocaleString() + "\n";
		if (finished) {
			progress_msg = "TSExtractor finished processing directory " + dir_path + ": " + progress + "%\n";
			current_time_msg = "Processing finished:\n\t\t\t\t\t" + current_time.toLocaleString() + "\n";
			let time_difference = new splittedTimeDifference(start_time, current_time);
			current_time_msg += "Total time:\n\t\t\t\t\t";
			if (time_difference.days > 0) current_time_msg += time_difference.days + " days, ";
			if (time_difference.hours > 0) current_time_msg += time_difference.hours + " hours, ";
			if (time_difference.minutes > 0) current_time_msg += time_difference.minutes + " minutes, ";
			current_time_msg = current_time_msg + time_difference.seconds + " seconds.\n";
		}
		return progress_msg + processed_msg + extracted_msg + "\n" + start_time_msg + current_time_msg;
	}

	/**
	 * Renders an array of ProgramFeatures to printable strings.
	 * @param features - the program features.
	 */
	private static featuresToString(features: Array<ProgramFeatures>): Array<string> {
		var strings = new Array<string>();
		for (let singleIdFeatures of features) {
			var toPrint = singleIdFeatures.toString();
			strings.push(toPrint);
		}
		return strings;
	}
}

/**
 * Recursively walks a dir.
 * @param dir - the directory.
 * @param callback - the function to be applied on each file in the directory and in its subdirectories.
 */
function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach( f => {
      let dirPath = path.join(dir, f);
      let isDirectory = fs.statSync(dirPath).isDirectory();
      isDirectory ? 
        walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
};

/**
 * Calculates the time difference between two given dates in a human-readable form.
 * @param date1 - the first date.
 * @param date2 - the second date.
 */
function splittedTimeDifference(date1: Date, date2: Date) {
    let time_difference: number = date2.getTime() - date1.getTime();
    this.seconds = (time_difference / 1000) | 0;
    this.minutes = (time_difference / (1000*60)) | 0;
    this.hours = (time_difference / (1000*60*60)) | 0;
	this.days = (time_difference / (1000*60*60*24)) | 0;
	this.seconds = this.seconds - 60*this.minutes;
	this.minutes = this.minutes - 60*this.hours;
	this.hours = this.hours - 24*this.days;
}