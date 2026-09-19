import Link from "next/link";
import { APP_NAME, BrandMark } from "@/app/components/brand-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-primary p-10 text-primary-foreground lg:flex">
        <div className="relative flex h-full flex-1 items-center justify-center">
          <div className="flex aspect-square w-48 flex-col items-center justify-center rounded-full bg-gray-800 p-8 sm:w-56">
            <BrandMark className="h-16 w-16" />
            <p className="mt-4 text-lg font-semibold tracking-tight">{APP_NAME}</p>
          </div>
        </div>
        <footer className="relative z-20 mt-auto text-xs text-gray-400">
          Desenvolvido por Fabio!
        </footer>
      </div>

      <div className="flex min-h-screen flex-1 flex-col p-4 lg:min-h-0 lg:p-8">
        <div className="mx-auto flex w-full max-w-[350px] flex-1 flex-col justify-center space-y-6">
          <div className="flex flex-col items-center space-y-2 text-center lg:hidden">
            <BrandMark />
            <h1 className="text-2xl font-semibold tracking-tight text-gray-500">
              {APP_NAME}
            </h1>
          </div>
          {children}
          <p className="text-center text-xs text-muted-foreground lg:hidden">
            Desenvolvido por{" "}
            <Link
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Fabio!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
