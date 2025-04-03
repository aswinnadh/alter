
import { clerkClient } from "@clerk/clerk-sdk-node"; // ✅ Corrected import
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  try {
    // ✅ Load Webhook Secret
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env");
    }

    // ✅ Await `headers()` before accessing `.get()`
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing Svix headers", { status: 400 });
    }

    // ✅ Read request body
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // ✅ Verify Webhook Signature
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Invalid webhook signature", { status: 400 });
    }

    const { id } = evt.data;
    if (!id) {
      return new Response("Missing user ID", { status: 400 });
    }

    const eventType = evt.type;

    // ✅ Handle User Created Event
    if (eventType === "user.created") {
      const { email_addresses, image_url, first_name, last_name, username } = evt.data;

      const user = {
        clerkId: id,
        email: email_addresses?.[0]?.email_address ?? "no-email@example.com",
        username: username ?? `user_${id.slice(0, 6)}`, // Fallback username
        firstName: first_name ?? "", // Ensure no null/undefined values
        lastName: last_name ?? "", // Ensure no null/undefined values
        photo: image_url ?? "",
      };

      const newUser = await createUser(user);

      // ✅ Update Clerk metadata only if user was created successfully
      if (newUser) {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
            userId: newUser._id,
          },
        });
      }

      return NextResponse.json({ message: "User created", user: newUser });
    }

    // ✅ Handle User Updated Event
    if (eventType === "user.updated") {
      const { image_url, first_name, last_name, username } = evt.data;

      const user = {
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        username: username ?? `user_${id.slice(0, 6)}`,
        photo: image_url ?? "",
      };

      const updatedUser = await updateUser(id, user);
      return NextResponse.json({ message: "User updated", user: updatedUser });
    }

    // ✅ Handle User Deleted Event
    if (eventType === "user.deleted") {
      const deletedUser = await deleteUser(id);
      return NextResponse.json({ message: "User deleted", user: deletedUser });
    }

    console.log(`Unhandled webhook event: ${eventType}, ID: ${id}`);
    return new Response("Event received", { status: 200 });
  } catch (error) {
    console.error("Unexpected error processing webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
