"use client";

import Link from "next/link";

import {
 signOut
} from "firebase/auth";

import { auth } from "@/lib/firebase";

import {
 useAuth
} from "@/contexts/AuthContext";

export default function Navbar(){

 const {
   user
 } = useAuth();

 const handleLogout =
 async()=>{

   try{

     await signOut(auth);

   }catch(error){

     console.log(error);

   }

 };

 return(

<div
style={{
 padding:"15px",
 borderBottom:
 "1px solid #ccc",
 display:"flex",
 gap:"15px",
 flexWrap:"wrap"
}}
>

<Link href="/">
 Home
</Link>

{
 user && (
<>

<Link href="/user/profile">
 Profile
</Link>

<Link href="/user/edit">
 Edit Profile
</Link>

<Link href="/my-listings">
 My Listings
</Link>

<Link href="/my-requests">
 My Requests
</Link>

<Link href="/favorites">
 Favorites
</Link>

<Link href="/chat">
 Chat
</Link>

<Link href="/dashboard">
 Dashboard
</Link>

<Link href="/add-spare">
 Add Spare
</Link>

<Link href="/spare-parts">
 Spare Parts
</Link>

<Link href="/pricing">
 Premium
</Link>

<button
onClick={
 handleLogout
}
>
 Logout
</button>

</>
 )
}

{
 !user && (

<Link href="/login">
 Login
</Link>

 )
}

</div>

 );

}