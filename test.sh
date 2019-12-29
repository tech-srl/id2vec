#!/usr/bin/env bash

type=ts_dataset
dataset_name=ts_dataset
data_dir=data/${dataset_name}
test_data=${data_dir}/${dataset_name}.test.c2v
model_dir=models/${type}

# python3 -u id2vec.py  --load models/${type}/saved_model_iter17 --release
python3 -u id2vec.py --load models/${type}/saved_model_iter17 --test ${test_data}