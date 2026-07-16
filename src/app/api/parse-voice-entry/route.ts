import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORIES = [
  "Engine",
  "Brake",
  "Electrical",
  "Tyre",
  "Suspension",
  "Body Parts",
  "Lighting",
  "Battery",
  "Oil & Fluids",
  "Accessories",
  "Scrap – Aluminum",
  "Scrap – Copper",
  "Scrap – Steel",
  "Scrap – Mixed Metal",
  "Scrap – Other"
];

export async function POST(request: Request) {

  const { transcript } = await request.json();

  if (!transcript || !transcript.trim()) {

    return NextResponse.json(
      { error: "Didn't catch that. Please try again." },
      { status: 400 }
    );

  }

  try {

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description:
                  "A short, specific listing title for the spare part described, e.g. \"Front brake pad set\" or \"Alternator\"."
              },
              category: {
                type: "string",
                enum: CATEGORIES
              },
              make: {
                type: "string",
                description:
                  "The vehicle manufacturer mentioned, e.g. \"Toyota\" or \"Maruti Suzuki\". Empty string if no vehicle was mentioned."
              },
              model: {
                type: "string",
                description:
                  "The specific vehicle model mentioned, e.g. \"Innova\" or \"Swift\". Empty string if not mentioned."
              },
              year: {
                type: "string",
                description:
                  "A 4-digit model year if one was mentioned, e.g. \"2018\". Empty string if not mentioned."
              },
              quantity: {
                type: "number",
                description:
                  "How many of this part are available, based on any count/number mentioned (e.g. \"three\", \"5 pieces\", \"two units\"). Default to 1 if no count was mentioned."
              },
              partNumber: {
                type: "string",
                description:
                  "An OEM or aftermarket part number if one was read out. Empty string if not mentioned."
              }
            },
            required: ["title", "category", "make", "model", "year", "quantity", "partNumber"],
            additionalProperties: false
          }
        }
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "The following is a speech-to-text transcript of a scrapyard worker in Kerala, India describing a used vehicle spare part they want to list for sale. It may be in English, Malayalam, or a mix of both (Manglish), and may be informal or contain transcription errors. Extract the structured fields for the listing. Only fill in a field if it was actually mentioned — never guess or invent details that weren't said.\n\nTranscript: \"" +
                transcript +
                "\""
            }
          ]
        }
      ]
    });

    const textBlock = response.content.find((block) => block.type === "text");

    if (!textBlock || textBlock.type !== "text") {

      return NextResponse.json(
        { error: "Couldn't understand that. Please fill in manually." },
        { status: 502 }
      );

    }

    const result = JSON.parse(textBlock.text);

    return NextResponse.json({
      title: result.title,
      category: result.category,
      make: result.make,
      model: result.model,
      year: result.year,
      quantity: result.quantity,
      partNumber: result.partNumber
    });

  } catch (error) {

    console.error("Voice entry parsing failed:", error);

    return NextResponse.json(
      { error: "Couldn't understand that. Please fill in manually." },
      { status: 502 }
    );

  }

}
