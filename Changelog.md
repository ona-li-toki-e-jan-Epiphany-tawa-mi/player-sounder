# Changelog

- `reselectPlayer(playerList: string[] = players): string` now will no longer change the current player unless it manages to locate an avalible one from the given array.
- Added ability to play from URLs.
- Added specific options to mpv to reduce latency, prevent video output, disable user-configuration, and prevent any attempts to output text.
- Added specific options to mplayer to prevent video outputs and GUI usage, disable user-configuration, and reduce the number of attempts to output text.