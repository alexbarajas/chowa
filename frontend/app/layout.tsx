import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/lib/AppStateContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import NavBar from "@/components/NavBar";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Chowa",
  description: "Cook what you have, tailored to your time and equipment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable} data-theme="light">
      <body className="font-mono bg-paper min-h-screen">
        <ThemeProvider>
          <AppStateProvider>
            <NavBar />
            <div className="max-w-xl mx-auto px-4 py-8">{children}</div>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
