#!/bin/bash

I18N_FILES_PATH='src/lang'
I18N_MASTER_FILE_NAME='en.json'


files=($(ls ${I18N_FILES_PATH}))
for file in ${files[@]}
do
  if [[ ${file} != ${I18N_MASTER_FILE_NAME} ]]; then
    echo 'Translation for file : ' ${file}
    keys=($(diff <(jq -r '[paths | join(".")]'  ${I18N_FILES_PATH}/${I18N_MASTER_FILE_NAME}) <(jq -r '[paths | join(".")]' ${I18N_FILES_PATH}/${file})))
    for key in ${keys[@]}
    do
      if [[ ${#key} > 2 ]]; then
        echo ${key}
      fi
    done
  fi
done
