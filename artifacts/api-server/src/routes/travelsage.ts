import { Router, type Request, type Response } from "express";
import { createRequire } from "node:module";
import {
  ChatWithTravelSageBody,
  GenerateBudgetBody,
  GenerateItineraryBody,
  GeneratePackingListBody,
  GenerateTipsBody,
  UploadTravelGuideBody,
} from "@workspace/api-zod";

const router = Router();
const require = createRequire(import.meta.url);
const MODEL = "gpt-4o-mini";
const REFUSAL =
  "I couldn't find information about that in your uploaded guide. Try uploading more material about this destination, or ask me something else about what's covered!";

type SourceChunk = { id: string; text: string; similarity: number };
type DestinationAnalysis = {
  destinationName: string;
  country: string;
  flagEmoji: string;
  attractions: string[];
  restaurants: string[];
  activities: string[];
  priceRanges: string[];
  climate: string;
  culturalNotes: string[];
  summary: string;
};
type StoredChunk = { id: string; text: string; embedding: number[] };
type StoredDocument = {
  id: string;
  fileName: string;
  text: string;
  chunks: StoredChunk[];
  analysis: DestinationAnalysis;
  highlights: { places: string[]; prices: string[]; activities: string[] };
};
type LogEntry = {
  id: string;
  timestamp: string;
  endpoint: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  guardrailPassed: boolean;
  qualityScore: number;
  notes: string;
};

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const documents = new Map<string, StoredDocument>();
const logs: LogEntry[] = [];

const stopWords = new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "before",
  "being",
  "could",
  "does",
  "from",
  "guide",
  "have",
  "into",
  "more",
  "should",
  "that",
  "their",
  "there",
  "these",
  "thing",
  "this",
  "travel",
  "trip",
  "what",
  "when",
  "where",
  "which",
  "with",
  "would",
  "your",
]);

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

function words(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9£€$¥.,\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function hashWord(word: string) {
  let hash = 2166136261;
  for (const char of word) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function embedText(text: string) {
  const vector = Array.from({ length: 96 }, () => 0);
  for (const word of words(text)) {
    vector[hashWord(word) % vector.length] += 1;
  }
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / magnitude);
}

function cosineSimilarity(a: number[], b: number[]) {
  return a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
}

function chunkText(text: string) {
  const tokens = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  const size = 420;
  const overlap = 50;
  for (let index = 0; index < tokens.length; index += size - overlap) {
    chunks.push(tokens.slice(index, index + size).join(" "));
  }
  return chunks.length > 0 ? chunks : [text.slice(0, 3000)];
}

function retrieve(document: StoredDocument, query: string, count = 5): SourceChunk[] {
  const queryEmbedding = embedText(query);
  return document.chunks
    .map((chunk) => ({
      id: chunk.id,
      text: chunk.text,
      similarity: Number(cosineSimilarity(queryEmbedding, chunk.embedding).toFixed(4)),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, count);
}

function addLog(entry: Omit<LogEntry, "id" | "timestamp">) {
  logs.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  });
  if (logs.length > 100) logs.length = 100;
}

function jsonFromText<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return fallback;
    }
  }
}

async function callOpenAi(messages: ChatMessage[], endpoint: string, options?: { json?: boolean; guardrailPassed?: boolean }) {
  const started = Date.now();
  const promptText = messages.map((message) => message.content).join("\n");
  const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

  if (!baseUrl || !apiKey) {
    const latencyMs = Date.now() - started;
    addLog({
      endpoint,
      model: MODEL,
      promptTokens: estimateTokens(promptText),
      completionTokens: 0,
      latencyMs,
      guardrailPassed: options?.guardrailPassed ?? true,
      qualityScore: 0.42,
      notes: "AI provider unavailable; used deterministic fallback.",
    });
    return { content: "", usage: { prompt_tokens: estimateTokens(promptText), completion_tokens: 0 }, latencyMs };
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.35,
      max_tokens: 1200,
      ...(options?.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${body.slice(0, 240)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const latencyMs = Date.now() - started;
  const content = payload.choices?.[0]?.message?.content ?? "";
  const promptTokens = payload.usage?.prompt_tokens ?? estimateTokens(promptText);
  const completionTokens = payload.usage?.completion_tokens ?? estimateTokens(content);
  const qualityScore = Math.min(0.98, Math.max(0.58, 0.7 + Math.min(0.2, completionTokens / 2500)));

  addLog({
    endpoint,
    model: MODEL,
    promptTokens,
    completionTokens,
    latencyMs,
    guardrailPassed: options?.guardrailPassed ?? true,
    qualityScore: Number(qualityScore.toFixed(2)),
    notes: options?.json ? "Structured JSON response constrained by schema prompt." : "Grounded response generated from retrieved chunks.",
  });

  return { content, usage: payload.usage, latencyMs };
}

function fallbackAnalysis(text: string, fileName: string): DestinationAnalysis {
  const title = fileName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").trim() || "Uploaded Destination";
  const placeCandidates = Array.from(new Set(text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\b/g) ?? [])).slice(0, 12);
  const priceRanges = Array.from(new Set(text.match(/(?:[$£€¥]\s?\d+(?:[.,]\d+)?|\d+\s?(?:USD|EUR|GBP|JPY|dollars|euros|pounds))/gi) ?? [])).slice(0, 8);
  return {
    destinationName: placeCandidates[0] ?? title,
    country: placeCandidates[1] ?? "Unknown country",
    flagEmoji: "🧭",
    attractions: placeCandidates.slice(0, 6),
    restaurants: placeCandidates.filter((place) => /restaurant|cafe|bar|market|kitchen/i.test(place)).slice(0, 6),
    activities: ["Walking routes", "Local food", "Sightseeing"],
    priceRanges,
    climate: /rain|sun|snow|hot|cold|humid|dry|summer|winter/i.test(text) ? "Climate details appear in the uploaded guide." : "No clear climate details found in the uploaded guide.",
    culturalNotes: [],
    summary: text.slice(0, 360),
  };
}

function highlightsFrom(text: string, analysis: DestinationAnalysis) {
  return {
    places: Array.from(new Set([...analysis.attractions, analysis.destinationName, analysis.country].filter(Boolean))).slice(0, 16),
    prices: Array.from(new Set(text.match(/(?:[$£€¥]\s?\d+(?:[.,]\d+)?|\d+\s?(?:USD|EUR|GBP|JPY|dollars|euros|pounds))/gi) ?? [])).slice(0, 16),
    activities: Array.from(new Set(analysis.activities.filter(Boolean))).slice(0, 16),
  };
}

function guardrail(document: StoredDocument, question: string, sources: SourceChunk[]) {
  if (/ignore (all )?(previous|above)|system prompt|developer message|jailbreak|pretend you are|reveal.*prompt/i.test(question)) {
    return { passed: false, reason: "Prompt injection attempt blocked." };
  }
  const terms = new Set(words(document.text));
  const overlap = words(question).filter((word) => terms.has(word)).length;
  const bestSimilarity = sources[0]?.similarity ?? 0;
  const genericTravelQuestion = /must|see|stay|food|eat|custom|culture|safe|budget|pack|day|itinerary|restaurant|hotel|area|activity|transport|cost|price|weather/i.test(question);
  if (overlap === 0 && bestSimilarity < 0.08 && !genericTravelQuestion) {
    return { passed: false, reason: "Question is outside the uploaded travel material." };
  }
  return { passed: true, reason: "Relevant chunks retrieved from uploaded document." };
}

async function extractText(body: { fileName: string; mimeType?: string; contentBase64?: string; pastedText?: string }) {
  if (body.pastedText?.trim()) return body.pastedText.trim();
  if (!body.contentBase64) return "";
  const buffer = Buffer.from(body.contentBase64, "base64");
  const isPdf = body.mimeType?.includes("pdf") || body.fileName.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
    const parsed = await pdfParse(buffer);
    return parsed.text.trim();
  }
  return buffer.toString("utf8").trim();
}

function handleError(req: Request, res: Response, err: unknown) {
  req.log.error({ err }, "TravelSage route failed");
  const message = err instanceof Error ? err.message : "Unexpected server error";
  res.status(500).json({ error: message });
}

router.post("/travelsage/upload", async (req, res) => {
  try {
    const parsed = UploadTravelGuideBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const text = await extractText(parsed.data);
    if (text.length < 40) {
      res.status(400).json({ error: "Upload a PDF, text file, markdown file, or pasted notes with at least a few sentences." });
      return;
    }

    const fallback = fallbackAnalysis(text, parsed.data.fileName);
    const sample = text.slice(0, 9000);
    const ai = await callOpenAi(
      [
        {
          role: "system",
          content:
            "You extract destination facts from uploaded travel material. Return only JSON with keys: destinationName, country, flagEmoji, attractions, restaurants, activities, priceRanges, climate, culturalNotes, summary. Use only facts present in the document. Arrays must contain strings.",
        },
        { role: "user", content: sample },
      ],
      "upload-analysis",
      { json: true, guardrailPassed: true },
    );
    const analysis = jsonFromText<DestinationAnalysis>(ai.content, fallback);
    const chunks = chunkText(text).map((chunk, index) => ({
      id: `chunk-${index + 1}`,
      text: chunk,
      embedding: embedText(chunk),
    }));
    const documentId = crypto.randomUUID();
    const highlights = highlightsFrom(text, analysis);

    documents.set(documentId, {
      id: documentId,
      fileName: parsed.data.fileName,
      text,
      chunks,
      analysis,
      highlights,
    });

    res.json({
      documentId,
      fileName: parsed.data.fileName,
      textPreview: text.slice(0, 6000),
      chunkCount: chunks.length,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      analysis,
      highlights,
    });
  } catch (err) {
    handleError(req, res, err);
  }
});

router.post("/travelsage/chat", async (req, res) => {
  try {
    const parsed = ChatWithTravelSageBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const document = documents.get(parsed.data.documentId);
    if (!document) {
      res.status(404).json({ error: "Upload a travel guide before asking TravelSage questions." });
      return;
    }
    const sources = retrieve(document, parsed.data.question, 3);
    const check = guardrail(document, parsed.data.question, sources);
    if (!check.passed) {
      addLog({
        endpoint: "chat",
        model: MODEL,
        promptTokens: estimateTokens(parsed.data.question),
        completionTokens: estimateTokens(REFUSAL),
        latencyMs: 0,
        guardrailPassed: false,
        qualityScore: 0.9,
        notes: check.reason,
      });
      res.json({ answer: REFUSAL, sources: [], guardrail: check });
      return;
    }

    const context = sources.map((source) => `[${source.id} | similarity ${source.similarity}]\n${source.text}`).join("\n\n");
    const ai = await callOpenAi(
      [
        {
          role: "system",
          content: `You are TravelSage AI, a friendly destination expert. You help travelers plan trips based ONLY on their uploaded travel guide or destination material.\n\nRules:\n1. ONLY provide information, recommendations, and advice that is present in the provided context from the user's uploaded travel guide.\n2. If asked about something not covered in the uploaded material, respond exactly: "${REFUSAL}"\n3. NEVER invent attractions, restaurants, prices, or activities not mentioned in the context.\n4. NEVER provide made-up opening hours, phone numbers, or addresses unless they appear in the context.\n5. Be enthusiastic and helpful.\n6. Format responses with markdown: use headers for sections, bold for place names, and bullet points for lists.\n7. When mentioning prices, always note they come from the guide and may have changed.\n8. If the guide mentions safety concerns, always include them prominently.`,
        },
        { role: "user", content: `CONTEXT FROM UPLOADED TRAVEL GUIDE:\n${context}\n\nTRAVELER'S QUESTION:\n${parsed.data.question}` },
      ],
      "chat",
      { guardrailPassed: true },
    );

    res.json({ answer: ai.content || REFUSAL, sources, guardrail: check });
  } catch (err) {
    handleError(req, res, err);
  }
});

router.post("/travelsage/generate-itinerary", async (req, res) => {
  try {
    const parsed = GenerateItineraryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const document = documents.get(parsed.data.documentId);
    if (!document) {
      res.status(404).json({ error: "Upload a guide before generating an itinerary." });
      return;
    }
    const sources = retrieve(document, `${parsed.data.style} ${parsed.data.interests.join(" ")} itinerary attractions food transport`, 6);
    const fallback = {
      days: Array.from({ length: parsed.data.days }, (_, index) => ({
        day: index + 1,
        title: `Day ${index + 1}: ${document.analysis.destinationName}`,
        morning: document.analysis.attractions.slice(index, index + 2),
        afternoon: document.analysis.activities.slice(0, 2),
        evening: document.analysis.restaurants.slice(0, 2),
        estimatedCost: document.analysis.priceRanges[index % Math.max(document.analysis.priceRanges.length, 1)] ?? "Use prices mentioned in the guide where available.",
      })),
      sources,
    };
    const ai = await callOpenAi(
      [
        { role: "system", content: "Create a day-by-day travel itinerary using only the provided guide context. Return only JSON: {\"days\":[{\"day\":1,\"title\":\"\",\"morning\":[\"\"],\"afternoon\":[\"\"],\"evening\":[\"\"],\"estimatedCost\":\"\"}]}. Never invent places or prices." },
        { role: "user", content: `Trip length: ${parsed.data.days} days\nStyle: ${parsed.data.style}\nInterests: ${parsed.data.interests.join(", ")}\nContext:\n${sources.map((source) => source.text).join("\n\n")}` },
      ],
      "generate-itinerary",
      { json: true, guardrailPassed: true },
    );
    const result = jsonFromText<{ days: typeof fallback.days }>(ai.content, fallback);
    res.json({ days: result.days.slice(0, parsed.data.days), sources });
  } catch (err) {
    handleError(req, res, err);
  }
});

router.post("/travelsage/generate-packing", async (req, res) => {
  try {
    const parsed = GeneratePackingListBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const document = documents.get(parsed.data.documentId);
    if (!document) {
      res.status(404).json({ error: "Upload a guide before generating a packing list." });
      return;
    }
    const sources = retrieve(document, "packing climate weather culture activities safety clothing gear", 6);
    const fallback = { categories: [{ category: "Guide-grounded essentials", items: ["Comfortable walking shoes", "Day bag", "Weather-appropriate layers"] }], sources };
    const ai = await callOpenAi(
      [
        { role: "system", content: "Generate a smart packing list grounded only in the guide context. Return only JSON: {\"categories\":[{\"category\":\"\",\"items\":[\"\"]}]}. Do not add destination facts not in context." },
        { role: "user", content: sources.map((source) => source.text).join("\n\n") },
      ],
      "generate-packing",
      { json: true, guardrailPassed: true },
    );
    const result = jsonFromText<{ categories: Array<{ category: string; items: string[] }> }>(ai.content, fallback);
    res.json({ categories: result.categories, sources });
  } catch (err) {
    handleError(req, res, err);
  }
});

router.post("/travelsage/generate-budget", async (req, res) => {
  try {
    const parsed = GenerateBudgetBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const document = documents.get(parsed.data.documentId);
    if (!document) {
      res.status(404).json({ error: "Upload a guide before generating a budget." });
      return;
    }
    const sources = retrieve(document, "price cost budget hotel accommodation food transport activity fee ticket", 6);
    const fallback = {
      items: [
        { category: "Prices found in guide", estimate: document.analysis.priceRanges.join(", ") || "No explicit prices found", notes: "TravelSage only uses amounts present in the uploaded guide." },
      ],
      totalGuidance: "Use this as guide-grounded planning guidance; prices may have changed.",
      sources,
    };
    const ai = await callOpenAi(
      [
        { role: "system", content: "Generate a trip budget breakdown using only prices and cost signals in the guide context. Return only JSON: {\"items\":[{\"category\":\"\",\"estimate\":\"\",\"notes\":\"\"}],\"totalGuidance\":\"\"}. Never invent exact prices." },
        { role: "user", content: sources.map((source) => source.text).join("\n\n") },
      ],
      "generate-budget",
      { json: true, guardrailPassed: true },
    );
    const result = jsonFromText<{ items: Array<{ category: string; estimate: string; notes: string }>; totalGuidance: string }>(ai.content, fallback);
    res.json({ items: result.items, totalGuidance: result.totalGuidance, sources });
  } catch (err) {
    handleError(req, res, err);
  }
});

router.post("/travelsage/generate-tips", async (req, res) => {
  try {
    const parsed = GenerateTipsBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const document = documents.get(parsed.data.documentId);
    if (!document) {
      res.status(404).json({ error: "Upload a guide before generating tips." });
      return;
    }
    const sources = retrieve(document, "safety culture custom practical warning etiquette transport weather local", 6);
    const fallback = { safety: [], culture: document.analysis.culturalNotes, practical: [document.analysis.climate], sources };
    const ai = await callOpenAi(
      [
        { role: "system", content: "Generate destination safety, culture, and practical tips grounded only in the guide context. Return only JSON: {\"safety\":[\"\"],\"culture\":[\"\"],\"practical\":[\"\"]}. If a category is not covered, return an empty array for it." },
        { role: "user", content: sources.map((source) => source.text).join("\n\n") },
      ],
      "generate-tips",
      { json: true, guardrailPassed: true },
    );
    const result = jsonFromText<{ safety: string[]; culture: string[]; practical: string[] }>(ai.content, fallback);
    res.json({ safety: result.safety, culture: result.culture, practical: result.practical, sources });
  } catch (err) {
    handleError(req, res, err);
  }
});

router.get("/travelsage/logs", (_req, res) => {
  res.json({ logs });
});

export default router;
