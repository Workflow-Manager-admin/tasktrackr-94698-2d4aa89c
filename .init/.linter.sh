#!/bin/bash
cd /home/kavia/workspace/code-generation/tasktrackr-94698-2d4aa89c/todo_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

