"use client";

import Link from "next/link";

import {
 usePathname
} from "next/navigation";

import {
 signOut
} from "firebase/auth";

import {
 auth
} from "@/lib/firebase";

import {
 useAuth
} from "@/contexts/AuthContext";

export default function Navbar(){

 const {
   user
 } = useAuth();

 const pathname =
 usePathname();

 const handleLogout =
 async()=>{

   try{

     await signOut(auth);

   }catch(error){

     console.log(error);

   }

 };

 const getLinkStyle =
 (path:string)=>{

   const isActive =
   pathname===path;

   return{

     textDecoration:"none",

     padding:"10px 18px",

     borderRadius:"12px",

     transition:"0.2s",

     fontWeight:600,

     background:
     isActive
     ? "white"
     : "transparent",

     color:
     isActive
     ? "#2563eb"
     : "white",

     border:
     isActive
     ? "2px solid #60a5fa"
     : "2px solid transparent",

     boxShadow:
     isActive

     ?

     `
     0 0 8px rgba(37,99,235,0.45),
     0 0 18px rgba(37,99,235,0.25)
     `

     :

     "none"

   };

 };

 return(

<div
style={{
 padding:"15px",
 borderBottom:
 "1px solid rgba(255,255,255,0.15)",

 display:"flex",

 gap:"12px",

 flexWrap:"wrap",

 background:"#0f172a"
}}
>

<Link
href="/"
style={
 getLinkStyle("/")
}
>
 Home
</Link>

{
 user && (
<>

<Link
href="/user/profile"
style={
 getLinkStyle(
 "/user/profile"
 )
}
>
 Profile
</Link>

<Link
href="/user/edit"
style={
 getLinkStyle(
 "/user/edit"
 )
}
>
 Edit Profile
</Link>

<Link
href="/ground"
style={
 getLinkStyle(
 "/ground"
 )
}
>
 Ground
</Link>

<Link
href="/my-listings"
style={
 getLinkStyle(
 "/my-listings"
 )
}
>
 My Listings
</Link>

<Link
href="/make-request"
style={
 getLinkStyle(
 "/make-request"
 )
}
>
 Request Spare
</Link>

<Link
href="/my-requests"
style={
 getLinkStyle(
 "/my-requests"
 )
}
>
 My Requests
</Link>

<Link
href="/favorites"
style={
 getLinkStyle(
 "/favorites"
 )
}
>
 Favorites
</Link>

<Link
href="/chat"
style={
 getLinkStyle(
 "/chat"
 )
}
>
 Chat
</Link>

<Link
href="/dashboard"
style={
 getLinkStyle(
 "/dashboard"
 )
}
>
 Dashboard
</Link>

<Link
href="/add-spare"
style={
 getLinkStyle(
 "/add-spare"
 )
}
>
 Add Spare
</Link>

<Link
href="/spare-parts"
style={
 getLinkStyle(
 "/spare-parts"
 )
}
>
 Spare Parts
</Link>

<Link
href="/pricing"
style={
 getLinkStyle(
 "/pricing"
 )
}
>
 Premium
</Link>

<button
onClick={
 handleLogout
}
style={{
 padding:"10px 18px",

 borderRadius:"12px",

 border:"none",

 background:"#dc2626",

 color:"white",

 cursor:"pointer",

 fontWeight:600
}}
>
 Logout
</button>

</>
 )
}

{
 !user && (

<Link
href="/login"
style={
 getLinkStyle(
 "/login"
 )
}
>
 Login
</Link>

 )
}

</div>

 );

}