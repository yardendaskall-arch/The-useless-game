# The Useless Game

A terminal game where you flip a switch on and off.

That's it. That's the game.

## Install

This package is not published to npm. Install it directly from the downloaded folder.

**Step 1 — Download or clone the repo, then open a terminal in the project folder.**

**Step 2 — Install globally from the local folder:**

```bash
npm install -g .
```

**Step 3 — Play:**

```bash
useless-game
```

### Uninstall

```bash
npm uninstall -g the-useless-game
```

## Controls

| Key     | Action       |
|---------|--------------|
| `SPACE` | Flip switch  |
| `Q`     | Quit         |

## Features

- A switch
- It goes on
- It goes off
- Achievements (for the dedicated)
- A timer tracking how long you've wasted

## Achievements

| Flips | Achievement               |
|-------|---------------------------|
| 1     | First Flip                |
| 10    | Double Digits             |
| 50    | Are You OK?               |
| 100   | Centurion of Boredom      |
| 500   | Deeply Committed          |
| 1000  | You Need Help             |

## Pokédex Scanner

The web deployment also includes a `/pokedex` page: take or upload a photo of a Pokémon plushie, toy,
drawing, or anything that resembles a Pokémon, and it returns the full Pokédex entry (types, abilities,
stats, flavor text, and more).

It works by sending the photo to Claude's vision API to identify the Pokémon, then pulling the entry
from [PokéAPI](https://pokeapi.co/).

### Setup

To enable it on your Vercel deployment, set an environment variable in your Vercel project settings:

- `ANTHROPIC_API_KEY` — an API key from the [Anthropic Console](https://console.anthropic.com/)

Optionally set `ANTHROPIC_MODEL` to override the default vision model (`claude-sonnet-5`).
