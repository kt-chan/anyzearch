#!/bin/bash
{ cd /app/frontend/ &&
  node ./dist/index.js; } &
wait -n
exit $?