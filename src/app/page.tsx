"use client";

import {
 useEffect,
 useState
} from "react";

import Link from "next/link";

import {
 useAuth
} from "@/contexts/AuthContext";

import {
 getUserProfile
} from "@/services/userService";

export default function HomePage(){

 const {
   user,
   loading
 } = useAuth();

 const [profile,
 setProfile] =
 useState<any>(null);

 const [checkingProfile,
 setCheckingProfile] =
 useState(true);

 useEffect(()=>{

   const loadProfile =
   async()=>{

     if(!user){

       setCheckingProfile(
         false
       );

       return;

     }

     const data =
     await getUserProfile(
       user.uid
     );

     setProfile(data);

     setCheckingProfile(
       false
     );

   };

   if(!loading){

     loadProfile();

   }

 },[
   user,
   loading
 ]);

 if(loading){

   return(
<h1>
 Loading...
</h1>
   );

 }

 if(checkingProfile){

   return(
<h1>
 Checking Profile...
</h1>
   );

 }

 // Not logged in
 if(!user){

   return(

<div
style={{
 padding:"30px"
}}
>

<h1>
 spareX
</h1>

<p>

Vehicle Spare Marketplace

</p>

<br/>

<Link href="/login">

<button>
 Login
</button>

</Link>

</div>

   );

 }

 // Logged in but no profile
 if(!profile){

   return(

<div
style={{
 padding:"30px"
}}
>

<h1>
 Complete Registration
</h1>

<p>
Please create profile
to continue.
</p>

<br/>

<Link href="/user/register">

<button>
 Create Profile
</button>

</Link>

</div>

   );

 }

 const spareParts = [

   {
     name:"Brake Pad",
     image:"https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1200&auto=format&fit=crop",
     vehicle:"Toyota Innova",
     price:1200
   },

   {
     name:"Battery",
     image:"https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1200&auto=format&fit=crop",
     vehicle:"Swift",
     price:4500
   },

   {
     name:"Engine Oil",
     image:"https://images.unsplash.com/photo-1635764706066-8e47cfb8d78b?q=80&w=1200&auto=format&fit=crop",
     vehicle:"Hyundai i20",
     price:900
   },

   {
     name:"Headlight",
     image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
     vehicle:"Fortuner",
     price:3200
   },

   {
     name:"Tyre",
     image:"https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=1200&auto=format&fit=crop",
     vehicle:"Baleno",
     price:5800
   },

   {
     name:"Suspension",
     image:"https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop",
     vehicle:"Honda City",
     price:7600
   }

 ];

 const workshops = [

   {
     name:"AutoFix Workshop",
     image:"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1200&auto=format&fit=crop",
     rating:"4.5"
   },

   {
     name:"City Garage",
     image:"https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?q=80&w=1200&auto=format&fit=crop",
     rating:"4.2"
   },

   {
     name:"Premium Motors",
     image:"https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1200&auto=format&fit=crop",
     rating:"4.8"
   }

 ];

 return(

<div
style={{
 padding:"20px"
}}
>

<h1>
 spareX Feed
</h1>

<p>

Welcome

<b>
 {
   profile.name
 }
</b>

</p>

<p>

Role:
{
 profile.role
}

</p>

<p>

Plan:
{
 profile.isPremium
 ? " Premium"
 : " Free"
}

</p>

<br/>

<input
placeholder="Search spare parts..."
style={{
 width:"100%",
 padding:"10px",
 borderRadius:"10px",
 border:"1px solid #ccc"
}}
/>

<br/><br/>

<h2>
 Latest Spare Parts
</h2>

<div
style={{
 display:"grid",
 gridTemplateColumns:
 "repeat(auto-fill,minmax(250px,1fr))",
 gap:"15px"
}}
>

{
 spareParts.map(
 (item,index)=>{

   return(

<div
key={index}
style={{
 border:"1px solid #ccc",
 borderRadius:"10px",
 padding:"15px"
}}
>

<img
src={item.image}
style={{
 width:"100%",
 height:"180px",
 objectFit:"cover",
 borderRadius:"10px"
}}
/>

<br/><br/>

<h3>
{
 item.name
}
</h3>

<p>
{
 item.vehicle
}
</p>

<p>

₹
{
 item.price
}

</p>

<p>
Condition: Used
</p>

<button>
 View Details
</button>

</div>

   );

 })
}

</div>

<br/><br/>

<h2>
 Nearby Workshops
</h2>

<div
style={{
 display:"flex",
 gap:"15px",
 overflowX:"auto"
}}
>

{
 workshops.map(
 (item,index)=>{

   return(

<div
key={index}
style={{
 minWidth:"260px",
 border:"1px solid #ccc",
 borderRadius:"10px",
 padding:"15px"
}}
>

<img
src={item.image}
style={{
 width:"100%",
 height:"150px",
 objectFit:"cover",
 borderRadius:"10px"
}}
/>

<br/><br/>

<h3>
{
 item.name
}
</h3>

<p>
Kozhikode
</p>

<p>

⭐
{
 item.rating
}

</p>

<button>
 View Workshop
</button>

</div>

   );

 })
}

</div>

<br/><br/>

<h2>
 Premium Benefits
</h2>

<div
style={{
 border:"1px solid gold",
 padding:"20px",
 borderRadius:"10px"
}}
>

<p>
✓ Direct contact access
</p>

<p>
✓ Unlimited photos
</p>

<p>
✓ Featured listings
</p>

<p>
✓ Priority visibility
</p>

<Link href="/pricing">

<button>
 Upgrade Now
</button>

</Link>

</div>

</div>

 );

}