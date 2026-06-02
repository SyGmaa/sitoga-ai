import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { getAllTanaman } from "@/actions/tanaman";
import MapWrapper from "./MapWrapper";

export const metadata = {
  title: "Peta Kebun Raya | SITOBAT-AI",
  description: "Eksplorasi lokasi tanaman obat secara interaktif di Kebun Raya Universitas Riau menggunakan peta interaktif SITOBAT-AI.",
};

export default async function PetaPage() {
  const result = await getAllTanaman();
  const plants = result.success && result.data ? result.data : [];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <Navbar />
      <main className="flex-grow flex flex-col pt-16">
        <MapWrapper plants={plants} />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
