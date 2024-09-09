#!/bin/bash

if [ "$1" == "internal" ]; then
  cp scripts/misc_internal.ts src/utils/misc.ts
fi