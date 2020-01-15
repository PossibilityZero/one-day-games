# Reversi (Othello) - AI
## 2020-01-15

### Description
Implement AI to play Othello against.

### Challenges and Lessons
I had to implement agents to play the game, which created new design challenges that I hadn't had to handle so far. Up until now, the game state was hidden in code but visible through the board displayed (in this game via the DOM, for some others on a canvas). But now that I'm creating AI agents to play the game, they need access to the same information, which means that I have to create an API to access the board state.

I'm trying to make defensively code so that the API isn't vulnerable.

This ended up being much longer than I intended. I'm publishing it even though it's much weaker than I wish it were; it'd probably be best to re-write it if I want to make it better.

I got to implement a tree data structure for the first time, and sort of understand alpha-beta pruning.
