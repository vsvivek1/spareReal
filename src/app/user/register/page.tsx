"use client";

import {
 useEffect,
 useState
} from "react";

import {
 useRouter
} from "next/navigation";

import {
 useAuth
} from "@/contexts/AuthContext";

import {
 getUserProfile,
 saveUserProfile
} from "@/services/userService";

export default function RegisterPage(){

 const router =
 useRouter();

 const {
   user,
   loading
 } = useAuth();

 const [checking,
 setChecking] =
 useState(true);

 const [saving,
 setSaving] =
 useState(false);

 const [name,
 setName] =
 useState("");

 const [phone,
 setPhone] =
 useState("");

 const [email,
 setEmail] =
 useState("");

 const [district,
 setDistrict] =
 useState("");

 const [place,
 setPlace] =
 useState("");

 const [role,
 setRole] =
 useState("Buyer");

 // Check auth + existing profile
 useEffect(()=>{

   const initialize =
   async()=>{

     // Wait auth loading
     if(loading){

       return;

     }

     // Not logged in
     if(!user){

       router.push(
         "/login"
       );

       return;

     }

     // Auto set phone
     setPhone(
       user.phoneNumber || ""
     );

     // Check existing profile
     const existingProfile =
     await getUserProfile(
       user.uid
     );

     // Already registered
     if(existingProfile){

       router.push("/");

       return;

     }

     setChecking(false);

   };

   initialize();

 },[
   user,
   loading,
   router
 ]);

 const handleRegister =
 async()=>{

   try{

     if(!user){

       alert(
         "User not found"
       );

       return;

     }

     if(!name){

       alert(
         "Enter name"
       );

       return;

     }

     setSaving(true);

     await saveUserProfile(
       user.uid,
       {

         uid:
         user.uid,

         name,

         phone,

         email,

         district,

         place,

         role,

         isPremium:false,

         createdAt:
         new Date()
         .toISOString()

       }
     );

     alert(
       "Registration completed"
     );

     router.push("/");

   }catch(error){

     console.log(error);

     alert(
       "Registration failed"
     );

   }finally{

     setSaving(false);

   }

 };

 // Auth loading
 if(loading){

   return(
<h1>
 Loading...
</h1>
   );

 }

 // Checking profile
 if(checking){

   return(
<h1>
 Checking registration...
</h1>
   );

 }

 return(

<div
style={{
 padding:"30px",
 maxWidth:"500px"
}}
>

<h1>
 Create Profile
</h1>

<br/>

<input
placeholder="Name"
value={name}
onChange={(e)=>
setName(
 e.target.value
)}
/>

<br/><br/>

<input
placeholder="Phone"
value={phone}
disabled
/>

<br/><br/>

<input
placeholder="Email"
value={email}
onChange={(e)=>
setEmail(
 e.target.value
)}
/>

<br/><br/>

<input
placeholder="District"
value={district}
onChange={(e)=>
setDistrict(
 e.target.value
)}
/>

<br/><br/>

<input
placeholder="Place"
value={place}
onChange={(e)=>
setPlace(
 e.target.value
)}
/>

<br/><br/>

<select
value={role}
onChange={(e)=>
setRole(
 e.target.value
)}
>

<option>
 Buyer
</option>

<option>
 Seller
</option>

<option>
 Workshop
</option>

</select>

<br/><br/>

<button
onClick={
 handleRegister
}
disabled={
 saving
}
>

{
 saving
 ? "Saving..."
 : "Complete Registration"
}

</button>

</div>

 );

}