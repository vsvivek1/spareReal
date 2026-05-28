"use client";

import {
 useState
} from "react";

import imageCompression
from "browser-image-compression";

import {
 ref,
 uploadBytes,
 getDownloadURL
} from "firebase/storage";

import {
 addDoc,
 collection
} from "firebase/firestore";

import {
 storage,
 db
} from "@/lib/firebase";

import {
 useAuth
} from "@/contexts/AuthContext";

export default function AddSparePage(){

 const {
   user
 } = useAuth();

 const [image,
 setImage] =
 useState<File | null>(
   null
 );

 const [imagePreview,
 setImagePreview] =
 useState("");

 const [loading,
 setLoading] =
 useState(false);

 const [title,
 setTitle] =
 useState("");

 const [category,
 setCategory] =
 useState("Engine");

 const [vehicle,
 setVehicle] =
 useState("");

 const [price,
 setPrice] =
 useState("");

 const [description,
 setDescription] =
 useState("");

 const [condition,
 setCondition] =
 useState("Used");

 const handleImage =
 (
   e:any
 )=>{

   const file =
   e.target.files[0];

   if(!file) return;

   setImage(file);

   setImagePreview(
     URL.createObjectURL(file)
   );

 };

 const handleSubmit =
 async()=>{

   try{

     if(!user){

       alert(
         "Login required"
       );

       return;

     }

     if(!image){

       alert(
         "Select image"
       );

       return;

     }

     if(!title){

       alert(
         "Enter title"
       );

       return;

     }

     setLoading(true);

     // Compress image
     const compressedFile =
     await imageCompression(

       image,

       {

         maxSizeMB:1,

         maxWidthOrHeight:1200,

         useWebWorker:true

       }

     );

     // Create file path
     const fileName =
     `spare-images/${
       user.uid
     }_${
       Date.now()
     }.jpg`;

     // Firebase storage ref
     const storageRef =
     ref(
       storage,
       fileName
     );

     // Upload compressed image
     await uploadBytes(
       storageRef,
       compressedFile
     );

     // Get image URL
     const imageUrl =
     await getDownloadURL(
       storageRef
     );

     // Save listing
     await addDoc(

       collection(
         db,
         "spareListings"
       ),

       {

         title,

         category,

         vehicle,

         price,

         description,

         condition,

         imageUrl,

         sellerId:
         user.uid,

         sellerPhone:
         user.phoneNumber,

         createdAt:
         new Date()
         .toISOString()

       }

     );

     alert(
       "Spare added"
     );

     // Reset form
     setTitle("");

     setVehicle("");

     setPrice("");

     setDescription("");

     setCondition("Used");

     setCategory("Engine");

     setImage(null);

     setImagePreview("");

   }catch(error){

     console.log(error);

     alert(
       "Upload failed"
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
 Add Spare Part
</h1>

<br/>

{
 imagePreview && (

<img
src={imagePreview}
style={{
 width:"100%",
 height:"250px",
 objectFit:"cover",
 borderRadius:"10px",
 border:"1px solid #ccc"
}}
/>

 )
}

<br/><br/>

<input
type="file"
accept="image/*"
onChange={handleImage}
/>

<br/><br/>

<input
placeholder="Title"
value={title}
onChange={(e)=>
setTitle(
 e.target.value
)}
style={{
 width:"100%",
 padding:"10px"
}}
/>

<br/><br/>

<select
value={category}
onChange={(e)=>
setCategory(
 e.target.value
)}
style={{
 width:"100%",
 padding:"10px"
}}
>

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
 Oil & Fluids
</option>

<option>
 Accessories
</option>

</select>

<br/><br/>

<input
placeholder="Vehicle"
value={vehicle}
onChange={(e)=>
setVehicle(
 e.target.value
)}
style={{
 width:"100%",
 padding:"10px"
}}
/>

<br/><br/>

<input
placeholder="Price"
value={price}
onChange={(e)=>
setPrice(
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

<option>
 Damaged
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
 ? "Uploading..."
 : "Submit Listing"
}


</button>

</div>

 );

}