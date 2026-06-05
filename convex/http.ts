import { httpRouter } from "convex/server";
import { Webhook } from "svix";

import { internal } from "@/_generated/api";
import { httpAction } from "@/_generated/server";

const http = httpRouter();

http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();

    const svixHeaders = {
      "svix-id": request.headers.get("svix-id")!,
      "svix-timestamp": request.headers.get("svix-timestamp")!,
      "svix-signature": request.headers.get("svix-signature")!,
    };

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
    let event: any;

    try {
      event = wh.verify(payload, svixHeaders);
    } catch (err) {
      console.error("Invalid webhook signature", err);
      return new Response("Invalid signature", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: event.data.id,
          firstName: event.data.first_name,
          lastName: event.data.last_name,
          email: event.data.email_addresses?.[0]?.email_address,
          avatarUrl: event.data.image_url,
        });
        break;

      case "user.deleted":
        await ctx.runMutation(internal.users.deleteFromClerk, {
          clerkId: event.data.id,
        });
        break;
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
