import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const GEMINI_MODEL = "gemini-3.1-flash-lite";

interface CraftIngredientInput {
  name: string;
  emoji?: string;
  baseValue: number;
  tier: number;
  tags?: string[];
}

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
] as const;

function computeBoundedCraftValue(inputs: CraftIngredientInput[]): number {
  const sum = inputs.reduce((acc, item) => acc + Math.max(8, Number(item.baseValue) || 15), 0);
  const maxTier = Math.max(...inputs.map((i) => Number(i.tier) || 0));
  const countMultiplier = inputs.length >= 3 ? 1.55 : 1.35;
  const tierBonus = 1 + Math.min(maxTier, 4) * 0.08;
  const raw = Math.round(sum * countMultiplier * tierBonus);
  return Math.max(20, Math.min(raw, 1200));
}

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  // Permissive CORS for static frontends (e.g. GitHub Pages) if deployed separately
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, model: GEMINI_MODEL });
  });

  app.post("/api/craft", async (req, res) => {
    try {
      const body = req.body as { ingredients?: CraftIngredientInput[] };
      const rawIngredients = Array.isArray(body?.ingredients) ? body.ingredients : [];

      if (rawIngredients.length < 2 || rawIngredients.length > 3) {
        res.status(400).json({ error: "Provide 2 or 3 ingredients to combine." });
        return;
      }

      const ingredients = rawIngredients.map((item) => ({
        name: String(item.name || "").trim().slice(0, 60),
        emoji: String(item.emoji || "✨").trim().slice(0, 8),
        baseValue: Math.max(5, Math.min(2000, Number(item.baseValue) || 15)),
        tier: Math.max(0, Math.min(10, Number(item.tier) || 0)),
        tags: Array.isArray(item.tags) ? item.tags.slice(0, 4).map(String) : [],
      }));

      if (ingredients.some((i) => !i.name)) {
        res.status(400).json({ error: "All ingredients must have a valid name." });
        return;
      }

      const ai = createGeminiClient();
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
5. Select 2 or 3 relevant semantic tags ONLY from this allowed list: ${VALID_ITEM_TAGS.join(", ")}.

EXAMPLES:
- "Fog" + "Tea" -> {"connection": "London mist steeping into a fragrant bergamot brew.", "name": "Earl Grey", "emoji": "🫖", "description": "Aromatic British tea steeped with coastal citrus mist.", "tags": ["beverage", "heritage", "botanical"]}
- "Tagine Pot" + "Red Bus" -> {"connection": "Spicy Moroccan warmth meeting an iconic crimson London route.", "name": "Spice Route", "emoji": "🧭", "description": "An aromatic overland passage linking bustling bazaars.", "tags": ["spice", "transport", "heritage"]}
- "Baguette" + "Love" + "Espresso" -> {"connection": "Sharing flaky bread and strong coffee with someone special.", "name": "Parisian Morning", "emoji": "🥐", "description": "Warm terrace sunlight over coffee and fresh crust.", "tags": ["culinary", "romance", "beverage"]}
- "Cotton" + "Raincoat" -> {"connection": "Woven cotton gabardine tailored to shed city downpours.", "name": "Trench Coat", "emoji": "🧥", "description": "Weatherproof woven tailoring built for stormy streets.", "tags": ["fashion", "textile", "weather"]}`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Combine ${ingredientListText} into one real-world concept.`,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              connection: {
                type: Type.STRING,
                description: "One-sentence lateral association linking the inputs to the output.",
              },
              name: {
                type: Type.STRING,
                description: "Concise 1 to 3 word real-world item or concept name.",
              },
              emoji: {
                type: Type.STRING,
                description: "Single fitting emoji.",
              },
              description: {
                type: Type.STRING,
                description: "Short flavor description (max 14 words).",
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2 or 3 tags from the allowed tag list.",
              },
            },
            required: ["connection", "name", "emoji", "description", "tags"],
          },
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        throw new Error("Empty response received from Gemini.");
      }

      const parsed = JSON.parse(rawText) as {
        connection?: string;
        name?: string;
        emoji?: string;
        description?: string;
        tags?: string[];
      };

      const name = String(parsed.name || "").trim();
      if (!name) {
        throw new Error("Gemini returned an invalid item name.");
      }

      const allowedSet = new Set<string>(VALID_ITEM_TAGS);
      const filteredTags = (Array.isArray(parsed.tags) ? parsed.tags : [])
        .map((t) => String(t).trim().toLowerCase())
        .filter((t) => allowedSet.has(t))
        .slice(0, 3);

      const finalTags = filteredTags.length > 0 ? filteredTags : ["craft", "heritage"];
      const nextTier = Math.max(...ingredients.map((i) => i.tier)) + 1;
      const baseValue = computeBoundedCraftValue(ingredients);

      res.json({
        name,
        emoji: String(parsed.emoji || "✨").trim() || "✨",
        description: String(parsed.description || "Forged through lateral alchemy.").trim(),
        connection: String(parsed.connection || "An unexpected real-world connection.").trim(),
        tags: finalTags,
        tier: nextTier,
        baseValue,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to craft item.";
      const lower = message.toLowerCase();
      const status =
        lower.includes("api_key") || lower.includes("permission_denied")
          ? 403
          : lower.includes("resource_exhausted") || lower.includes("429")
          ? 429
          : 500;
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WanderCraft server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
