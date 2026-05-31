export { auth as proxy } from "@/lib/auth";

export const config = {
  // Match all routes except API, auth routes, public pages, and static PWA assets.
  matcher: ["/((?!api|login|dev-login|register|_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|workbox-|icons|.*\\.png|.*\\.svg|.*\\.ico|.*\\.js$).*)"],
};
