// Voice Design Assistant - Vapi integration for whiteboard interactions
// This module handles voice-based interactions with the whiteboard system
import Vapi from "@vapi-ai/web";
/* ------------------------------------------------------------------ */
/* 🔧  CONFIG – put your keys & helper functions here                 */
/* ------------------------------------------------------------------ */

const PUBLIC_WEB_API_KEY  = "129a98bb-bbcb-444c-b880-7e601d0b5dbb";          // Vapi Web key
const WHITEBOARD_ENDPOINT = "/api/whiteboard";              // Your backend

// Utility: build the system prompt dynamically from whiteboard JSON
function buildSystemPrompt(basePrompt, designJson) {
  const designPretty = JSON.stringify(designJson, null, 2);
  return `${basePrompt}

Here is the CURRENT DESIGN as JSON:
\`\`\`json
${designPretty}
\`\`\`
Please take that into account when asking clarifying questions or suggesting improvements.`;
}

/* ------------------------------------------------------------------ */
/* 🚀  MAIN – create Vapi instance & helper to start a call           */
/* ------------------------------------------------------------------ */

const vapi = new Vapi(PUBLIC_WEB_API_KEY);
vapi.on("*", e => console.log("[Vapi]", e));

/**
 * Starts a call, injecting the latest design JSON into the system prompt.
 * @param {Object} designJson  – whiteboard data you fetch from server
 */
export async function startDesignAssistant(designJson) {
  const basePrompt =
    "You are a voice-based AI assistant for technical Product Managers working " +
    "on complex software systems. Your role is to act as a collaborative design " +
    "partner who helps PMs think through their system architecture, understand " +
    "trade-offs, and make technically sound decisions. You should be highly fluent " +
    "in backend and frontend architecture, cloud infrastructure, databases, caching, " +
    "CI/CD, observability, and modern development practices. You are capable of having " +
    "deep technical conversations about scaling strategies, service boundaries, API design, " +
    "data models, event-driven systems, and deployment trade-offs.\n\n" +
    "Begin the conversation by asking what system or project the PM is currently working on. " +
    "Then, ask smart, targeted follow-up questions to understand the purpose of the system, " +
    "user flows, usage patterns, expected scale, tech constraints, and existing architectural " +
    "decisions. Do not offer suggestions prematurely — first gather all necessary context.\n\n" +
    "Once you understand the system in detail, provide thoughtful feedback and suggestions " +
    "to improve scalability, maintainability, cost-efficiency, or reliability. Offer alternatives " +
    "when appropriate (e.g. \"You could use Redis here, or maybe an in-memory cache if latency " +
    "is critical\"). Always back your suggestions with clear reasoning.\n\n" +
    "Your responses should be short, clear, and voice-friendly — like you're in a fast-paced " +
    "design meeting. Speak like a confident peer: casual, but never vague. Use real technical " +
    "language when necessary, and never over-explain basic concepts to a technical audience. " +
    "If the PM is uncertain or brainstorming, help them think through their ideas by summarizing, " +
    "reframing, or asking clarifying questions.\n\n" +
    "Avoid going off-topic. Your only job is to help the PM move toward a clearer, more technically " +
    "viable system design. Once the design seems solid or the PM indicates they're done, help " +
    "summarize the architecture and wrap up the conversation naturally. You are sharp, articulate, " +
    "and extremely efficient — like a world-class staff engineer who speaks in 30-second bursts.";

  const assistantConfig = {
    name: "PM Design Assistant (Voice)",
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en-US",
    },
    model: {
      provider: "vapi-opal",     // use gpt‑4/gpt‑4o‑mini for deeper reasoning
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(basePrompt, designJson),
        },
      ],
    },
    voice: {
      provider: "playht",
      voiceId: "jennifer",
    },
    // OPTIONAL – enable function‑calling so agent can draw on the board
    tools: [
      {
        type: "function",
        name: "create_whiteboard_element",
        description: "Draws a UI component on the shared whiteboard",
        parameters: {
          type: "object",
          properties: {
            component: { type: "string" },
            x: { type: "number" },
            y: { type: "number" },
          },
          required: ["component", "x", "y"],
        },
      },
    ],
  };

  await navigator.mediaDevices.getUserMedia({ audio: true });
  // Start the voice call with inline assistant
  const call = await vapi.start(assistantConfig);

  /* -------------------------------------------------------------- */
  /* 🖌️  Handle tool‑calls from the LLM → update whiteboard        */
  /* -------------------------------------------------------------- */
  vapi.on("tool-call", async (evt) => {
    if (evt.name === "create_whiteboard_element") {
      try {
        await fetch(WHITEBOARD_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(evt.arguments),
        });
      } catch (err) {
        console.error("Whiteboard update failed:", err);
      }
      // ACK back to Vapi
      vapi.toolCallSuccess(evt.id, { status: "ok" });
    }
  });

  return call; // exposure for the UI if you want to hang up later
}

/* ------------------------------------------------------------------ */
/* 📤  Runtime helpers – push updated context during the call         */
/* ------------------------------------------------------------------ */

/**
 * Push a fresh copy of designJson into the conversation mid‑call
 * to keep the agent fully in sync with the whiteboard state.
 */
export function updateDesignContext(designJson) {
  const prompt = buildSystemPrompt(
    "Context update for the assistant. Keep helping the PM.",
    designJson
  );
  vapi.send({
    type: "add-message",
    message: { role: "system", content: prompt },
  });
}

/**
 * You can also relay user text (e.g., chat box) to the voice stream:
 */
export function sendUserMessage(text) {
  vapi.send({
    type: "add-message",
    message: { role: "user", content: text },
  });
}