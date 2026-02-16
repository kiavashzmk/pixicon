#!/usr/bin/env node

import { readFileSync } from 'fs';
import { handleGrid } from '../src/commands/grid.js';
import { handleCells } from '../src/commands/cells.js';
import { handleAnim } from '../src/commands/anim.js';
import { handleFrame } from '../src/commands/frame.js';
import { handleExport } from '../src/commands/export.js';
import { handleDescribe } from '../src/commands/describe.js';
import { handleValidate } from '../src/commands/validate.js';
import { handlePalette } from '../src/commands/palette.js';
import { PixiconError } from '../src/errors.js';

const COMMANDS = {
  grid: handleGrid,
  cells: handleCells,
  anim: handleAnim,
  frame: handleFrame,
  export: handleExport,
  describe: handleDescribe,
  validate: handleValidate,
  palette: handlePalette,
  schema: handleDescribe,
};

function parseArgs(argv) {
  const args = argv.slice(2);
  const noun = args[0];
  let verb = null;
  let dataStr = null;
  let inputFile = null;

  let i = 1;
  // If the second arg doesn't start with --, it's the verb
  if (args[i] && !args[i].startsWith('--')) {
    verb = args[i];
    i++;
  }

  for (; i < args.length; i++) {
    if (args[i] === '--data' && args[i + 1]) {
      dataStr = args[++i];
    } else if (args[i] === '--input' && args[i + 1]) {
      inputFile = args[++i];
    }
  }

  return { noun, verb, dataStr, inputFile };
}

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve(null);
      return;
    }
    const chunks = [];
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(chunks.length ? chunks.join('') : null));
    process.stdin.on('error', () => resolve(null));
  });
}

async function main() {
  const { noun, verb, dataStr, inputFile } = parseArgs(process.argv);

  if (!noun) {
    const cmds = Object.keys(COMMANDS).join(', ');
    process.stderr.write(JSON.stringify({
      error: 'USAGE',
      message: `Usage: pixicon <command> [verb] [--data '<json>'] [--input <file>]\nCommands: ${cmds}`,
    }) + '\n');
    process.exit(2);
  }

  const handler = COMMANDS[noun];
  if (!handler) {
    process.stderr.write(JSON.stringify({
      error: 'UNKNOWN_COMMAND',
      message: `Unknown command: "${noun}". Available: ${Object.keys(COMMANDS).join(', ')}`,
    }) + '\n');
    process.exit(2);
  }

  // Parse --data
  let data = null;
  if (dataStr) {
    try {
      data = JSON.parse(dataStr);
    } catch (e) {
      process.stderr.write(JSON.stringify({
        error: 'INVALID_JSON',
        message: `Invalid JSON in --data: ${e.message}`,
        path: '--data',
      }) + '\n');
      process.exit(1);
    }
  }

  // Read document from stdin or --input
  let document = null;
  let rawInput = null;

  if (inputFile) {
    try {
      rawInput = readFileSync(inputFile, 'utf8');
    } catch (e) {
      process.stderr.write(JSON.stringify({
        error: 'FILE_READ',
        message: `Cannot read file: ${e.message}`,
        path: inputFile,
      }) + '\n');
      process.exit(1);
    }
  } else {
    rawInput = await readStdin();
  }

  if (rawInput) {
    try {
      document = JSON.parse(rawInput);
    } catch (e) {
      process.stderr.write(JSON.stringify({
        error: 'INVALID_JSON',
        message: `Invalid JSON on stdin: ${e.message}`,
        path: 'stdin',
      }) + '\n');
      process.exit(1);
    }
  }

  try {
    const result = handler(verb, data, document);
    process.stdout.write(JSON.stringify(result) + '\n');
  } catch (e) {
    if (e instanceof PixiconError) {
      process.stderr.write(JSON.stringify(e.toJSON()) + '\n');
      process.exit(1);
    }
    process.stderr.write(JSON.stringify({
      error: 'INTERNAL',
      message: e.message,
    }) + '\n');
    process.exit(1);
  }
}

main();
