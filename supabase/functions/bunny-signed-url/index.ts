// Setup type definitions for Supabase Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// --------------------------------------------------
// CORS
// --------------------------------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --------------------------------------------------
// PURE JS MD5 (EDGE SAFE)
// --------------------------------------------------
function md5(str: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }

  function addUnsigned(lX: number, lY: number) {
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000)
        return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }

  function F(x: number, y: number, z: number) {
    return (x & y) | (~x & z);
  }
  function G(x: number, y: number, z: number) {
    return (x & z) | (y & ~z);
  }
  function H(x: number, y: number, z: number) {
    return x ^ y ^ z;
  }
  function I(x: number, y: number, z: number) {
    return y ^ (x | ~z);
  }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(str: string) {
    const lWordCount = [];
    let lMessageLength = str.length;
    let lNumberOfWords = ((lMessageLength + 8) >>> 6) * 16;
    for (let i = 0; i < lNumberOfWords; i++) lWordCount[i] = 0;
    for (let i = 0; i < lMessageLength; i++) {
      lWordCount[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
    }
    lWordCount[lMessageLength >> 2] |= 0x80 << ((lMessageLength % 4) * 8);
    lWordCount[lNumberOfWords - 2] = lMessageLength << 3;
    return lWordCount;
  }

  function wordToHex(lValue: number) {
    let wordToHexValue = "";
    for (let i = 0; i <= 3; i++) {
      wordToHexValue += ("0" + ((lValue >> (i * 8)) & 255).toString(16)).slice(-2);
    }
    return wordToHexValue;
  }

  const x = convertToWordArray(str);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k], 7, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

// --------------------------------------------------
// EDGE FUNCTION
// --------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { videoId, format = "mp4" } = await req.json();

  const pullZone = Deno.env.get("BUNNY_PULL_ZONE");
  const securityKey = Deno.env.get("BUNNY_SECURITY_KEY");

  const expires = Math.floor(Date.now() / 1000) + 600;
  const path =
    format === "hls"
      ? `/${videoId}/playlist.m3u8`
      : `/${videoId}/play_720p.mp4`;

  const token = md5(securityKey + path + expires);

  const url = `https://${pullZone}${path}?token=${token}&expires=${expires}`;

  return new Response(JSON.stringify({ url }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
