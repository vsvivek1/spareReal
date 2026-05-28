"use client";

import {
 useState
} from "react";

import {
 addDoc,
 collection
} from "firebase/firestore";

import {
 db
} from "@/lib/firebase";

import {
 useAuth
} from "@/contexts/AuthContext";

export default function MakeRequestPage(){

 const {
   user
 } = useAuth();

 const [loading,
 setLoading] =
 useState(false);

 const [brand,
 setBrand] =
 useState("");

 const [model,
 setModel] =
 useState("");

 const [year,
 setYear] =
 useState("");

 const [sparePart,
 setSparePart] =
 useState("");

 const [description,
 setDescription] =
 useState("");

 const [budget,
 setBudget] =
 useState("");

 const [condition,
 setCondition] =
 useState("Used");

 const handleSubmit =
 async()=>{

   try{

     if(!user){

       alert(
         "Login required"
       );

       return;

     }

     if(!sparePart){

       alert(
         "Enter spare part"
       );

       return;

     }

     setLoading(true);

     await addDoc(

       collection(
         db,
         "spareRequests"
       ),

       {

         brand,

         model,

         year,

         sparePart,

         description,

         budget,

         condition,

         requesterId:
         user.uid,

         requesterPhone:
         user.phoneNumber,

         createdAt:
         new Date()
         .toISOString()

       }

     );

     alert(
       "Request added"
     );

     setBrand("");

     setModel("");

     setYear("");

     setSparePart("");

     setDescription("");

     setBudget("");

     setCondition("Used");

   }catch(error){

     console.log(error);

     alert(
       "Failed"
     );

   }finally{

     setLoading(false);

   }

 };

 return(

<div
style={{
 padding:"20px",
 maxWidth:"600px"
}}
>

<h1>
 Request Spare Part
</h1>

<br/>

<input
placeholder="Brand"
value={brand}
onChange={(e)=>
setBrand(
 e.target.value
)}
style={{
 width:"100%",
 padding:"10px"
}}
/>

<br/><br/>

<input
placeholder="Model"
value={model}
onChange={(e)=>
setModel(
 e.target.value
)}
style={{
 width:"100%",
 padding:"10px"
}}
/>

<br/><br/>

<input
placeholder="Year"
value={year}
onChange={(e)=>
setYear(
 e.target.value
)}
style={{
 width:"100%",
 padding:"10px"
}}
/>

<br/><br/>

<input
placeholder="Spare Part Needed"
value={sparePart}
onChange={(e)=>
setSparePart(
 e.target.value
)}
style={{
 width:"100%",
 padding:"10px"
}}
/>

<br/><br/>

<input
placeholder="Budget"
value={budget}
onChange={(e)=>
setBudget(
 e.target.value
)}
style={{
 width:"100%",
 padding:"10px"
}}
/>

<br/><br/>

<select
value={condition}
onChange={(e)=>
setCondition(
 e.target.value
)}
style={{
 width:"100%",
 padding:"10px"
}}
>

<option>
 New
</option>

<option>
 Used
</option>

<option>
 Refurbished
</option>

</select>

<br/><br/>

<textarea
placeholder="Description"
value={description}
onChange={(e)=>
setDescription(
 e.target.value
)}
style={{
 width:"100%",
 padding:"10px",
 height:"120px"
}}
/>

<br/><br/>

<button
onClick={
 handleSubmit
}
disabled={
 loading
}
style={{
 padding:"12px 20px"
}}
>

{
 loading
 ? "Submitting..."
 : "Submit Request"
}

</button>

</div>

 );

}