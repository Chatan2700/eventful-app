import { Event } from "@/database";
import dbConnect from "@/lib/mongodb";

import { NextRequest, NextResponse } from "next/server";

// app/api/events/[slugs]/route.to-secondary

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const slug = (await context.params).slug;

  // sanitize slug (remove any special characters)
  const sanitizedSlug = slug.trim().toLocaleLowerCase();

  try {
    // connect to db
    await dbConnect();

    // find the event by slug
    const event = await Event.findOne({ slug: sanitizedSlug });

    // if event is not found
    if (!event) {
      console.log(event);
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // if event is found, return it as a response

    return NextResponse.json(
      {
        message: "Event fetched successfully",
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    // in case of fetching error
    return NextResponse.json({ message: "Event fetching failed", error: error }, { status: 500 });
  }
}
