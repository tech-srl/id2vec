# id2vec

This project is based on code2vec.

**Operating id2vec on an Ubuntu machine:**

First, run the following commands:

```bash
cd /path/to/id2vec
dos2unix init.sh preprocess.sh train.sh scripts/splitData.sh
chmod 744 init.sh preprocess.sh train.sh
```

Then run init.sh in order to install necessary packages:
```bash
./init.sh
```

Then, remove unnecessary files and split the data before preprocessing it:
```bash
find raw_data ! -name '*.ts' -type f -exec rm -f {} +
scripts/splitData.sh raw_data 80
cd raw_data
mv train_dir train_dir_tmp
../scripts/splitData.sh train_dir_tmp 80
mv train_dir_tmp/test_dir train_dir_tmp/val_dir
mv train_dir_tmp/* .
cd ..
rmdir raw_data/train_dir_tmp
```

To preprocess, run the following commands inside a shell of your ubuntu machine in order for the script to run in the background:
```bash
./preprocess.sh &
disown
```

Explanation: the `&` literal disconnects stdin from the process that runs the preprocess.sh script,
and returns it to your shell. Then, the `disown` command removes the process from the shell's job control. This way,
even if your terminal session is terminated (as happens when your ssh connection to the machine is terminated)
the process will continue running in the background.

Finally, to train the neural network run:
```bash
./train.sh
```
