import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { auth } from "@/auth";
import { Logout } from "@/components/Logout";

const PoppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});


export const metadata: Metadata = {
  title: "Outpass",
  description: "Campus outpass management sytem",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (

    <html
      lang="en"
      className={` h-full`}
    >
      <body >
        <Header />
        {children}
        <Logout />
      </body>
    </html>
  );
}
