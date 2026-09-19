import SideNav from "../components/sidenav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SideNav />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
