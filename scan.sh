#!/bin/bash

DIR=$1

if [ -z "$DIR" ]; then
  echo "Usage: $0 <directory-path>"
  exit 1
fi

find "$DIR" \
  \( -path "*/node_modules" -o -path "*/__pycache__" -o -path "*/dist" -o -path "*/.git" \) -prune -o \
  -type f \
  ! -name ".DS_Store" \
  ! -name "package-lock.json" \
  -print0 | while IFS= read -r -d '' file; do
    echo "# FILE: $file"
    cat "$file"
    echo ""
done > scan.txt