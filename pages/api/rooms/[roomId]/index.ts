

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../../libs/dbConnect";
import Room from "../../../../models/Room";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  await dbConnect();
  const { method, query, body } = req;
  const roomId = query.roomId as string;
  const userId = body.userId as string;

  switch (method) {
    case "PUT":
      try {
        const updatedRoom = await Room.findByIdAndUpdate(
          roomId,
          { status: body.status },
          { new: true }
        );
        if (!updatedRoom) {
          res.status(404).json(`Room with ID ${roomId} not found.`);
        } else {
          res.status(200).json(updatedRoom);
        }
      } catch (error) {
        res.status(500).json((error as any).message);
      }
      break;

    case "DELETE":
      try {
        const updatedRoom = await Room.findByIdAndUpdate(
          roomId,
          {
            $pull: { users: userId },
          },
          { new: true }
        );
        if (!updatedRoom) {
          res.status(404).json(`Room with ID ${roomId} not found.`);
        } else {
          res.status(200).json(updatedRoom);
        }
      } catch (error) {
        res.status(500).json((error as any).message);
      }
      break;
    case "POST":
      try {
        const updatedRoom = await Room.findByIdAndUpdate(
          roomId,
          { $addToSet: { users: userId } }, // Add user only if not already in the array
          { new: true }
        );

        if (!updatedRoom) {
          res.status(404).json(`Room with ID ${roomId} not found.`);
        } else {
          res.status(200).json(updatedRoom);
        }
      } catch (error) {
        res.status(500).json((error as any).message);
      }
      break;
    default:
      res.status(400).json("Invalid request method for this endpoint.");
      break;
  }
}
