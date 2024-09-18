#!/bin/bash

if [ "$1" == "debug" ]; then
  cp scripts/misc_debug.ts src/utils/misc.ts
fi

if [ "$1" == "internal" ]; then
  cp scripts/misc_internal.ts src/utils/misc.ts
fi

if [ "$1" == "production" ]; then
  cp scripts/misc_prod.ts src/utils/misc.ts
fi