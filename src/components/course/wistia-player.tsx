import {
	useRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	forwardRef,
} from "react";
import {
	WistiaPlayer as WistiaPlayerOfficial,
	type WistiaPlayerElement,
} from "@wistia/wistia-player-react";
import { cn } from "@/lib/utils";

/**
 * Progress data emitted by the player
 */
export interface WistiaProgressData {
	/** Current playback position in seconds */
	currentTime: number;
	/** Total duration of the video in seconds */
	duration: number;
	/** Percentage of video watched (0-1) */
	percentWatched: number;
}

/**
 * Methods exposed via ref for external control
 */
export interface WistiaPlayerHandle {
	/** Seek to a specific time in seconds */
	seekTo: (time: number) => void;
	/** Start playback */
	play: () => void;
	/** Pause playback */
	pause: () => void;
	/** Get current playback time in seconds */
	getCurrentTime: () => number;
}

interface WistiaPlayerProps {
	mediaId: string;
	className?: string;
	/**
	 * Initial time to start playback from (in seconds).
	 * Useful for resuming or starting at a specific chapter.
	 */
	initialTime?: number;
	/**
	 * Called periodically as the video plays.
	 * Fires every second during playback.
	 */
	onProgress?: (data: WistiaProgressData) => void;
	/**
	 * Called when the video finishes playing.
	 */
	onComplete?: () => void;
	/**
	 * Called when the player is ready for interaction.
	 */
	onReady?: () => void;
}

/**
 * Wistia Video Player Component
 *
 * Uses the official @wistia/wistia-player-react package.
 * Handles script loading and SSR automatically.
 *
 * Features:
 * - Basic playback with aspect ratio handling
 * - Progress tracking via onProgress callback
 * - Chapter navigation via initialTime and ref methods
 * - Completion detection via onComplete callback
 */
export const WistiaPlayer = forwardRef<WistiaPlayerHandle, WistiaPlayerProps>(
	function WistiaPlayer(
		{ mediaId, className = "", initialTime, onProgress, onComplete, onReady },
		ref,
	) {
		const internalRef = useRef<WistiaPlayerElement>(null);
		const hasSeekededToInitial = useRef(false);

		// Expose methods to parent via ref
		useImperativeHandle(
			ref,
			() => ({
				seekTo: (time: number) => {
					if (internalRef.current) {
						internalRef.current.currentTime = time;
					}
				},
				play: () => {
					internalRef.current?.play();
				},
				pause: () => {
					internalRef.current?.pause();
				},
				getCurrentTime: () => {
					return internalRef.current?.currentTime || 0;
				},
			}),
			[],
		);

		// Handle initial time seek when player is ready
		const handleApiReady = useCallback(() => {
			if (
				initialTime !== undefined &&
				initialTime > 0 &&
				!hasSeekededToInitial.current &&
				internalRef.current
			) {
				internalRef.current.currentTime = initialTime;
				hasSeekededToInitial.current = true;
			}
			onReady?.();
		}, [initialTime, onReady]);

		// Reset seek flag when initialTime changes (for lesson navigation)
		useEffect(() => {
			hasSeekededToInitial.current = false;
		}, [initialTime]);

		const handleSecondChange = useCallback(
			(event: CustomEvent<{ second: number }>) => {
				if (!onProgress || !internalRef.current) return;

				const player = internalRef.current;
				onProgress({
					currentTime: event.detail.second,
					duration: player.duration || 0,
					percentWatched: player.percentWatched || 0,
				});
			},
			[onProgress],
		);

		const handleEnded = useCallback(() => {
			onComplete?.();
		}, [onComplete]);

		return (
			<div
				className={cn("relative w-full overflow-hidden rounded-lg", className)}
			>
				<WistiaPlayerOfficial
					ref={internalRef}
					mediaId={mediaId}
					aspect={16 / 9}
					onApiReady={handleApiReady}
					onSecondChange={onProgress ? handleSecondChange : undefined}
					onEnded={onComplete ? handleEnded : undefined}
				/>
			</div>
		);
	},
);

export type { WistiaPlayerProps };
