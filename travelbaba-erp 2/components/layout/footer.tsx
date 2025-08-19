import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-brown text-beige">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">
              <span className="text-gold">Travel</span>
              <span className="text-beige">Baba</span>
              <span className="text-gold">Voyage</span>
            </div>
            <p className="text-tan text-sm leading-relaxed">
              Curated trips, cultural experiences, and custom itineraries across India and beyond. Creating memories
              that last a lifetime.
            </p>
            <div className="flex space-x-4">
              <Link href="https://instagram.com/travelbabavoyage" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram text-xl hover:text-gold transition-colors"></i>
              </Link>
              <Link href="https://facebook.com/travelbabavoyage" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook text-xl hover:text-gold transition-colors"></i>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/travel-with-us" className="block text-tan hover:text-gold transition-colors text-sm">
                Travel With Us
              </Link>
              <Link href="/create-your-itinerary" className="block text-tan hover:text-gold transition-colors text-sm">
                Create Itinerary
              </Link>
              <Link href="/homestay" className="block text-tan hover:text-gold transition-colors text-sm">
                Homestay
              </Link>
              <Link href="/blogs" className="block text-tan hover:text-gold transition-colors text-sm">
                Blogs
              </Link>
            </div>
          </div>

          {/* Destinations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Destinations</h3>
            <div className="space-y-2">
              <Link href="/destinations/india" className="block text-tan hover:text-gold transition-colors text-sm">
                India
              </Link>
              <Link href="/destinations/goa" className="block text-tan hover:text-gold transition-colors text-sm">
                Goa
              </Link>
              <Link href="/destinations/kashmir" className="block text-tan hover:text-gold transition-colors text-sm">
                Kashmir
              </Link>
              <Link href="/destinations/ladakh" className="block text-tan hover:text-gold transition-colors text-sm">
                Ladakh
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Contact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <i className="fas fa-envelope text-gold"></i>
                <span className="text-tan">info@travelbabavoyage.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-phone text-gold"></i>
                <span className="text-tan">+91 98765 43210</span>
              </div>
              <div className="flex items-start space-x-2">
                <i className="fas fa-map-marker-alt text-gold mt-1"></i>
                <span className="text-tan">Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-tan/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-tan text-sm">© 2025 TravelBabaVoyage. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-tan hover:text-gold transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-tan hover:text-gold transition-colors text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
