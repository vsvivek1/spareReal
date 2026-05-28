"use client";

import {
 useEffect,
 useState
} from "react";

import {
 collection,
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

export default function MyRequestsPage(){

 const {
   user
 } = useAuth();

 const [requests,
 setRequests] =
 useState<any[]>([]);

 const [loading,
 setLoading] =
 useState(true);

 useEffect(()=>{

   const loadRequests =
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
           "spareRequests"
         ),

         where(
           "requesterId",
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

       setRequests(items);

     }catch(error){

       console.log(error);

     }finally{

       setLoading(false);

     }

   };

   loadRequests();

 },[
   user
 ]);

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
 My Requests
</h1>

<br/>

{
 requests.length===0 && (

<p>
No requests found
</p>

 )
}

<div
style={{
 display:"grid",
 gridTemplateColumns:
 "repeat(auto-fill,minmax(300px,1fr))",
 gap:"20px"
}}
>

{
 requests.map((item)=>{

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

Brand:
{
 item.brand
}

</p>

<p>

Model:
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
{
 item.description
}
</p>

</div>

   );

 })
}

</div>

</div>

 );

}