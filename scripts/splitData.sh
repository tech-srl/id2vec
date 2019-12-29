#!/bin/bash

# This script receives a data directory and randomly splits its subdirectories into two data directores - train_dir and test_dir.
# Arguments:
# /data_dir is the path to the data directory.
# /split_percentage is the proportional size of train_dir.

# calculate the dir's size in M
function dirSize {
	echo `du -h -s -m $1 | cut -f1`
}

data_dir=$1
split_percentage=$2

data_dir_size=`dirSize $data_dir`
let data_dir_size-=`du -h -s -m --separate-dirs $data_dir | cut -f1`
if ((data_dir_size == 0)); then
	echo "Error: $data_dir is empty!"
	exit
fi

if ((split_percentage < 0 || split_percentage > 100)); then
	echo "Error: Invalid parameter: split percentage should be a value between 0 and 100" 
	exit
fi

train_dir=${data_dir}train_dir
test_dir=${data_dir}test_dir
mkdir -p ${train_dir} ${test_dir}

split_rate=`echo "scale=2;
$split_percentage / 100" \
| bc`

sub_dirs=`find $data_dir -maxdepth 1 -type d | tail --lines=+2`
sub_dirs=`shuf -e $(echo ${sub_dirs[*]})`

target_dir=$train_dir
i=0
for sub_dir in ${sub_dirs[*]}
do
	let i++
	if [[ $sub_dir == $train_dir || $sub_dir == $test_dir ]]; then
		continue
	fi
	mv $sub_dir $target_dir
	if [[ $target_dir == $train_dir ]]; then
		train_dir_size=`dirSize $train_dir`
		proportion=`echo "scale=2; $train_dir_size / $data_dir_size" | bc`
		printf "\rtrain dir size: ${train_dir_size}M ; split rate: %.2f" $proportion
		if (( $(echo "$proportion >= $split_rate" | bc -l) )); then
			target_dir=$test_dir
			printf '\n'
		fi
	else
		test_dir_size=`dirSize $test_dir`
		printf "\rtest dir size: ${test_dir_size}M"
	fi
done
printf "\n"

echo "data dir: $data_dir"
echo "train dir: $train_dir"
echo "test dir: $test_dir"
echo "data dir size: ${data_dir_size}M"
echo "train dir size: ${train_dir_size}M"
echo "test dir size: ${test_dir_size}M"
printf "final split rate = %.2f\n" $proportion