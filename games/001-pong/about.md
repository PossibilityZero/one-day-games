# 001: Pong
## 2020-01-01

### Description
Basic Pong game.
- UP and DOWN arrows to control paddle
- Game to 5
- Reload to restart

### Challenges and Lessons
Most difficult part was implementing bounce mechanics for the paddle. Recognizing when the ball was hitting the paddle was a challenge, and at one point there was a bug where for certain speeds the ball would bypass the paddle even if it was square on.
Also, this was done with all objects as points and lines, so it would be interesting to try to implement an actual ball.

I also managed to come up with a solution for responsive control to arrow keys that wasn't dependent on the system: because the keydown and keypress events fire as if you're holding down a key, instead of listening for the events I listened for the keyDown and keyUp events, and have my own internal monitor of the state of the keys. I then look at that state handler every update loop, which allows for smooth control of the paddle
