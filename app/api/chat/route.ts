import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { drivers, circuits, blogs } from "@/lib/db/schema";
import { eq, or, and, like } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[CHAT_API] OPENAI_API_KEY environment variable is not defined.");
  }
  return new OpenAI({
    apiKey: apiKey,
  });
};

// -------------------------------------------------------------
// Database Helper Tools
// -------------------------------------------------------------

async function searchDrivers(query: string) {
  try {
    const results = await db
      .select({
        id: drivers.id,
        fullName: drivers.fullName,
        firstName: drivers.firstName,
        lastName: drivers.lastName,
        slug: drivers.slug,
        currentTeam: drivers.currentTeam,
        number: drivers.number,
        country: drivers.country,
        racingCategory: drivers.racingCategory,
      })
      .from(drivers)
      .where(
        and(
          eq(drivers.status, "approved"),
          or(
            like(drivers.fullName, `%${query}%`),
            like(drivers.currentTeam, `%${query}%`),
            like(drivers.country, `%${query}%`)
          )
        )
      )
      .limit(10);
    return results;
  } catch (error) {
    console.error("[searchDrivers] Error:", error);
    return { error: "Failed to search drivers." };
  }
}

async function listAllDrivers() {
  try {
    const results = await db
      .select({
        id: drivers.id,
        fullName: drivers.fullName,
        firstName: drivers.firstName,
        lastName: drivers.lastName,
        slug: drivers.slug,
        currentTeam: drivers.currentTeam,
        number: drivers.number,
        country: drivers.country,
        totalWins: drivers.totalWins,
        totalPodiums: drivers.totalPodiums,
        championshipsWon: drivers.championshipsWon,
        racingCategory: drivers.racingCategory,
      })
      .from(drivers)
      .where(eq(drivers.status, "approved"));
    return results;
  } catch (error) {
    console.error("[listAllDrivers] Error:", error);
    return { error: "Failed to retrieve all drivers." };
  }
}

async function getDriverDetails(slug: string) {
  try {
    const data = await db.query.drivers.findFirst({
      where: and(
        eq(drivers.status, "approved"),
        or(eq(drivers.slug, slug), eq(drivers.id, slug))
      ),
      with: {
        achievements: true,
        riderStats: true,
      },
    });
    return data || { error: `Driver with slug/ID '${slug}' not found.` };
  } catch (error) {
    console.error("[getDriverDetails] Error:", error);
    return { error: "Failed to retrieve driver details." };
  }
}

async function searchTracks(query: string) {
  try {
    const results = await db
      .select({
        id: circuits.id,
        name: circuits.name,
        slug: circuits.slug,
        circuitLength: circuits.circuitLength,
        firstGrandPrix: circuits.firstGrandPrix,
      })
      .from(circuits)
      .where(like(circuits.name, `%${query}%`))
      .limit(10);
    return results;
  } catch (error) {
    console.error("[searchTracks] Error:", error);
    return { error: "Failed to search tracks." };
  }
}

async function listAllTracks() {
  try {
    const results = await db
      .select({
        id: circuits.id,
        name: circuits.name,
        slug: circuits.slug,
        circuitLength: circuits.circuitLength,
      })
      .from(circuits);
    return results;
  } catch (error) {
    console.error("[listAllTracks] Error:", error);
    return { error: "Failed to retrieve all tracks." };
  }
}

async function getCircuitDetails(slug: string) {
  try {
    const data = await db.query.circuits.findFirst({
      where: or(eq(circuits.slug, slug), eq(circuits.id, slug)),
      with: {
        faqs: true,
      },
    });
    return data || { error: `Circuit with slug/ID '${slug}' not found.` };
  } catch (error) {
    console.error("[getCircuitDetails] Error:", error);
    return { error: "Failed to retrieve track details." };
  }
}

async function searchBlogs(query: string) {
  try {
    const results = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        excerpt: blogs.excerpt,
        author: blogs.author,
        createdAt: blogs.createdAt,
      })
      .from(blogs)
      .where(
        and(
          eq(blogs.published, true),
          or(
            like(blogs.title, `%${query}%`),
            like(blogs.excerpt, `%${query}%`)
          )
        )
      )
      .limit(10);
    return results;
  } catch (error) {
    console.error("[searchBlogs] Error:", error);
    return { error: "Failed to search blogs." };
  }
}

async function listAllBlogs() {
  try {
    const results = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        excerpt: blogs.excerpt,
        author: blogs.author,
      })
      .from(blogs)
      .where(eq(blogs.published, true));
    return results;
  } catch (error) {
    console.error("[listAllBlogs] Error:", error);
    return { error: "Failed to retrieve all blogs." };
  }
}

async function getBlogDetails(slug: string) {
  try {
    const data = await db.query.blogs.findFirst({
      where: and(
        eq(blogs.published, true),
        or(eq(blogs.slug, slug), eq(blogs.id, slug))
      ),
    });
    return data || { error: `Blog post with slug/ID '${slug}' not found.` };
  } catch (error) {
    console.error("[getBlogDetails] Error:", error);
    return { error: "Failed to retrieve blog details." };
  }
}

// -------------------------------------------------------------
// POST Handler
// -------------------------------------------------------------

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request. 'messages' array is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Friendly fallback mode when API key is missing
      return NextResponse.json({
        role: "assistant",
        content: "⚠️ **Environment Configuration Error**: Please add `OPENAI_API_KEY` to the `.env` file of `speedmania-backend` to enable the fully active grounded database assistant.\n\n*(This is a developer setup message)*"
      });
    }

    const openai = getOpenAIClient();

    // Define the system instructions for grounding
    const systemPrompt = {
      role: "system",
      content: `You are the official SpeedMania AI Assistant, an expert chatbot designed to help users find information about Formula 1/Motorsport drivers, race tracks/circuits, and blog articles from our database.

CRITICAL INSTRUCTIONS:
1. You must ONLY answer using factual data retrieved from the database via your tools.
2. Do NOT use any pre-trained external knowledge or outbound information about motorsport, F1, drivers, tracks, or blogs.
3. If a user asks about something not present in the database, or if your tool searches return no results, you must politely explain that the information is not available in the SpeedMania database.
   Format: "I'm sorry, I couldn't find that information in our official SpeedMania database. Please let me know if there's anything else about drivers, tracks, or blogs I can search for."
4. If a query is ambiguous, call the search tools (e.g. search_drivers, search_tracks, search_blogs) to find relevant slugs or matching records first, then call the detailed retrieval tools.
5. To answer general list, comparison, ranking, or statistical questions (e.g. who has the most championships, who won 12 championships, list all drivers, who is the top driver), ALWAYS call list_all_drivers first to inspect all drivers in the database.
6. If a user asks about a general track or blog title that doesn't return exact search matches, call list_all_tracks or list_all_blogs to inspect all titles in the database and resolve it correctly.
7. Format your responses beautifully using Markdown. Use bold headers, bulleted lists, and tables where appropriate to present statistics elegantly.
8. Absolutely never make up or hallucinate details. If it's not in the tool results, it does not exist.`,
    };

    // Tools definition for OpenAI Chat Completions API
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "search_drivers",
          description: "Searches for approved drivers in the database matching a query (e.g. by full name, team name, or country of origin). Returns a brief list with slugs.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The name, team, or country search query.",
              },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "list_all_drivers",
          description: "Retrieves a summary of all approved drivers in the database including their names, slugs, numbers, teams, championships won, and wins. Use this for general queries like listing all drivers, ranking drivers, finding driver names/slugs, or statistical comparisons (e.g. who won the most championships/wins/podiums).",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "get_driver_details",
          description: "Retrieves complete detailed info about a specific driver, including career details, points, biography, and joins full achievements and rider stats tables. Use this when the user wants specific details about a driver.",
          parameters: {
            type: "object",
            properties: {
              slug: {
                type: "string",
                description: "The unique driver slug or ID (e.g., 'fernando-alonso').",
              },
            },
            required: ["slug"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "search_tracks",
          description: "Searches race circuits/tracks in the database matching a query (e.g. name of circuit). Returns a brief list with slugs.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The circuit name query (e.g., 'Silverstone').",
              },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "list_all_tracks",
          description: "Retrieves a summary list of all circuits/tracks in the database including names and slugs. Use this to find available tracks or resolve ambiguous track questions.",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "get_track_details",
          description: "Retrieves complete detailed info about a specific circuit/track, including circuit length, number of laps, fastest lap records, and circuit FAQs. Use this when the user wants details about a track.",
          parameters: {
            type: "object",
            properties: {
              slug: {
                type: "string",
                description: "The unique track slug or ID (e.g., 'silverstone').",
              },
            },
            required: ["slug"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "search_blogs",
          description: "Searches published blog posts in the database matching a query (e.g. title or excerpt words). Returns a brief list with slugs.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query for blogs.",
              },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "list_all_blogs",
          description: "Retrieves a summary list of all published blog posts in the database including titles and slugs. Use this to find available blog posts or resolve ambiguous questions about blogs/articles.",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "get_blog_details",
          description: "Retrieves the full content and metadata of a specific blog post. Use this when the user asks for details or the content of a specific blog article.",
          parameters: {
            type: "object",
            properties: {
              slug: {
                type: "string",
                description: "The unique blog slug or ID.",
              },
            },
            required: ["slug"],
          },
        },
      },
    ];

    // Build complete message flow
    const apiMessages = [systemPrompt, ...messages];

    let runLoop = true;
    let iterations = 0;
    const maxIterations = 5;

    while (runLoop && iterations < maxIterations) {
      iterations++;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: apiMessages as any,
        tools: tools,
        tool_choice: "auto",
        temperature: 0.1, // Keep it highly deterministic and factual
      });

      const choice = response.choices[0];
      const toolCalls = choice.message.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        // No tool calls needed, we have the final grounded response
        return NextResponse.json({
          role: "assistant",
          content: choice.message.content,
        });
      }

      // We have tool calls. Push the assistant's message with tool calls to the thread
      apiMessages.push(choice.message as any);

      // Resolve each tool call and fetch from MySQL via Drizzle
      for (const toolCall of toolCalls) {
        const tc = toolCall as any;
        const toolName = tc.function.name;
        const toolArgs = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
        let toolOutput: any = null;

        console.log(`[CHAT_API] Calling DB tool: ${toolName} with args:`, toolArgs);

        switch (toolName) {
          case "search_drivers":
            toolOutput = await searchDrivers(toolArgs.query);
            break;
          case "list_all_drivers":
            toolOutput = await listAllDrivers();
            break;
          case "get_driver_details":
            toolOutput = await getDriverDetails(toolArgs.slug);
            break;
          case "search_tracks":
            toolOutput = await searchTracks(toolArgs.query);
            break;
          case "list_all_tracks":
            toolOutput = await listAllTracks();
            break;
          case "get_track_details":
            toolOutput = await getCircuitDetails(toolArgs.slug);
            break;
          case "search_blogs":
            toolOutput = await searchBlogs(toolArgs.query);
            break;
          case "list_all_blogs":
            toolOutput = await listAllBlogs();
            break;
          case "get_blog_details":
            toolOutput = await getBlogDetails(toolArgs.slug);
            break;
          default:
            toolOutput = { error: `Tool ${toolName} not supported.` };
        }

        // Add the tool execution result to the messages array
        apiMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          name: toolName,
          content: JSON.stringify(toolOutput),
        } as any);
      }
    }

    // Fallback if we exceeded maximum iterations
    return NextResponse.json({
      role: "assistant",
      content: "I processed your request, but I needed too many steps to gather the data. Please try asking a more specific question about a driver, track, or blog.",
    });

  } catch (error: any) {
    console.error("[API_CHAT_POST] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
