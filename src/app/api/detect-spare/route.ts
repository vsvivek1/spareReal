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

  const { image, mediaType } = await request.json();

  if (!image) {

    return NextResponse.json(
      { error: "No photo provided." },
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
                  "A short, specific listing title for this vehicle spare part, e.g. \"Front brake pad set\" or \"Alternator\"."
              },
              category: {
                type: "string",
                enum: CATEGORIES
              }
            },
            required: ["title", "category"],
            additionalProperties: false
          }
        }
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: image
              }
            },
            {
              type: "text",
              text: "Identify this used vehicle spare part for a resale listing and pick the best-matching category."
            }
          ]
        }
      ]
    });

    const textBlock = response.content.find((block) => block.type === "text");

    if (!textBlock || textBlock.type !== "text") {

      return NextResponse.json(
        { error: "Couldn't identify the part. Please fill it in manually." },
        { status: 502 }
      );

    }

    const result = JSON.parse(textBlock.text);

    return NextResponse.json({
      title: result.title,
      category: result.category
    });

  } catch (error) {

    console.error("Spare-part detection failed:", error);

    return NextResponse.json(
      { error: "Couldn't identify the part. Please fill it in manually." },
      { status: 502 }
    );

  }

}
