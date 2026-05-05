import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Match all routes except for:
  // 1. api/auth (auth routes)
  // 2. login (the login page itself)
  // 3. dev-login (developer login page)
  // 4. public assets (images, favicon, etc.)
  matcher: ["/((?!api/auth|login|dev-login|_next/static|_next/image|favicon.ico).*)"],
};
