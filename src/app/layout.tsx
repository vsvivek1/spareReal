import type {
 Metadata
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