"use server";

import Event from "@/database/event.model";
import dbConnect from "../mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await dbConnect();
    const event = await Event.findOne({ slug });

    //server actions
    return await Event.find({ _id: { $ne: event._id }, tags: { $in: event.tags } }).lean();
  } catch {
    return [];
  }
};
