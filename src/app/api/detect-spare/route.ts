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
              },
              vehicle: {
                type: "string",
                description:
                  "The vehicle make and model this part is most likely from, if the image gives any indication (badging, part shape/design, visible text), e.g. \"Toyota Innova\" or \"Maruti Swift\". Return an empty string if it can't be reasonably inferred — most parts are not vehicle-specific from a photo alone, so leave this empty far more often than not."
              }
            },
            required: ["title", "category", "vehicle"],
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
              text: "Identify this used vehicle spare part for a resale listing, pick the best-matching category, and note the vehicle make/model only if the image actually indicates one."
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
      category: result.category,
      vehicle: result.vehicle
    });

  } catch (error) {

    console.error("Spare-part detection failed:", error);

    return NextResponse.json(
      { error: "Couldn't identify the part. Please fill it in manually." },
      { status: 502 }
    );

  }

}
