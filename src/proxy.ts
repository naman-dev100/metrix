export { auth as proxy } from "@/lib/auth";

export const config = {
  // Match all routes except auth routes, public login pages, and static assets.
  matcher: ["/((?!api/auth|login|dev-login|_next/static|_next/image|favicon.ico).*)"],
};
