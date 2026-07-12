import { NextResponse } from "next/server";

// Nominatim (OpenStreetMap) reverse geocoding — free, no API key. Called
// server-side (not straight from the browser) so we can send a proper
// User-Agent, which their usage policy requires for identifying the
// application making requests.
export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {

    return NextResponse.json(
      { error: "Missing lat/lon." },
      { status: 400 }
    );

  }

  try {

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);

    const response = await fetch(url.toString(), {
      headers: { "User-Agent": "spareX/1.0 (contact: vs.vivek1@gmail.com)" }
    });

    const data = await response.json();
    const address = data.address || {};

    return NextResponse.json({
      district: address.state_district || address.county || "",
      state: address.state || "",
      place:
        address.city ||
        address.town ||
        address.village ||
        address.suburb ||
        ""
    });

  } catch (error) {

    console.error("Reverse geocode failed:", error);

    return NextResponse.json(
      { error: "Couldn't detect your area. Please enter it manually." },
      { status: 502 }
    );

  }

}
