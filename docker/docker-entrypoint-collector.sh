#!/bin/bash

{ cd /app/collector/ &&
  node index.js; } &
wait -n
exit $?

# tail -f /dev/null