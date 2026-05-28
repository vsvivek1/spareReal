"use client";

import {
 useEffect,
 useState
} from "react";

import {
 collection,
 deleteDoc,
 doc,
 getDocs,
 query,
 where
} from "firebase/firestore";

import {
 db
} from "@/lib/firebase";

import {
 useAuth
} from "@/contexts/AuthContext";

export default function MyListingsPage(){

 const {
   user
 } = useAuth();

 const [listings,
 setListings] =
 useState<any[]>([]);

 const [loading,
 setLoading] =
 useState(true);

 const loadListings =
 async()=>{

   try{

     if(!user){

       setLoading(false);

       return;

     }

     const q =
     query(

       collection(
         db,
         "spareListings"
       ),

       where(
         "sellerId",
         "==",
         user.uid
       )

     );

     const snapshot =
     await getDocs(q);

     const items:any[] =
     [];

     snapshot.forEach((doc)=>{

       items.push({

         id:doc.id,

         ...doc.data()

       });

     });

     setListings(items);

   }catch(error){

     console.log(error);

   }finally{

     setLoading(false);

   }

 };

 useEffect(()=>{

   loadListings();

 },[
   user
 ]);

 const handleDelete =
 async(id:string)=>{

   const confirmDelete =
   confirm(
     "Delete listing?"
   );

   if(!confirmDelete){

     return;

   }

   try{

     await deleteDoc(

       doc(
         db,
         "spareListings",
         id
       )

     );

     alert(
       "Deleted"
     );

     loadListings();

   }catch(error){

     console.log(error);

     alert(
       "Delete failed"
     );

   }

 };

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
 My Listings
</h1>

<br/>

{
 listings.length===0 && (

<p>
No listings found
</p>

 )
}

<div
style={{
 display:"grid",
 gridTemplateColumns:
 "repeat(auto-fill,minmax(280px,1fr))",
 gap:"20px"
}}
>

{
 listings.map((item)=>{

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

Category:
{
 item.category
}

</p>

<p>

Vehicle:
{
 item.vehicle
}

</p>

<p>

Condition:
{
 item.condition
}

</p>

<p>

₹
{
 item.price
}

</p>

<p>
{
 item.description
}
</p>

<br/>

<div
style={{
 display:"flex",
 gap:"10px"
}}
>

<button>
 Edit
</button>

<button
onClick={()=>
handleDelete(
 item.id
)}
>
 Delete
</button>

</div>

</div>

   );

 })
}

</div>

</div>

 );

}