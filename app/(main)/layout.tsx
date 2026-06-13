import NextTopLoader from "nextjs-toploader";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <NextTopLoader
        color="#2563eb"
        showSpinner={false}
        height={3}
      />

      <Navbar />

      {children}
    </AuthGuard>
  );
}
