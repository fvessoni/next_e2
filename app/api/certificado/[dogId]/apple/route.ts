import { NextResponse } from "next/server";
import { createAppleWalletPassUrl } from "@/lib/passkit";

export const dynamic = "force-dynamic";

function notice(dogId: number, title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="font-family:Arial,sans-serif;background:#F9F7F1;color:#3A2C24;padding:24px;line-height:1.5">
    <p>${body}</p>
    <p><a href="/certificado/${dogId}" style="color:#3A2C24">Voltar ao certificado</a></p>
  </body>
</html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dogId: string }> },
) {
  const dogId = Number((await params).dogId);
  if (!Number.isInteger(dogId)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const passUrl = await createAppleWalletPassUrl(dogId);
    if (!passUrl) {
      return notice(
        dogId,
        "Apple Wallet",
        "O arquivo da Apple Wallet ainda não está configurado.",
        503,
      );
    }
    return NextResponse.redirect(passUrl, 302);
  } catch (error) {
    console.error("Apple Wallet pass failed", error);
    return notice(
      dogId,
      "Apple Wallet",
      "Não foi possível gerar o arquivo da Apple Wallet. Volte ao certificado e tente de novo.",
      502,
    );
  }
}
