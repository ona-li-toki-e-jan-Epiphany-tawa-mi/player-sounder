# player-sounder

Player soundser byer shellinger outer toer oneer ofer theer availableer audioer playerser.

A beefed-up version of [play-sound](https://github.com/shime/play-sound "play-sound GitHub repository") ([npm entry](https://www.npmjs.com/package/play-sound "play-sound npm entry"),) complete with guaranteed operation with mp3 files, a guarantee to exit when audio playback is over (looking at you cvlc,) pausing and resuming playback (on POSIX-compliant systems *only*, uses SIGSTOP and SIGCONT, so a no-no on Windows,) restarting playback irregardless of whether it is currently playing or the file stopped earlier, and, best of all, TypeScript!

## Installation

player-sounder can be installed from npm using the following command(s):

```console
npm install player-sounder
```

Alternatively, after [compilation](README.md#how-to-build "How to Build section"), you can put a symlink to the compiled library into your system's npm modules root folder by running the following command(s) in the project directory:

```console
npm link
```

And then installing into a different project via running the following command(s) in that project's directory:

```console
npm link player-sounder
```

## How to Build

Run the TypeScript compiler using the following command(s) in the project directory:

```console
tsc
```

Built files will appear in [dist/.](dist)

## Dependencies

*Development dependencies not listed.*

- [find-exec](https://www.npmjs.com/package/find-exec "find-exec npm entry") ^1.0.2

## Exposed Features

### Types

#### *interface Dictionary<Type>*

A mapping between string keys and a given type. Just objects with a specified value type.

#### *type AudioProcess*

More relavent type name for returned audio-playing processes.

### Constants

#### *players: string\[\]*

The default command line audio players. All of them should be mp3 compatible.

Contains: `"mplayer"`, `"mpv"`, `"ffplay"`, `"cvlc"`, `"play"`, `"mpg123"`, and `"mpg321"`.

#### *playerOptions: Dictionary\<string\[\]\>*

Options to supply to each player.

Should atleast have the options necessary to prevent windows or other graphical hoo-has from being displayed and ensure that the player exits when playback is over.

Contains: `ffplay: ["-nodisp", "-autoexit"]`, `cvlc: ["--play-and-exit"]`.

### Functions

#### *getAvaliblePlayer(): string*

Gets the first available player on the system.

On first call, attempts to select a player from [players.](README.md#players-string "players: string[]")

Throws an error if there are no available players.

#### *reselectPlayer(playerList: string\[\] = players): string*

Updates the player to the first available player within the given list.

The list of players defaults to [players](README.md#players-string "players: string[]") when one isn't specified.

Returns the selected player.

Throws an error if there are no available players.

#### *overridePlayer(player: string): boolean*

Attempts to forcefully set a different player.

`player` is the path to the new player.

Returns `true` if it found the player. If unable (i.e. `false`,) the original player is kept.

#### *playFile(filePath: string, options: Dictionary<string\[\]> = playerOptions): AudioProcess*

Launches a child process to play the given audio file.
 
`options` are the pool of options for each player. The current player's name is used to get the relavent options from the dictionary.

Throws an error if the file could not be opened or there are no available players.

#### *onError(audioProcess: AudioProcess): Promise\<number\>*

Returns a promise containing the error code of the process for when the audio player exits because of an error or it couldn't start in the first place.

#### *onClose(audioProcess: AudioProcess): Promise\<number\>*

Returns a promise containing the error code of the process for when the audio player exits.

#### *pause(audioProcess: AudioProcess): boolean*

POSIX-compliant operating systems only.

Pauses an audio process, does nothing if the process has already exited.

Returns whether the process was paused.

#### *resume(audioProcess: AudioProcess): boolean*

POSIX-compliant operating systems only.

Resumes a previously paused audio process, does nothing if the process exited.

Returns whether the process was resumed.

#### *restart(audioProcess: AudioProcess): AudioProcess | null*

"Restarts" the audio process by spawning a new one using the same arguments and returning that. If the process is currently running it will be stopped.

The new "restarted" audio process if it succeded, `null` if not.

## Examples

Loops the first 3 seconds of an audio file indefinitely:

```TypeScript
import { playFile, restart } from "player-sounder";

audioProcess = playFile("FILE NAME GOES HERE");

function loopPlayFirst3() {
    audioProcess = restart(audioProcess);
    if (!audioProcess)
        throw "Unable to restart audio process!";

    setTimeout(loopPlayFirst3, 3000);
}
setTimeout(loopPlayFirst3, 3000);
```

Forces ffplay to be used:

```TypeScript
import * as playerSounder from "player-sounder";

if (!playerSounder.overridePlayer("ffplay"))
    throw "Unable to find ffplay!";

audioProcess = playerSounder.playFile("FILE NAME GOES HERE");

playerSounder.onError(audioProcess).then((errorCode) => {
    throw "An error occured while playing audio file!"});
```

Plays a file with mpv at 400% volume:

```TypeScript
import { overridePlayer, playFile } from "player-sounder";

overridePlayer("mpv");
let options = {"mpv": ["--volume=400"]};
audioProcess = playFile("FILE NAME GOES HERE", options);
```