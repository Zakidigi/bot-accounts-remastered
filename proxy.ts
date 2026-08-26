import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "agendacheia_sessao";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const temSessao = Boolean(request.cookies.get(COOKIE_NAME)?.value);

  if (pathname.startsWith("/painel") && !temSessao) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    return NextResponse.redirect(url);
  }

  if ((pathname === "/entrar" || pathname === "/criar-loja") && temSessao) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*", "/entrar", "/criar-loja"],
};
