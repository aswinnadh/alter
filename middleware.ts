import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes
const isPublicRoute = createRouteMatcher([
  "/api/webhooks/clerk", // Add any other public routes here
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return; // Allow public routes to bypass authentication
  }

  const { userId } = await auth(); // Await the auth function

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
});

// Matcher Configuration
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
