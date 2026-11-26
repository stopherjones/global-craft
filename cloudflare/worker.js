/**
 * WanderCraft Cloudflare Worker Backend
 * Handles:
 *   1. POST /api/craft       -> Gemini crafting synthesis using env.GEMINI_API_KEY
 *   2. GET  /saves/:playerId -> Load save JSON from KV (env.WANDERCRAFT_SAVES)
 *   3. PUT  /saves/:playerId -> Store save JSON to KV (env.WANDERCRAFT_SAVES)
 */

const VALID_ITEM_TAGS = [
  "beverage",
  "culinary",
  "textile",
  "fashion",
  "weather",
  "heritage",
  "transport",
  "tech",
  "craft",
  "luxury",
  "music",
  "botanical",
  "romance",
  "spice",
  "architecture",
];

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(env),
    },
  });
}

function computeBoundedCraftValue(inputs) {
  const sum = inputs.reduce(
    (acc, item) => acc + Math.max(8, Number(item.baseValue) || 15),
    0
  );
  const maxTier = Math.max(...inputs.map((i) => Number(i.tier) || 0));
  const countMultiplier = inputs.length >= 3 ? 1.55 : 1.35;
  const tierBonus = 1 + Math.min(maxTier, 4) * 0.08;
  const raw = Math.round(sum * countMultiplier * tierBonus);
  return Math.max(20, Math.min(raw, 1200));
}

async function handleCraft(request, env) {
  if (!env.GEMINI_API_KEY) {
    return jsonResponse({ error: "GEMINI_API_KEY secret is not configured." }, 500, env);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request body." }, 400, env);
  }

  const rawIngredients = Array.isArray(body?.ingredients) ? body.ingredients : [];
  if (rawIngredients.length < 2 || rawIngredients.length > 3) {
    return jsonResponse({ error: "Provide 2 or 3 ingredients to combine." }, 400, env);
  }

  const ingredients = rawIngredients.map((item) => ({
    name: String(item.name || "").trim().slice(0, 60),
    baseValue: Math.max(5, Math.min(2000, Number(item.baseValue) || 15)),
    tier: Math.max(0, Math.min(10, Number(item.tier) || 0)),
    tags: Array.isArray(item.tags) ? item.tags.slice(0, 4).map(String) : [],
  }));

  if (ingredients.some((i) => !i.name)) {
    return jsonResponse({ error: "All ingredients must have a valid name." }, 400, env);
  }

  const ingredientListText = ingredients
    .map((i) => `"${i.name}" (${i.tags.join(", ") || "general"})`)
    .join(" + ");

  const systemInstruction = `You are the Lateral Alchemy engine for WanderCraft, a travel-trading and crafting game.
Combine 2 or 3 items into ONE recognizable, witty, real-world concept, artifact, dish, cultural trope, or phenomenon.

STRICT RULES:
1. NEVER invent portmanteaus, compound mashups, or fake words (e.g., NEVER output "Breadlamp", "Fogtea", "Buspot", or "Silkfish").
2. Output a genuine, recognizable real-world thing that rewards lateral thinking.
3. Explain the 1-sentence lateral link ("connection") clearly.
4. Keep "name" concise (1 to 3 words) and "description" punchy (max 14 words).
5. Select 2 or 3 relevant semantic tags ONLY from this allowed list: ${VALID_ITEM_TAGS.join(", ")}.`;

  const model = env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;

  const geminiRes = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `Combine ${ingredientListText} into one real-world concept.` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            connection: { type: "STRING" },
            name: { type: "STRING" },
            emoji: { type: "STRING" },
            description: { type: "STRING" },
            tags: {
              type: "ARRAY",
              items: { type: "STRING" },
            },
          },
          required: ["connection", "name", "emoji", "description", "tags"],
        },
      },
    }),
  });

  const geminiData = await geminiRes.json();
  if (!geminiRes.ok) {
    const errMsg = geminiData?.error?.message || `Gemini HTTP ${geminiRes.status}`;
    return jsonResponse({ error: errMsg }, geminiRes.status, env);
  }

  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    return jsonResponse({ error: "Empty response returned from Gemini." }, 502, env);
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return jsonResponse({ error: "Failed to parse Gemini JSON output." }, 502, env);
  }

  const name = String(parsed.name || "").trim();
  if (!name) {
    return jsonResponse({ error: "Invalid item name returned by Gemini." }, 502, env);
  }

  const allowedSet = new Set(VALID_ITEM_TAGS);
  const filteredTags = (Array.isArray(parsed.tags) ? parsed.tags : [])
    .map((t) => String(t).trim().toLowerCase())
    .filter((t) => allowedSet.has(t))
    .slice(0, 3);

  return jsonResponse(
    {
      name,
      emoji: String(parsed.emoji || "✨").trim() || "✨",
      description: String(parsed.description || "Forged through lateral alchemy.").trim(),
      connection: String(parsed.connection || "An unexpected real-world connection.").trim(),
      tags: filteredTags.length > 0 ? filteredTags : ["craft", "heritage"],
      tier: Math.max(...ingredients.map((i) => i.tier)) + 1,
      baseValue: computeBoundedCraftValue(ingredients),
    },
    200,
    env
  );
}

async function handleSaves(request, env, playerId) {
  if (!env.WANDERCRAFT_SAVES) {
    return jsonResponse({ error: "WANDERCRAFT_SAVES KV binding not configured." }, 500, env);
  }

  const cleanId = decodeURIComponent(playerId || "").trim();
  if (!cleanId || cleanId.length > 80) {
    return jsonResponse({ error: "Invalid player Sync ID." }, 400, env);
  }

  const kvKey = `save:${cleanId}`;

  if (request.method === "GET") {
    const saved = await env.WANDERCRAFT_SAVES.get(kvKey);
    if (!saved) {
      return jsonResponse({ error: "No save found for this Player Sync ID." }, 404, env);
    }
    return new Response(saved, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(env),
      },
    });
  }

  if (request.method === "PUT") {
    const text = await request.text();
    if (!text || text.length > 512_000) {
      return jsonResponse({ error: "Save payload missing or exceeds 512 KB limit." }, 400, env);
    }
    try {
      JSON.parse(text);
    } catch {
      return jsonResponse({ error: "Save payload must be valid JSON." }, 400, env);
    }
    await env.WANDERCRAFT_SAVES.put(kvKey, text);
    return jsonResponse({ ok: true, id: cleanId }, 200, env);
  }

  return jsonResponse({ error: "Method not allowed." }, 405, env);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "GET" && path === "/api/health") {
      return jsonResponse({ ok: true, model: env.GEMINI_MODEL || "gemini-3.1-flash-lite" }, 200, env);
    }

    if (request.method === "POST" && path === "/api/craft") {
      return handleCraft(request, env);
    }

    if (path.startsWith("/saves/")) {
      const playerId = path.slice("/saves/".length);
      return handleSaves(request, env, playerId);
    }

    return jsonResponse({ error: "Not found" }, 404, env);
  },
};
