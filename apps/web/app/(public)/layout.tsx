import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg public-dot-grid relative">
      {/* Ambient orbs */}
      <div
        className="fixed top-[15%] left-[10%] w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none"
        style={{ animation: "public-glow-pulse 8s ease-in-out infinite" }}
      />
      <div
        className="fixed bottom-[10%] right-[5%] w-[350px] h-[350px] bg-accent/[0.04] rounded-full blur-[100px] pointer-events-none"
        style={{ animation: "public-glow-pulse 10s ease-in-out infinite 2s" }}
      />
      <div
        className="fixed top-[60%] left-[50%] w-[300px] h-[300px] bg-[#a78bfa]/[0.03] rounded-full blur-[100px] pointer-events-none"
        style={{ animation: "public-glow-pulse 12s ease-in-out infinite 4s" }}
      />

      <Header />
      <main className="relative min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </div>
  );
}
