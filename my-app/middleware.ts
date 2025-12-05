import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "./src/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { pathname } = request.nextUrl;

  // If no session, redirect to login (except for login/register pages)
  if (!session?.user) {
    if (pathname !== "/login" && pathname !== "/register") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // User is authenticated - allow access to protected routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/blueprint", "/tasks", "/legal", "/templates", "/admin", "/onboarding"],
};