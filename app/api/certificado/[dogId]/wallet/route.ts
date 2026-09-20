import { NextResponse } from "next/server";
import { createGoogleWalletSaveUrl } from "@/lib/google-wallet";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dogId: string }> },
) {
  const dogId = Number((await params).dogId);
  if (!Number.isInteger(dogId)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const saveUrl = await createGoogleWalletSaveUrl(dogId);
    if (!saveUrl) {
      return new NextResponse("Google Wallet is not configured", {
        status: 503,
      });
    }
    return NextResponse.redirect(saveUrl, 302);
  } catch (error) {
    console.error("Google Wallet save URL failed", error);
    return new NextResponse("Could not create Google Wallet pass", {
      status: 502,
    });
  }
}
