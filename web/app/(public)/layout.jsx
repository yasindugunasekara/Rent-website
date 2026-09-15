import { BookmarkProvider } from "@/lib/BookmarkContext";
import { CurrencyProvider } from "@/lib/CurrencyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }) {
  return (
    <BookmarkProvider>
      <CurrencyProvider>
        <div className="relative flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </CurrencyProvider>
    </BookmarkProvider>
  );
}
