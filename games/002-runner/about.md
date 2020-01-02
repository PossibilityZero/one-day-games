# Stay Up
## 2020-01-02

### Description
This is an original, simple platform game. The pawn continually bounces back and forth, and the player can either jump up or bump down.
Platforms will appear and disappear semi-randomly, and the objective is to stay alive by not falling off the board. Points are gained much faster by being on the lower (but therefore riskier) platforms.

### Challenges and Lessons
This was my first platformer game. I implemented gravity pretty much by imitating physics; I think that's the easier way.
I learned to do some more basic canvas drawing.
I had a lot of bugs due to off-by-one errors (mistaking greater-than and greater-than-or-equal-to) that took a lot of time.
I'm getting better at figuring out what should be its own object from the start. Also, I used a "singleton" design pattern for both the platforms and the player for this game.

A meta-learning is that it's very easy to get sucked in and not know when to stop designing, especially when I haven't figured out the scope and game rules at the beginning. This one was completely made up as I went along.
