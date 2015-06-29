Tetris
=======

The number of real-time collaborative games on the various application stores is surprisingly small.  The ones that do exist almost always work through local wireless discovery (802.11/Bluetooth).  Both approaches are rarely done well, resulting in game experience problems, and disconnections.  This stands to reason as game developers are rarely networking developers.

Rather than bake their own solutions, game developers could leverage enterprise-class messaging using Kaazing Gateway.  This approach would allow for seamless, secure, highly scalable, implementations, resulting in vastly improved user experience.  For those games without collaboration features, the use of Kaazing Gateway could allow developers to bring new abilities to their applications.

As an example, this Tetris clone leverages Kaazing Gateway to provide a virtual controller on one screen against the game running on some other screen.  The two applications do not have to be on the same network.  No Bluetooth pairing is required.  And it works right in a standard browser.  There is but a dozen lines of code needed to add real-time features to the game.  The remaining code is application logic.
