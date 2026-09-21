import { NextResponse } from "next/server";
import { createGoogleWalletSaveUrl } from "@/lib/google-wallet";

export const dynamic = "force-dynamic";

function walletNotice(dogId: number, title: string, body: string, status = 200) {
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
  request: Request,
  { params }: { params: Promise<{ dogId: string }> },
) {
  const dogId = Number((await params).dogId);
  if (!Number.isInteger(dogId)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return walletNotice(
      dogId,
      "Carteira do Google",
      "A Carteira do Google só adiciona cartões em telefones Android. Abra este certificado no Android para salvar o passaporte.",
    );
  }

  try {
    const saveUrl = await createGoogleWalletSaveUrl(dogId);
    if (!saveUrl) {
      return walletNotice(
        dogId,
        "Carteira do Google",
        "A Carteira do Google ainda não está configurada.",
        503,
      );
    }
    return NextResponse.redirect(saveUrl, 302);
  } catch (error) {
    console.error("Google Wallet save URL failed", error);
    return walletNotice(
      dogId,
      "Carteira do Google",
      "Não foi possível criar o cartão da Carteira do Google. Volte ao certificado e tente de novo.",
      502,
    );
  }
}
