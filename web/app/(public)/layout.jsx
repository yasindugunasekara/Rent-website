import { BookmarkProvider } from "@/lib/BookmarkContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// CurrencyProvider now lives in the root layout (shared with the
// dashboard); only bookmarks are public-site-specific.
export default function PublicLayout({ children }) {
  return (
    <BookmarkProvider>
      <div className="relative flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </BookmarkProvider>
  );
}
