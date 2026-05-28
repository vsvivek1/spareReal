"use client";

import {
 useEffect,
 useState
} from "react";

import {
 collection,
 getDocs
} from "firebase/firestore";

import {
 db
} from "@/lib/firebase";

export default function GroundPage(){

 const [activeTab,
 setActiveTab] =
 useState("listings");

 const [listings,
 setListings] =
 useState<any[]>([]);

 const [requests,
 setRequests] =
 useState<any[]>([]);

 const [loading,
 setLoading] =
 useState(true);

 const [search,
 setSearch] =
 useState("");

 const [category,
 setCategory] =
 useState("");

 const [district,
 setDistrict] =
 useState("");

 useEffect(()=>{

   const loadData =
   async()=>{

     try{

       // Load Listings
       const listingSnapshot =
       await getDocs(

         collection(
           db,
           "spareListings"
         )

       );

       const listingItems:any[] =
       [];

       listingSnapshot.forEach((doc)=>{

         listingItems.push({

           id:doc.id,

           ...doc.data()

         });

       });

       setListings(
         listingItems
       );

       // Load Requests
       const requestSnapshot =
       await getDocs(

         collection(
           db,
           "spareRequests"
         )

       );

       const requestItems:any[] =
       [];

       requestSnapshot.forEach((doc)=>{

         requestItems.push({

           id:doc.id,

           ...doc.data()

         });

       });

       setRequests(
         requestItems
       );

     }catch(error){

       console.log(error);

     }finally{

       setLoading(false);

     }

   };

   loadData();

 },[]);

 // Filter Listings
 const filteredListings =
 listings.filter((item)=>{

   const matchesSearch =

   item.title
   ?.toLowerCase()
   .includes(
     search.toLowerCase()
   )

   ||

   item.vehicle
   ?.toLowerCase()
   .includes(
     search.toLowerCase()
   );

   const matchesCategory =

   !category

   ||

   item.category===category;

   const matchesDistrict =

   !district

   ||

   item.district===district;

   return(

     matchesSearch
     &&
     matchesCategory
     &&
     matchesDistrict

   );

 });

 // Filter Requests
 const filteredRequests =
 requests.filter((item)=>{

   const matchesSearch =

   item.sparePart
   ?.toLowerCase()
   .includes(
     search.toLowerCase()
   )

   ||

   item.brand
   ?.toLowerCase()
   .includes(
     search.toLowerCase()
   );

   const matchesDistrict =

   !district

   ||

   item.district===district;

   return(

     matchesSearch
     &&
     matchesDistrict

   );

 });

 if(loading){

   return(

<div
style={{
 padding:"20px"
}}
>

<h1>
 Loading...
</h1>

</div>

   );

 }

 return(

<div
style={{
 padding:"20px"
}}
>

<h1>
 Ground
</h1>

<p>
 Marketplace Feed
</p>

<br/>

{/* Filters */}

<div
style={{
 display:"grid",
 gridTemplateColumns:
 "repeat(auto-fit,minmax(200px,1fr))",
 gap:"10px"
}}
>

<input
placeholder="Search..."
value={search}
onChange={(e)=>
setSearch(
 e.target.value
)}
style={{
 padding:"10px"
}}
/>

<select
value={category}
onChange={(e)=>
setCategory(
 e.target.value
)}
style={{
 padding:"10px"
}}
>

<option value="">
 All Categories
</option>

<option>
 Engine
</option>

<option>
 Brake
</option>

<option>
 Electrical
</option>

<option>
 Tyre
</option>

<option>
 Suspension
</option>

<option>
 Body Parts
</option>

<option>
 Lighting
</option>

<option>
 Battery
</option>

<option>
 Accessories
</option>

</select>

<select
value={district}
onChange={(e)=>
setDistrict(
 e.target.value
)}
style={{
 padding:"10px"
}}
>

<option value="">
 All Districts
</option>

<option>
 Kozhikode
</option>

<option>
 Malappuram
</option>

<option>
 Kannur
</option>

<option>
 Wayanad
</option>

<option>
 Ernakulam
</option>

<option>
 Trivandrum
</option>

</select>

</div>

<br/>

{/* Tabs */}

<div
style={{
 display:"flex",
 gap:"10px"
}}
>

<button
onClick={()=>
setActiveTab(
 "listings"
)}
style={{

 padding:"12px 22px",

 borderRadius:"12px",

 border:
 activeTab==="listings"
 ? "2px solid #60a5fa"
 : "2px solid transparent",

 background:
 activeTab==="listings"
 ? "white"
 : "#1e293b",

 color:
 activeTab==="listings"
 ? "#2563eb"
 : "white",

 fontWeight:600,

 boxShadow:

 activeTab==="listings"

 ?

 `
 0 0 8px rgba(37,99,235,0.45),
 0 0 18px rgba(37,99,235,0.25)
 `

 :

 "none",

 transition:"0.2s",

 cursor:"pointer"

}}
>

Listings

</button>

<button
onClick={()=>
setActiveTab(
 "requirements"
)}
style={{

 padding:"12px 22px",

 borderRadius:"12px",

 border:
 activeTab==="requirements"
 ? "2px solid #60a5fa"
 : "2px solid transparent",

 background:
 activeTab==="requirements"
 ? "white"
 : "#1e293b",

 color:
 activeTab==="requirements"
 ? "#2563eb"
 : "white",

 fontWeight:600,

 boxShadow:

 activeTab==="requirements"

 ?

 `
 0 0 8px rgba(37,99,235,0.45),
 0 0 18px rgba(37,99,235,0.25)
 `

 :

 "none",

 transition:"0.2s",

 cursor:"pointer"

}}
>

Requirements

</button>

</div>

<br/><br/>

{/* Listings */}

{
 activeTab==="listings"
 && (

<div
style={{
 display:"grid",
 gridTemplateColumns:
 "repeat(auto-fill,minmax(280px,1fr))",
 gap:"20px"
}}
>

{
 filteredListings.map((item)=>{

   return(

<div
key={item.id}
style={{
 border:"1px solid #ccc",
 borderRadius:"10px",
 padding:"15px"
}}
>

<img
src={item.imageUrl}
style={{
 width:"100%",
 height:"200px",
 objectFit:"cover",
 borderRadius:"10px"
}}
/>

<br/><br/>

<h2>
{
 item.title
}
</h2>

<p>

Vehicle:
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

Condition:
{
 item.condition
}

</p>

<p>

Category:
{
 item.category
}

</p>

<p>

District:
{
 item.district
 || "Unknown"
}

</p>

<button>
 View Details
</button>

</div>

   );

 })
}

</div>

 )
}

{/* Requirements */}

{
 activeTab==="requirements"
 && (

<div
style={{
 display:"grid",
 gridTemplateColumns:
 "repeat(auto-fill,minmax(280px,1fr))",
 gap:"20px"
}}
>

{
 filteredRequests.map((item)=>{

   return(

<div
key={item.id}
style={{
 border:"1px solid #ccc",
 borderRadius:"10px",
 padding:"15px"
}}
>

<h2>
{
 item.sparePart
}
</h2>

<p>

{
 item.brand
}
{
 " "
}
{
 item.model
}

</p>

<p>

Year:
{
 item.year
}

</p>

<p>

Budget:
₹
{
 item.budget
}

</p>

<p>

Condition:
{
 item.condition
}

</p>

<p>

District:
{
 item.district
 || "Unknown"
}

</p>

<p>
{
 item.description
}
</p>

<button>
 Contact Requester
</button>

</div>

   );

 })
}

</div>

 )
}

</div>

 );

}