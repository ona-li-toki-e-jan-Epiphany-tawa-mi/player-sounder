# player-sounder

Player soundser byer shellinger outer toer oneer ofer theer availableer audioer playerser.

A beefed-up version of [play-sound](https://github.com/shime/play-sound "play-sound GitHub repository") ([npm entry](https://www.npmjs.com/package/play-sound "play-sound npm entry"),) complete with guaranteed operation with mp3 files, a guarantee to exit when audio playback is over (looking at you cvlc,) pausing and resuming playback (on POSIX-compliant systems *only*, uses SIGSTOP and SIGCONT, so a no-no on Windows,) restarting playback irregardless of whether it is currently playing or the file stopped earlier, more robust URL support, and, best of all, TypeScript!

For Windows users, you will need to make sure that the command-line players on your system are present somewhere in the PATH variable, or manually specify them using the file location of the executables.

## Installation

player-sounder can be installed from [npm](https://www.npmjs.com/package/player-sounder "player-sounder npm entry") using the following command(s):

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

#### *interface Dictionary\<Type\>*

A mapping between string keys and a given type. Just objects with a specified value type.

#### *type AudioProcess*

More relavent type name for returned audio-playing processes. Alias of ChildProcessWithoutNullStreams from [child_process.](https://nodejs.org/docs/latest-v19.x/api/child_process.html "child_process node.js API page.")

### Constants

#### *players: string\[\]*

The default command line audio players. All of them should be mp3 compatible.

Contains: `"mplayer"`, `"mpv"`, `"ffplay"`, `"cvlc"`, `"play"`, `"mpg123"`, and `"mpg321"`.

#### *URLPlayers: string\[\]*

A list of command line audio players that are capable of playing audio sourced from a URL. All of them should be mp3 compatible.

Contains: `"mpv"`, `"mplayer"`, `"ffplay"`, and `"cvlc"`.

NOTE: SoX and mpg123/mpg321 have URL support, but seem a little unreliable, so I'm not including them.

#### *playerOptions: Dictionary\<string\[\]\>*

Options to supply to each player.

Should atleast have the options necessary to prevent windows or other graphical hoo-has from being displayed and ensure that the player exits when playback is over.

Contains: 
- ffplay: [`"-nodisp"`, `"-vn"`, `"-loglevel"`, `"quiet"`, `"-autoexit"`].
- cvlc: [`"--play-and-exit"`, `"--no-video"`, `"--verbose"`, `"0"`].
- mpv: [`"--no-video"`, `"--no-terminal"`, `"--no-config"`, `"--profile=low-latency"`].
- mplayer: [`"-nogui"`, `"-vc"`, `"null"`, `"-vo"`, `"null"`, `"-noconfig"`, `"all"`, `"-really-quiet"`].
- play: [`"--no-show-progress"`, `"-V0"`].
- mpg123: [`"--quiet"`].
- mpg321: [`"--quiet"`].

### Functions

#### *getAvaliblePlayer(): string*

Gets the first available player on the system.

On first call, attempts to select a player from [players.](README.md#players-string "players: string[]")

Throws an Error if there are no available players.

#### *getAvalibleURLPlayer(): string*

Gets the first available URL player on the system.

On first call, attempts to select a player from [URLPlayers.](README.md#urlplayers-string "URLPlayers: string[]")

Throws an Error if there are no available players.

#### *reselectPlayer(playerList: string\[\] = players): string*

Updates the player to the first available player within the given list.

The list of players defaults to [players](README.md#players-string "players: string[]") when one isn't specified.

Returns the selected player.

Throws an Error if there are no available players.

#### *reselectURLPlayer(URLPlayerList: string\[\] = URLPlayers): string*

Updates the URL player to the first available player within the given list.

The list of URL players defaults to [URLPlayers](README.md#urlplayers-string "URLPlayers: string[]") when one isn't specified.

Returns the selected URL player.

Throws an Error if there are no available players.

#### *overridePlayer(player: string): boolean*

Attempts to forcefully set a different player.

`player` is the path to the new player.

Returns `true` if it found the player. If unable (i.e. `false`,) the original player is kept.

#### *overrideURLPlayer(URLPlayer: string): boolean*

Attempts to forcefully set a different URL player.

`URLPlayer` is the path to the new player.

Returns `true` if it found the player. If unable (i.e. `false`,) the original player is kept.

#### *playFile(filePath: string, options: Dictionary\<string\[\]\> = playerOptions): AudioProcess*

Launches a child process to play the given audio file.
 
`options` are the pool of options for each player. The current player's name is used to get the relavent options from the dictionary.

Throws an Error if the file cannot be accessed or there are no available players.

#### *playURL(url: string, options: Dictionary\<string\[\]\> = playerOptions): AudioProcess*

WARNING: Offers absolutely no URL validation. 

Launches a child process to play the audio file at the given URL.

`options` are the pool of options for each player. The current player's name is used to get the relavent options from the dictionary.

Throws an Error if the file cannot be accessed or there are no available players.

playURL() can have a resonably large latencey from when it's called to when the sound is played, and it makes no attempt to cache queried audio files; if a sound needs to be played exactly at the time of calling, or it's needed repeatedly, download it and use [playFile()](README.md#playfilefilepath-string-options-dictionarystring--playeroptions-audioprocess "playFile(filePath: string, options: Dictionary<string[]> = playerOptions): AudioProcess") instead.

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

let audioProcess = playFile("FILE NAME GOES HERE");

function loopPlayFirst3() {
    audioProcess = restart(audioProcess);
    if (!audioProcess)
        throw new Error("Unable to restart audio process!");

    setTimeout(loopPlayFirst3, 3000);
}
setTimeout(loopPlayFirst3, 3000);
```

Forces ffplay to be used:

```TypeScript
import * as playerSounder from "player-sounder";

if (!playerSounder.overridePlayer("ffplay"))
    throw new Error("Unable to find ffplay!");

let audioProcess = playerSounder.playFile("FILE NAME GOES HERE");

playerSounder.onError(audioProcess).then((errorCode) => {
    throw new Error("An error occured while playing audio file!")});
```

Plays a file with mpv at 400% volume:

```TypeScript
import { overridePlayer, playFile, playerOptions } from "player-sounder";

overridePlayer("mpv");
let mpvOptions = playerOptions["mpv"].concat("--volume=400");
let audioProcess = playFile("FILE NAME GOES HERE", {mpv: mpvOptions});
```

## Changelog

- `reselectPlayer(playerList: string[] = players): string` now will no longer change the current player unless it manages to locate an avalible one from the given array.
- Added ability to play from URLs.
- Added specific options to mpv to reduce latency, prevent video output, disable user-configuration, and prevent any attempts to output text.
- Added specific options to mplayer to prevent video outputs and GUI usage, disable user-configuration, and reduce the number of attempts to output text.
- Added specific options to ffplay to prevent text output.
- Added specific options to cvlc to reduce text output and prevent video output.
- Added sepcific options to play and mpg321/mpg123 to prevent text output.

Note that text isn't going to appear in the console even if these options are disabled; they just don't need to do it in the first place, so I took lengths to disable it.

### 1.0.0

Initial release.