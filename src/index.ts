import findExec = require("find-exec");
import { ChildProcess, ChildProcessWithoutNullStreams, spawn } from "child_process";
import * as fs from "fs";
const R_OK = fs.constants.R_OK;

/**
 * A mapping between string keys and a given type. Just objects with a specified value type.
 */
interface Dictionary<Type> {
    [key: string]: Type;
};

/**
 * More relavent type name for returned processes.
 */
type AudioProcess = ChildProcessWithoutNullStreams;



/**
 * Command line audio players. Must be mp3 compatible.
 */
export const players: string[] = [ "mplayer", "mpv", "ffplay",
                                 , "cvlc" /* from VLC */, "play" /* from SoX(?) */
			                     , "mpg123", "mpg321" /* Same player, different name */];

/**
 * Various options to supply to each player.
 * Namely makes sure players don't open any windows and exit when done.
 */
export const playerOptions: Dictionary<string[]> = { ffplay: ["-nodisp", "-autoexit"]
	                  			          		   , cvlc:   ["--play-and-exit"]};

let _player: string | null = null;
/**
 * Gets the first available player on the system.
 * On first call, attempts to select a player from {@link players}.
 *
 * @returns The player.
 * @throws If there are no available players.
 */
export function getAvaliblePlayer(): string {
	if (!_player)
        reselectPlayer();

	return _player;
}

/**
 * Updates the player to the first available player within the given list.
 *
 * @param playerList The list of players to select from, defaults to {@link players}.
 * @returns The player.
 * @throws If there are no available players.
 */
export function reselectPlayer(playerList: string[] = players): string {
    _player = findExec(playerList);

	if (!_player)
        throw `Unable to find any sound players on the system! (attempted to look for ${players})`;

    return _player;
}

/**
 * Attempts to forcefully set a different player.
 * 
 * @param player The path to the new player.
 * @returns Whether the new player was found. If false, the original player is kept.
 */
export function overridePlayer(player: string): boolean {
    let possiblePlayer = findExec(player);

    if (possiblePlayer) {
        _player = possiblePlayer
        return true;
    }

    return false;
}



/**
 * Launches a child process to play the given audio file.
 * 
 * @param filePath audio file path.
 * @param options Various options to supply to each player, defaults to {@link playerOptions}.
 * @throws If the file could not be opened.
 *         If there are no available players.
 */
export function playFile(filePath: string, options: Dictionary<string[]> = playerOptions): AudioProcess {
	try {
		fs.accessSync(filePath, R_OK);
	} catch (error) {
		throw `An error occured while trying to open sound file "${filePath}"; unable to open!". Description: ${error}`;
	}

	const player = getAvaliblePlayer();
	const args   = (options[player] || []).concat(filePath);
	
    return spawn(player, args);
}

/** 
 * @param audioProcess The audio-playing child process.
 * @returns A promise containing the error code of the process for when the audio player exits because 
 *      of an error or it couldn't start in the first place.
 */
 export function onError(audioProcess: AudioProcess): Promise<number> {
    return new Promise((resolve) => 
        audioProcess.on('error', resolve));
}

/** 
 * @param audioProcess The audio-playing child process.
 * @returns A promise containing the error code of the process for when the audio player exits.
 */
export function onClose(audioProcess: AudioProcess): Promise<number> {
    return new Promise((resolve) => 
        audioProcess.on('close', resolve));
}

/** 
 * Pauses an audio process, does nothing if the process exited.
 * @attention Will terminate process on Windows instead of pausing them.
 * 
 * @param audioProcess The audio-playing child process.
 * @returns Whether the process was paused.
 */
export function pause(audioProcess: AudioProcess): boolean {
    // Makes sure process isn't closed.
    if (audioProcess.exitCode === null)
        return audioProcess.kill('SIGSTOP');

    return false;
}

/** 
 * Resumes a previously paused audio process, does nothing if the process exited.
 * @attention Will terminate process on Windows instead of resuming them.
 * 
 * @param audioProcess The audio-playing child process.
 * @returns Whether the process was resumed.
 */
export function resume(audioProcess: AudioProcess): boolean {
    // Makes sure process isn't closed.
    if (audioProcess.exitCode === null)
        return audioProcess.kill('SIGCONT');
    
    return false
}

/**
 * "Restarts" the audio process by spawning a new one using the same arguments and returning that. If 
 *      the process is currently running it will be stopped.
 * 
 * @param audioProcess The audio-playing child process.
 * @returns The new "restarted" audio process if succeded, null if not.
 */
export function restart(audioProcess: AudioProcess): AudioProcess | null {
    // Attempts to kill the process if it's still running.
    if (audioProcess.exitCode === null && !audioProcess.kill())
        return null;

    let [player, ...options] = audioProcess.spawnargs;
    return spawn(player, options);
}