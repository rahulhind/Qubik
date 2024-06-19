import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../libs/dbConnect";
import Room from "../../../models/Room";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { RtmTokenBuilder, RtmRole } from "agora-access-token";

function getRtmToken(userId: string) {
  const appID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERT!;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  return RtmTokenBuilder.buildToken(
    appID,
    appCertificate,
    userId,
    RtmRole.Rtm_User,
    privilegeExpiredTs
  );
}

// Generate an RTC Token for a user in a specific room
function getRtcToken(roomId: string, userId: string) {
  const appID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERT!;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  return RtcTokenBuilder.buildTokenWithAccount(
    appID,
    appCertificate,
    roomId,
    userId,
    RtcRole.PUBLISHER,
    privilegeExpiredTs
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  await dbConnect();
  const { method, query } = req;
  const userId = query.userId as string;

  switch (method) {
    case "GET":
      try {
        const rooms = await Room.aggregate([
          { $match: { status: "waiting" } },
          { $sample: { size: 1 } },
        ]);

        if (rooms.length > 0) {
          const roomId = rooms[0]._id.toString();
          let status = rooms[0].users.length > 0 ? 'chatting' : 'waiting';

          const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            { status, $addToSet: { users: userId } },
            { new: true }
          );

          res.status(200).json({
            rooms: [updatedRoom],
            rtcToken: getRtcToken(roomId, userId),
            rtmToken: getRtmToken(userId),
          });
        } else {
          res.status(200).json({ rooms: [], rtcToken: null, rtmToken: null });
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(400).json({ message: (error as any).message });
      }
      break;

    case "POST":
      try {
        const room = await Room.create({ status: "waiting", users: [userId] });
        res.status(200).json({
          room,
          rtcToken: getRtcToken(room._id.toString(), userId),
          rtmToken: getRtmToken(userId),
        });
      } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ message: (error as any).message });
      }
      break;

    default:
      res.status(400).json({ message: "Invalid request method for this endpoint." });
      break;
  }
}
