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

 const [error,
 setError] =
 useState("");

 const [name,
 setName] =
 useState("");

 const [phone,
 setPhone] =
 useState("");

 const [district,
 setDistrict] =
 useState("");

 const [place,
 setPlace] =
 useState("");

 const [location,
 setLocation] =
 useState<{ lat:number; lng:number } | null>(null);

 const [locating,
 setLocating] =
 useState(false);

 const [locationError,
 setLocationError] =
 useState("");

 const handleUseLocation =
 ()=>{

   setLocationError("");

   if(
     typeof navigator === "undefined" ||
     !navigator.geolocation
   ){

     setLocationError(
       "Location isn't supported on this device."
     );

     return;

   }

   setLocating(true);

   navigator.geolocation.getCurrentPosition(

     (position)=>{

       setLocation({

         lat:
         position.coords.latitude,

         lng:
         position.coords.longitude

       });

       setLocating(false);

     },

     (geoError)=>{

       setLocationError(

         geoError.code === geoError.PERMISSION_DENIED
         ? "Location permission denied. You can still register without it."
         : "Couldn't get your location. Please try again."

       );

       setLocating(false);

     },

     {
       enableHighAccuracy:true,
       timeout:10000
     }

   );

 };

 const [roles,
 setRoles] =
 useState<string[]>(["Buyer"]);

 const toggleRole =
 (option:string)=>{

   setRoles((prev)=>

     prev.includes(option)
     ? prev.filter(
       (item)=>item!==option
     )
     : [...prev, option]

   );

 };

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

   setError("");

   if(!user){

     setError(
       "User not found. Please verify your phone again."
     );

     return;

   }

   if(!name.trim()){

     setError(
       "Enter your name."
     );

     return;

   }

   if(!phone.trim()){

     setError(
       "Enter your phone number."
     );

     return;

   }

   if(roles.length === 0){

     setError(
       "Select at least one option for \"I am a\"."
     );

     return;

   }

   try{

     setSaving(true);

     await saveUserProfile(
       user.uid,
       {

         uid:
         user.uid,

         name,

         phone,

         district,

         place,

         location,

         roles,

         isPremium:false,

         createdAt:
         new Date()
         .toISOString()

       }
     );

     router.push("/");

   }catch(error){

     console.error("Registration failed:", error);

     const code =
       (error as { code?: string })?.code || "";

     if(code === "permission-denied"){

       setError(
         "We couldn't save your profile due to a permissions issue on our end. Please contact support — your account is verified, so you won't need to redo the phone step."
       );

     }else{

       setError(
         error instanceof Error
         ? `${error.message}${code ? ` (${code})` : ""}`
         : "Registration failed. Please try again."
       );

     }

   }finally{

     setSaving(false);

   }

 };

 // Auth loading
 if(loading || checking){

   return(

<div className="gx-shell">
<div className="gx-card">
<p className="gx-muted">Loading...</p>
</div>
</div>

   );

 }

 return(

<div className="gx-shell">

<div className="gx-card">

<div className="gx-badge">S</div>

<h1 className="gx-title">Create your profile</h1>

<p className="gx-subtitle">
Tell us a bit about you to finish setting up your profile.
</p>

{
 error && (
<div className="gx-alert gx-alert-error">
{error}
</div>
 )
}

<div className="gx-field">
<label className="gx-label">Name</label>
<input
className="gx-input"
placeholder="Full name"
value={name}
onChange={(e)=>
setName(
 e.target.value
)}
/>
</div>

<div className="gx-field">
<label className="gx-label">Phone</label>
<input
className="gx-input"
placeholder="9496010722"
value={phone}
disabled={!!user?.phoneNumber}
onChange={(e)=>
setPhone(
 e.target.value
)}
/>
</div>

<div className="gx-field">
<label className="gx-label">District</label>
<input
className="gx-input"
placeholder="District"
value={district}
onChange={(e)=>
setDistrict(
 e.target.value
)}
/>
</div>

<div className="gx-field">
<label className="gx-label">Place</label>
<input
className="gx-input"
placeholder="Place"
value={place}
onChange={(e)=>
setPlace(
 e.target.value
)}
/>
</div>

<div className="gx-field">
<label className="gx-label">Location</label>

<button
type="button"
className="gx-btn gx-btn-outline"
onClick={handleUseLocation}
disabled={locating}
>
{locating && <span className="gx-spinner" />}
{
 locating
 ? "Getting location..."
 : location
 ? "📍 Location captured — tap to refresh"
 : "📍 Use my current location"
}
</button>

{
 location && (
<p className="gx-location-hint">
Saved: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
</p>
 )
}

{
 locationError && (
<p className="gx-location-hint gx-location-hint-error">
{locationError}
</p>
 )
}
</div>

<div className="gx-field">
<label className="gx-label">Registered as (select all that apply)</label>
<div className="gx-role-group">

{["Buyer", "Seller", "Workshop", "Wholesale Dealer"].map((option)=>(

<button
key={option}
type="button"
className={
 "gx-role-option" +
 (roles.includes(option)
   ? " gx-role-option-active"
   : "")
}
onClick={()=>toggleRole(option)}
>
{option}
</button>

))}

</div>
</div>

<button
type="button"
className="gx-btn gx-btn-primary"
onClick={
 handleRegister
}
disabled={
 saving
}
>

{saving && <span className="gx-spinner" />}
{
 saving
 ? "Saving..."
 : "Complete registration"
}

</button>

</div>

</div>

 );

}
