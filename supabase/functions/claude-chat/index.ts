import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  tripContext: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages, tripContext }: RequestBody = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are Ordo — a warm, knowledgeable travel companion AI for a North Wales trip (29–31 March 2026). You help two travellers plan, explore, and make the most of their trip.

Current trip context:
${tripContext}

Your capabilities:
- Suggest packing items based on destination, weather, and planned activities
- Recommend restaurants, cafés, attractions, and photography spots near a location
- Parse natural language to create itinerary entries (e.g. "add dinner at The Quay at 7pm")
- Give general travel advice, weather tips, local customs

When you want to suggest adding an itinerary event, include this exact block at the very end of your response (after a blank line):
<action type="add_itinerary">{"dayId":"REPLACE_DAY_ID","event":{"title":"Event Title","startTime":"HH:MM or phrase","description":"Brief description","category":"sightseeing|travel|dining|accommodation|activity|other"}}</action>

When you want to suggest adding a place to visit, include this at the very end:
<action type="add_place">{"emoji":"📍","name":"Place Name","description":"Short description","shotTip":"Photography tip"}</action>

Only include one action block per response, and only when the user explicitly asks to add something or you have a concrete, specific suggestion. For general conversation or advice, do not include action blocks.

Keep responses concise, warm, and practical. Use markdown for formatting.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? "";

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
