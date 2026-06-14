#!/bin/bash
cd "$(dirname "$0")/.."
exec node progress/server.js
