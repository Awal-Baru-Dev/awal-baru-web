import { useEffect, useRef, createElement } from "react";
import { cn } from "@/lib/utils";

interface WistiaPlayerProps {
	mediaId: string;
	className?: string;
}

/**
 * Wistia Video Player Component
 *
 * Renders a Wistia embedded video player using their web component.
 * Loads scripts dynamically to avoid issues with SSR.
 *
 * MVP version - no progress tracking (will be added later).
 */
export function WistiaPlayer({ mediaId, className = "" }: WistiaPlayerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const scriptsLoadedRef = useRef(false);

	useEffect(() => {
		// Prevent duplicate script loading
		if (scriptsLoadedRef.current) return;
		scriptsLoadedRef.current = true;

		// Check if player script already exists
		const existingPlayerScript = document.querySelector(
			'script[src="https://fast.wistia.com/player.js"]',
		);

		if (!existingPlayerScript) {
			// Load Wistia player script
			const playerScript = document.createElement("script");
			playerScript.src = "https://fast.wistia.com/player.js";
			playerScript.async = true;
			document.head.appendChild(playerScript);
		}

		// Load Wistia embed script for this specific media
		const embedScriptId = `wistia-embed-${mediaId}`;
		const existingEmbedScript = document.getElementById(embedScriptId);

		if (!existingEmbedScript) {
			const embedScript = document.createElement("script");
			embedScript.id = embedScriptId;
			embedScript.src = `https://fast.wistia.com/embed/${mediaId}.js`;
			embedScript.async = true;
			embedScript.type = "module";
			document.head.appendChild(embedScript);
		}

		// Note: We don't remove scripts on unmount to allow caching
		// and prevent issues with multiple player instances
	}, [mediaId]);

	return (
		<div
			ref={containerRef}
			className={cn("relative w-full overflow-hidden rounded-lg", className)}
		>
			{/* Swatch styling for loading placeholder */}
			<style
				dangerouslySetInnerHTML={{
					__html: `
            wistia-player[media-id='${mediaId}']:not(:defined) {
              background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${mediaId}/swatch');
              display: block;
              filter: blur(5px);
              padding-top: 56.25%;
            }
          `,
				}}
			/>
			{createElement("wistia-player", {
				"media-id": mediaId,
				aspect: "1.7777777777777777",
			})}
		</div>
	);
}

export type { WistiaPlayerProps };
