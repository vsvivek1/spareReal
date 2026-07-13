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
                  "The vehicle make and model this part is from, e.g. \"Toyota Innova\" or \"Maruti Swift\". Some part types are commonly model-specific in their visual design even with no text or logo present — headlights, tail lights, bumpers, mirrors, grilles, and body panels often have a shape distinctive enough to identify the vehicle on sight, the way an experienced mechanic would. Actively attempt identification from shape/design for these part types, not just from visible badging or text. For part types that are genuinely generic across vehicles (bolts, hoses, brackets, bearings, belts, small hardware), return an empty string rather than guessing — there's no visual basis to identify a vehicle from those regardless of part type."
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
              text: "Identify this used vehicle spare part for a resale listing and pick the best-matching category. If this is a part type whose design is typically vehicle-specific (e.g. a headlight, tail light, bumper, mirror, grille, or body panel), look closely at its shape and try to identify the exact vehicle make and model it's from, even without any visible text or logo. If it's a generic part type with no vehicle-specific visual design, leave the vehicle field empty."
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
