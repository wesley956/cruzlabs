import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabasePublicEnv } from "./env";

type SessionGuardOptions = {
  protectedPrefixes?: string[];
  guestOnlyPaths?: string[];
  authenticatedRedirectTo?: string;
};

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function copyResponseCookies(source: NextResponse, destination: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => destination.cookies.set(cookie));
  return destination;
}

export async function updateSupabaseSession(
  request: NextRequest,
  options: SessionGuardOptions = {},
) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabasePublicEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
          response.cookies.set(name, value, cookieOptions);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = options.protectedPrefixes?.some((prefix) =>
    matchesPrefix(pathname, prefix),
  );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/entrar";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

    return copyResponseCookies(response, NextResponse.redirect(loginUrl));
  }

  const isGuestOnly = options.guestOnlyPaths?.includes(pathname);

  if (isGuestOnly && user) {
    const destination = request.nextUrl.clone();
    destination.pathname = options.authenticatedRedirectTo ?? "/boas-vindas";
    destination.search = "";

    return copyResponseCookies(response, NextResponse.redirect(destination));
  }

  return response;
}
