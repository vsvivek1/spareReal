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
 updateUserProfile
} from "@/services/userService";

export default function EditPage(){

 const router =
 useRouter();

 const {
   user
 } = useAuth();

 const [loading,
 setLoading] =
 useState(true);

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

 useEffect(()=>{

   const loadProfile =
   async()=>{

     if(!user) return;

     const data =
     await getUserProfile(
       user.uid
     );

     if(data){

       setName(
         data.name || ""
       );

       setPhone(
         data.phone || ""
       );

       setEmail(
         data.email || ""
       );

       setDistrict(
         data.district || ""
       );

       setPlace(
         data.place || ""
       );

       setRole(
         data.role || "Buyer"
       );

     }

     setLoading(false);

   };

   loadProfile();

 },[user]);

 const handleSave =
 async()=>{

   try{

     if(!user) return;

     await updateUserProfile(
       user.uid,
       {
         name,
         phone,
         email,
         district,
         place,
         role
       }
     );

     alert(
       "Profile updated"
     );

     router.push(
       "/user/profile"
     );

   }catch(error){

     console.log(error);

   }

 };

 if(loading){

   return <h1>Loading...</h1>;

 }

 return(

<div
style={{
 padding:"30px",
 maxWidth:"500px"
}}
>

<h1>
 Edit Profile
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
 handleSave
}
>
 Save Changes
</button>

</div>

 );

}