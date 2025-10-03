import Image from "next/image";
import Footer from "@/components/footer";
import Navigation from "@/components/navigation";

export const metadata = {
  title: "Gallery | Flamingo Restaurant",
  description: "View our restaurant ambiance and delicious dishes",
};

export default function Gallery() {
  const images = [
    {
      src: "/assets/hero-dining.jpg",
      alt: "Dining Experience",
      caption: "Elegant dining area with ambient lighting",
    },
    {
      src: "/assets/restaurant-interior.jpg",
      alt: "Interior",
      caption: "Modern and cozy interior design",
    },
    {
      src: "/assets/food-main.jpg",
      alt: "Main Course",
      caption: "Perfectly prepared main courses",
    },
    {
      src: "/assets/food-starter.jpg",
      alt: "Appetizers",
      caption: "Delightful appetizers",
    },
    {
      src: "/assets/food-dessert.jpg",
      alt: "Desserts",
      caption: "Sweet delicacies",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Our <span className="text-gradient-accent">Gallery</span>
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mx-auto">
            Take a visual tour of our restaurant and cuisine
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((image, idx) => (
              <div
                key={idx}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg hover-lift shadow-soft hover:shadow-elegant transition-all duration-300"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <p className="text-white font-medium">{image.caption}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16 bg-gradient-soft rounded-xl p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Experience the Ambiance in Person
            </h2>
            <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
              Join us for an unforgettable dining experience in our beautiful restaurant.
              Make a reservation today and create your own memories.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
