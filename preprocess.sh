#!/usr/bin/env bash
###########################################################

# Change the following values to preprocess a new dataset.
# TRAIN_DIR, VAL_DIR and TEST_DIR should be paths to      
#   directories containing sub-directories with .ts files
#   each of {TRAIN_DIR, VAL_DIR and TEST_DIR} should have sub-dirs,
#   and data will be extracted from .ts files found in those sub-dirs).
# DATASET_NAME is just a name for the currently extracted 
#   dataset.                                              
# MAX_CONTEXTS is the number of contexts to keep for each 
#   method (by default 200).                              
# WORD_VOCAB_SIZE, PATH_VOCAB_SIZE, TARGET_VOCAB_SIZE -   
#   - the number of words, paths and target words to keep 
#   in the vocabulary (the top occurring words and paths will be kept). 
#   The default values are reasonable for a Tesla K80 GPU 
#   and newer (12 GB of board memory).
# NUM_THREADS - the number of parallel threads to use. It is 
#   recommended to use a multi-core machine for the preprocessing 
#   step and set this value to the number of cores.
# PYTHON - python3 interpreter alias.
TRAIN_DIR=raw_data/train_dir
VAL_DIR=raw_data/val_dir
TEST_DIR=raw_data/test_dir
VAL_LOG_DIR=TSE_log/val_dir
TEST_LOG_DIR=TSE_log/test_dir
TRAIN_LOG_DIR=TSE_log/train_dir
DATASET_NAME=ts_dataset
MAX_CONTEXTS=200
WORD_VOCAB_SIZE=1301136
PATH_VOCAB_SIZE=911417
TARGET_VOCAB_SIZE=261245
NUM_THREADS=64
PYTHON=python3
MAX_PATH_LENGTH=6
###########################################################

mkdir -p data/${DATASET_NAME}
mkdir -p tmp_preprocessed_data
mkdir -p ${VAL_LOG_DIR} ${TEST_LOG_DIR} ${TRAIN_LOG_DIR}

TRAIN_DATA_FILE=tmp_preprocessed_data/${DATASET_NAME}.train.raw.txt
VAL_DATA_FILE=tmp_preprocessed_data/${DATASET_NAME}.val.raw.txt
TEST_DATA_FILE=tmp_preprocessed_data/${DATASET_NAME}.test.raw.txt

rm ${VAL_LOG_DIR}/NumExtracted.log ${TEST_LOG_DIR}/NumExtracted.log ${TRAIN_LOG_DIR}/NumExtracted.log

echo "Extracting paths from validation set..."
${PYTHON} TSExtractor/extract.py --dir ${VAL_DIR} --max_path_length ${MAX_PATH_LENGTH} --max_path_width 2 --log_dir ${VAL_LOG_DIR} > ${VAL_DATA_FILE}
echo "Finished extracting paths from validation set"
echo "Extracting paths from test set..."
${PYTHON} TSExtractor/extract.py --dir ${TEST_DIR} --max_path_length ${MAX_PATH_LENGTH} --max_path_width 2 --test_set 0 --log_dir ${TEST_LOG_DIR} > ${TEST_DATA_FILE}
echo "Finished extracting paths from test set"
echo "Extracting paths from training set..."
${PYTHON} TSExtractor/extract.py --dir ${TRAIN_DIR} --max_path_length ${MAX_PATH_LENGTH} --max_path_width 2 --log_dir ${TRAIN_LOG_DIR} | shuf > ${TRAIN_DATA_FILE}
echo "Finished extracting paths from training set"

function modifyNumExtractedLogFile {
	let num_extracted=0
	let num_processed=0
	for line in $(cat $1/NumExtracted.log)
	do
		let num_extracted+=$(echo ${line} | cut -d"/" -f1)
		let num_processed+=$(echo ${line} | cut -d"/" -f2)
	done
	dir=$(echo $1 | rev | cut -d"/" -f1 | rev)
	printf "${dir}: Extracted a total of $num_extracted out of $num_processed .ts files\n" > $1/NumExtracted.log
}

modifyNumExtractedLogFile ${VAL_LOG_DIR}
modifyNumExtractedLogFile ${TEST_LOG_DIR}
modifyNumExtractedLogFile ${TRAIN_LOG_DIR}

TARGET_HISTOGRAM_FILE=data/${DATASET_NAME}/${DATASET_NAME}.histo.tgt.c2v
ORIGIN_HISTOGRAM_FILE=data/${DATASET_NAME}/${DATASET_NAME}.histo.ori.c2v
PATH_HISTOGRAM_FILE=data/${DATASET_NAME}/${DATASET_NAME}.histo.path.c2v

echo "Creating histograms from the training data"
cat ${TRAIN_DATA_FILE} | cut -d' ' -f1 | awk '{n[$0]++} END {for (i in n) print i,n[i]}' > ${TARGET_HISTOGRAM_FILE}
cat ${TRAIN_DATA_FILE} | cut -d' ' -f2- | tr ' ' '\n' | cut -d',' -f1,3 | tr ',' '\n' | awk '{n[$0]++} END {for (i in n) print i,n[i]}' > ${ORIGIN_HISTOGRAM_FILE}
cat ${TRAIN_DATA_FILE} | cut -d' ' -f2- | tr ' ' '\n' | cut -d',' -f2 | awk '{n[$0]++} END {for (i in n) print i,n[i]}' > ${PATH_HISTOGRAM_FILE}

${PYTHON} preprocess.py --train_data ${TRAIN_DATA_FILE} --test_data ${TEST_DATA_FILE} --val_data ${VAL_DATA_FILE} \
  --max_contexts ${MAX_CONTEXTS} --word_vocab_size ${WORD_VOCAB_SIZE} --path_vocab_size ${PATH_VOCAB_SIZE} \
  --target_vocab_size ${TARGET_VOCAB_SIZE} --word_histogram ${ORIGIN_HISTOGRAM_FILE} \
  --path_histogram ${PATH_HISTOGRAM_FILE} --target_histogram ${TARGET_HISTOGRAM_FILE} --output_name data/${DATASET_NAME}/${DATASET_NAME}
    
# If all went well, the raw data files can be deleted, because preprocess.py creates new files 
# with truncated and padded number of paths for each example.
# rm ${TRAIN_DATA_FILE} ${VAL_DATA_FILE} ${TEST_DATA_FILE} ${TARGET_HISTOGRAM_FILE} ${ORIGIN_HISTOGRAM_FILE} ${PATH_HISTOGRAM_FILE}
# rm -rf tmp_preprocessed_data tmp
