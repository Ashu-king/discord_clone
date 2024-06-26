import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "../../../../types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method != "POST") {
    return res.json({ error: "Error: method is not allowed " });
  }
  try {
    const profile = await currentProfilePages(req);
    const { content, fileUrl } = req.body;
    const { serverId, ChannelId } = req.query;
    if (!profile) {
      return res.status(401).json({ error: "unauthorized" });
    }
    if (!serverId) {
      return res.status(401).json({ error: "missing serverID" });
    }
    if (!ChannelId) {
      return res.status(401).json({ error: "missing ChannelId" });
    }
    if (!content) {
      return res.status(401).json({ error: "missing content" });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });
    if (!server)
      return res.status(404).json({
        error: "server is miising",
      });
    const channel = await db.channel.findFirst({
      where: {
        id: ChannelId as string,
        serverId: serverId as string,
      },
    });

    if (!channel)
      return res.status(404).json({
        error: "channel is miising",
      });

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );
    if (!member)
      return res.status(404).json({
        error: "member is miising",
      });
    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channelId: ChannelId as string,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });
    const channelKey = `chat:${ChannelId}:messages`;
    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("Api error", error);
  }
}
