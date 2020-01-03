# Reversi (Othello) - 2 Player
## 2020-01-03

### Description
Reversi game frontend implementation. Only 2 player (hotseat) mode available.

### Challenges and Lessons
I think I did a decent but not perfect job of object relations: towards the end, when I wanted to display game state it became a bit difficult because the graphics handler was a property of the game manager.

The most difficult part was detection of valid moves. "Sandwiching" is easy to understand but not trivial to implement. I did it by looking at each "ray" from the origin (coord that I wanted to place a piece), but the final implementation is a bit messy and could be cleaner.
