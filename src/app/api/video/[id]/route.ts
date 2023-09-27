import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "~/lib/server/prisma";

const PatchQuerySchema = z.object({
  id: z.string(),
});

const PatchBodySchema = z.object({
  title: z.string(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: unknown }
) {
  // Parse query
  const queryParseResult = PatchQuerySchema.safeParse(context.params);
  if (!queryParseResult.success) {
    return new NextResponse(JSON.stringify({ message: "No ID in url" }), {
      status: 400,
    });
  }
  const query = queryParseResult.data;

  // Parse body
  const bodyParseResult = PatchBodySchema.safeParse(await request.json());
  if (!bodyParseResult.success) {
    return new NextResponse(JSON.stringify({ message: "Body is invalid" }), {
      status: 400,
    });
  }
  const body = bodyParseResult.data;

  // Parse session
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(JSON.stringify({ message: "Requires session" }), {
      status: 403,
    });
  }

  try {
    const video = await prisma.video.update({
      where: {
        id: query.id,
        userId: session.user.id,
      },
      data: body,
    });

    return NextResponse.json(video);
  } catch (e: any) {
    return new NextResponse(e.toString(), { status: 500 });
  }
}
