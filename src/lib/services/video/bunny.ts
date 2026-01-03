import { createBrowserClient } from "@/lib/db/supabase/client";

export async function getSignedVideoUrl(
    videoId: string,
    format: "mp4" | "hls" = "mp4"
): Promise<string> {
    const supabase = createBrowserClient();

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
        throw new Error("Not authenticated");
    }

    const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bunny-signed-url`,
        {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ videoId, format }),
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to get signed URL: ${text}`);
    }

    const data = await res.json();
    return data.url;
}
