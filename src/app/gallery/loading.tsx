import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const GRID_PLACEHOLDERS = Array.from({ length: 12 }, (_, index) => `gallery-skeleton-${index + 1}`);

export default function GalleryLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      <main className="flex-grow">

        <section className="bg-gradient-dark pt-32 pb-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto mb-4 h-10 w-56">
              <Skeleton className="h-full w-full rounded-full bg-white/20" />
            </div>
            <div className="mx-auto h-5 w-80 max-w-full">
              <Skeleton className="h-full w-full rounded-full bg-white/10" />
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="rounded-[2rem] border border-slate-100/80 bg-gradient-soft p-4 shadow-soft sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {GRID_PLACEHOLDERS.map((placeholderKey) => (
                  <Skeleton
                    key={placeholderKey}
                    className="aspect-[4/3] w-full rounded-2xl border border-white/50 bg-slate-200/80"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
