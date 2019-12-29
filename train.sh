#!/usr/bin/env bash

###########################################################
# Change the following values to train a new model.
# type:				The name of the new model, only affects the saved file name.
# dataset_name:		The name of the dataset, as was preprocessed using preprocess.sh.
# data_dir:			The name of the data directory that was created by preprocess.sh.
# data:				A prefix that will eventually be used twice: one time by model.py and
#					another time by PathContextReader.py.
# test_data:		By default, points to the validation set, since this is the set that
#   				will be evaluated after each training iteration. If you wish to test
#   				on the final (held-out) test set, change 'val' to 'test'.
# model_dir:		The name of the directory where the trained models will be saved.

type=ts_dataset
dataset_name=ts_dataset
data_dir=data/${dataset_name}
data=${data_dir}/${dataset_name}
test_data=${data_dir}/${dataset_name}.val.c2v
model_dir=models/${type}

mkdir -p models/${model_dir}
set -e
python3 -u id2vec.py --data ${data} --test ${test_data} --save ${model_dir}/saved_model