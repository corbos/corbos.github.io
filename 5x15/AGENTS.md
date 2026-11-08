# 5x15

A solo game by Friedemann Friese  
(inspired by the solitaire “Montana”)

## Game components

75 number tiles (5 colors, each with numbers from 1-15)

## Game preparations

- Shuffle all 75 number tiles and place them face up in a play area with 5 rows, each with 15 tiles.
- Search for the five “1s” and remove them from the play area. Shuffle the “1s” again and place them face up as the zeroth column in front of the play area. In this way, you create five gaps in the play area.

## Goal of the game

Sort the number tiles by color ascending from 1-15.

## How to play

The five “1s” in the zeroth column are the starting tiles for the five single-colored rows of numbers. For sorting the remaining 70 number tiles, you will use the play area of 5x15 spaces.

Use the five gaps to sort the number tiles by using these two actions:

<ol type="a">
<li>Place a matching number tile in a gap. The number tile “matches”, if its number is exactly 1 higher than the tile to the left of the gap or exactly 1 lower than the tile to the right of the gap AND if the tile has the same color than the neighboring tile.
</li>
<li>
Shift three or more adjacent consecutive number tiles of the same color AND with the “15” at their end into a gap to their right (thus, in a gap directly to the right of the “15”).
</li>
</ol>

You cannot leave the play area, thus you cannot place a tile to the right of the fifteenth column, or shift neighboring tiles beyond that. After completely sorting a row from 1-15, this row is “gapless” and therefore one column shorter than during the game.

## End of the game

You win 5x15, if you sort all five colors from 1-15.
You lose 5x15, if you get stuck in a loop when using both actions, or if you cannot use these actions anymore.

## Adjusting the difficulty

- Level 1: As action b) you may shift three or more adjacent consecutive number tiles (with the “15” at their end) into a gap to their right.
- Level 2: As action b) you may shift only four or more adjacent consecutive number tiles (with the “15” at their end) into a gap to their right.
- Level 3: As action b) you may shift only five or more adjacent consecutive number tiles (with the “15” at their end) into a gap to their right

```
Author: Friedemann Friese
Graphics & Layout: Friedemann Friese
Editor: Henning Kröpke
Copyright 2020, 2F-Spiele, Bremen/Germany
2F-Spiele
Fedelhören 64
D-28203 Bremen
www.2f-spiele.de
```

## HTML

1. Use modern HTML.
2. Create or update `index.html`.
3. Use a browser-based mobile app.

## JavaScript

1. Use modern JavaScript.
2. Create or update `code.js`.
3. Use a browser-based mobile app.

## CSS

1. Use modern CSS.
2. Create or update `style.css`.
3. CSS Themes/Modes:
    - light
    - dark
    - solarized
    - dracula
4. Use a browser-based mobile app.
5. Updated the tiles:
    - Red: horizontal lines
    - Green: vertical lines
    - Yellow: wavy lines
    - Purple: diagonal lines
    - Blue: no lines