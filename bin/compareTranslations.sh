#!/bin/bash

files=($(ls src/lang))

for file in ${files[@]}
do
  if [[ ${file} != 'en.json' ]]; then
    echo 'Translation for file : ' ${file}
    # Level 01
    diff <(cat src/lang/en.json | jq 'to_entries? | .[].key') <(cat src/lang/${file} | jq 'to_entries? | .[].key')
    # Level 02
    diff <(cat src/lang/en.json | jq 'to_entries? | .[].value | to_entries? | .[].key') <(cat src/lang/es.json | jq 'to_entries? | .[].value | to_entries? | .[].key')
    # Level 03
    diff <(cat src/lang/en.json | jq 'to_entries? | .[].value | to_entries? | .[].value | to_entries? | .[].key') <(cat src/lang/es.json | jq 'to_entries? | .[].value | to_entries? | .[].value | to_entries? | .[].key')
    # Level 04
    diff <(cat src/lang/en.json | jq 'to_entries? | .[].value | to_entries? | .[].value | to_entries? | .[].value | to_entries? | .[].key') <(cat src/lang/es.json | jq 'to_entries? | .[].value | to_entries? | .[].value | to_entries? | .[].value | to_entries? | .[].key')
  fi
done
