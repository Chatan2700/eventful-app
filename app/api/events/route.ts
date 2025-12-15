import { Event } from "@/database";
import { v2 as cloudinary } from "cloudinary";

import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// POST /api/events
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();

    let event;

    try {
      event = Object.fromEntries(formData.entries());
    } catch (error) {
      return NextResponse.json(
        {
          message: "Invalid Json Data Format",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 } // bad request
      );
    }

    const file = formData.get("image") as File;

    if (!file) return NextResponse.json({ message: "Image file is required" }, { status: 400 });

    const tags = JSON.parse(formData.get("tags") as string);
    const agenda = JSON.parse(formData.get("agenda") as string);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "DevEvent",
          },
          (error, results) => {
            if (error) {
              return reject(error);
            }

            resolve(results);
          }
        )
        .end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    const createdEvent = await Event.create({
      ...event,
      tags: tags,
      agenda: agenda,
    });

    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 } // created
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Event creation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 } //server internal error
    );
  }
}

// GET /api/events
export async function GET() {
  try {
    await dbConnect();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json({ message: "Events fetched successfully", events }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Events fetching failed", error: error }, { status: 500 });
  }
}

// a route that accepts a slug as input -> returns the event details || Error is the event is not found or the slug is invalid -> returns a 404 error
