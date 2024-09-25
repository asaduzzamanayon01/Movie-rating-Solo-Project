import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware function
export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams, pathname } = url;

  // Extract query parameter 'user' from URL (e.g. /movies?user=1)
  const userIdFromUrl = searchParams.get("user");

  // Get token and userId from cookies
  const token = req.cookies.get("token")?.value;
  const userIdFromCookie = req.cookies.get("userId")?.value;

  // Check if the user is trying to access a public route (without query params)
  if (pathname === "/movies" && !userIdFromUrl) {
    return NextResponse.next(); // Allow access to public /movies route
  }

  // For private routes: Check if the token and userId exist in cookies
  if (!token || !userIdFromCookie) {
    return NextResponse.redirect(new URL("/login", req.url)); // Redirect to login if not logged in
  }

  // If accessing a private route like /movies?user={id}, check if userId matches the logged-in user's ID
  if (userIdFromUrl && userIdFromUrl !== userIdFromCookie) {
    return NextResponse.redirect(new URL("/403", req.url)); // Redirect to forbidden page
  }

  // If accessing a private route like /update-movie/{id}, check if user is authenticated
  if (pathname.startsWith("/update-movie")) {
    if (!token || !userIdFromCookie) {
      return NextResponse.redirect(new URL("/login", req.url)); // Redirect to login if not logged in
    }
  }

  // If everything checks out, proceed to the requested page
  return NextResponse.next();
}

// Define routes where the middleware should apply
export const config = {
  matcher: ["/movies", "/movies/:path*", "/update-movie/:path*"], // Apply to /movies and /update-movie routes
};
