# Juggler
## 2020-01-04 -> 2020-01-05

### Description
This is an original game. The objective is to keep as many balls in the air at once as possible.
Ball are added every 5 seconds. Once 3 balls are lost, the player loses. Score is:
Seconds * (Balls in air) ^ 2

### Challenges and Lessons
I learned a lot about the pitfalls of implementing bounce and gravity. One difficult bug was where I was applying gravity after the check of whether the ball was past the paddle, so the small speedup made it go through if things lined up just right (or wrong).

And holy Jesus. I finally debugged a problem that would've been caught before runtime if I'd been using 'use strict'.

I learned that when it's important for all current calculations to finish executing before moving to the next tick, it's better to use setTimeout iteratively over setInterval, because the latter will run no matter what.
