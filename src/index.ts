const findExec = require("find-exec");
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
export let players: string[] = [ "mplayer", "mpv", "ffplay",
                               , "cvlc" /* from VLC */, "play" /* from SoX(?) */
			                   , "mpg123", "mpg321" /* Same player, different name */];

/**
 * Various options to make sure players don't open any windows and exit when done.
 */
export let playerOptions: Dictionary<string[]> = { ffplay: ["-nodisp", "-autoexit"]
	                  			          		  , cvlc:   ["--play-and-exit"]};

let _player: string | null = null;
/**
 * Gets the first available player on the system.
 *
 * @returns The player.
 * @throws If there are no available players.
 */
export function getAvaliblePlayer(): string {
	if (!_player) {
		_player = findExec(players);

		if (!_player)
			throw `Unable to find any sound players on the system! (attempted to look for ${players})`;
	}

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
        _player = player
        return true;
    }

    return false;
}



/**
 * Launches a child process to play the given audio file.
 * 
 * @param filePath audio file path.
 * @throws If the file could not be opened.
 *         If there are no available players.
 */
export function playFile(filePath: string): AudioProcess {
	try {
		fs.accessSync(filePath, R_OK);
	} catch (error) {
		throw `An error occured while trying to open sound file "${filePath}"; unable to open!". Description: ${error}`;
	}

	const player = getAvaliblePlayer();
	const args   = (playerOptions[player] || []).concat(filePath);
	
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
 * Pauses an audio process.
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
 * Resumes a previously paused audio process.
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