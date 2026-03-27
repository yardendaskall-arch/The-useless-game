#!/usr/bin/env node

'use strict';

const readline = require('readline');

// Game state
let switchOn = false;
let flips = 0;
let sessionStart = Date.now();

// ANSI color codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const WHITE = '\x1b[37m';
const BG_BLACK = '\x1b[40m';

function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[H');
}

function renderSwitch(on) {
  if (on) {
    return [
      `  ${GREEN}${BOLD}┌─────────┐${RESET}`,
      `  ${GREEN}${BOLD}│  [ ON ] │${RESET}`,
      `  ${GREEN}${BOLD}│    │    │${RESET}`,
      `  ${GREEN}${BOLD}│   ─┘    │${RESET}`,
      `  ${GREEN}${BOLD}│         │${RESET}`,
      `  ${GREEN}${BOLD}│   [ ]   │${RESET}`,
      `  ${GREEN}${BOLD}└─────────┘${RESET}`,
    ].join('\n');
  } else {
    return [
      `  ${DIM}┌─────────┐${RESET}`,
      `  ${DIM}│  [OFF]  │${RESET}`,
      `  ${DIM}│         │${RESET}`,
      `  ${DIM}│   [ ]   │${RESET}`,
      `  ${DIM}│    ┐    │${RESET}`,
      `  ${DIM}│   ─┘    │${RESET}`,
      `  ${DIM}└─────────┘${RESET}`,
    ].join('\n');
  }
}

function getAchievement(flips) {
  if (flips === 1)   return `${YELLOW}Achievement unlocked: "First Flip"${RESET}`;
  if (flips === 10)  return `${YELLOW}Achievement unlocked: "Double Digits"${RESET}`;
  if (flips === 50)  return `${YELLOW}Achievement unlocked: "Are You OK?"${RESET}`;
  if (flips === 100) return `${YELLOW}Achievement unlocked: "Centurion of Boredom"${RESET}`;
  if (flips === 500) return `${YELLOW}Achievement unlocked: "Deeply Committed"${RESET}`;
  if (flips === 1000) return `${RED}${BOLD}Achievement unlocked: "You Need Help"${RESET}`;
  return null;
}

function getStatus(on) {
  if (on) return `${GREEN}${BOLD}ON${RESET}  (the light is on. cool.)`;
  return `${DIM}OFF${RESET} (the light is off. riveting.)`;
}

function render() {
  clearScreen();

  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');

  console.log();
  console.log(`  ${CYAN}${BOLD}THE USELESS GAME${RESET}`);
  console.log(`  ${DIM}a masterpiece of interactive entertainment${RESET}`);
  console.log();
  console.log(renderSwitch(switchOn));
  console.log();
  console.log(`  Status : ${getStatus(switchOn)}`);
  console.log(`  Flips  : ${BOLD}${flips}${RESET}`);
  console.log(`  Time   : ${mins}:${secs} ${DIM}(of your life, gone)${RESET}`);
  console.log();

  const achievement = getAchievement(flips);
  if (achievement) {
    console.log(`  ${achievement}`);
    console.log();
  }

  console.log(`  ${WHITE}[SPACE]${RESET} flip the switch   ${WHITE}[Q]${RESET} quit`);
  console.log();
}

function flip() {
  switchOn = !switchOn;
  flips++;
  render();
}

// Setup raw mode for keypress
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

process.stdin.on('keypress', (str, key) => {
  if (!key) return;

  if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
    clearScreen();
    console.log();
    console.log(`  ${CYAN}${BOLD}Thanks for playing The Useless Game.${RESET}`);
    console.log();
    console.log(`  You flipped the switch ${BOLD}${flips}${RESET} time${flips !== 1 ? 's' : ''}.`);
    if (flips === 0) {
      console.log(`  ${DIM}You didn't even flip it once. Legendary.${RESET}`);
    } else if (flips < 10) {
      console.log(`  ${DIM}A restrained performance.${RESET}`);
    } else if (flips < 100) {
      console.log(`  ${DIM}More than most would.${RESET}`);
    } else {
      console.log(`  ${RED}Please seek professional help.${RESET}`);
    }
    console.log();
    process.exit(0);
  }

  if (key.name === 'space' || str === ' ') {
    flip();
  }
});

// Redraw every second to update the timer
setInterval(() => {
  render();
}, 1000);

// Initial render
render();
