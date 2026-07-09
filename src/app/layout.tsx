import type {
 Metadata,
 Viewport
} from "next";

import Navbar
from "@/components/layout/Navbar";

import "./globals.css";

import {
 AuthProvider
} from "@/contexts/AuthContext";

export const metadata: Metadata = {
 title: "spareX",
 description:
   "Vehicle Spare Marketplace",
 manifest: "/manifest.json",
 icons: {
   icon: "/icons/icon-192.png",
   apple: "/icons/apple-touch-icon.png",
 },
 appleWebApp: {
   capable: true,
   statusBarStyle: "black-translucent",
   title: "spareX",
 },
};

export const viewport: Viewport = {
 width: "device-width",
 initialScale: 1,
 maximumScale: 1,
 viewportFit: "cover",
 themeColor: "#0b1120",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {

 return (

<html lang="en">

<body>

<AuthProvider>
  <Navbar/>

{children}

</AuthProvider>

</body>

</html>

 );

}