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
 saveUserProfile,
 isUsernameTaken,
 normalizeUsername
} from "@/services/userService";

import {
 setAccountPassword
} from "@/services/authService";

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

 const [username,
 setUsername] =
 useState("");

 const [password,
 setPassword] =
 useState("");

 const [confirmPassword,
 setConfirmPassword] =
 useState("");

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

   const normalizedUsername =
   normalizeUsername(username);

   if(
     normalizedUsername.length < 3 ||
     !/^[a-z0-9_.]+$/.test(
       normalizedUsername
     )
   ){

     setError(
       "Username must be at least 3 characters (letters, numbers, . or _ only)."
     );

     return;

   }

   if(password.length < 6){

     setError(
       "Password must be at least 6 characters."
     );

     return;

   }

   if(password !== confirmPassword){

     setError(
       "Passwords don't match."
     );

     return;

   }

   try{

     setSaving(true);

     const taken =
     await isUsernameTaken(
       normalizedUsername
     );

     if(taken){

       setError(
         "That username is already taken."
       );

       setSaving(false);

       return;

     }

     await setAccountPassword(
       phone,
       password
     );

     await saveUserProfile(
       user.uid,
       {

         uid:
         user.uid,

         name,

         phone,

         username:
         normalizedUsername,

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

     router.push("/");

   }catch(error){

     setError(
       error instanceof Error
       ? error.message
       : "Registration failed. Please try again."
     );

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
Phone verified. Set up your login and tell us a bit about you.
</p>

{
 error && (
<div className="gx-alert gx-alert-error">
{error}
</div>
 )
}

<div className="gx-step-label">Account</div>

<div className="gx-field">
<label className="gx-label">Username</label>
<input
className="gx-input"
placeholder="yourusername"
value={username}
autoCapitalize="none"
onChange={(e)=>
setUsername(
 e.target.value
)}
/>
</div>

<div className="gx-field">
<label className="gx-label">Password</label>
<input
className="gx-input"
type="password"
placeholder="At least 6 characters"
value={password}
autoComplete="new-password"
onChange={(e)=>
setPassword(
 e.target.value
)}
/>
</div>

<div className="gx-field">
<label className="gx-label">Confirm password</label>
<input
className="gx-input"
type="password"
placeholder="••••••••"
value={confirmPassword}
autoComplete="new-password"
onChange={(e)=>
setConfirmPassword(
 e.target.value
)}
/>
</div>

<div className="gx-divider">Profile</div>

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
value={phone}
disabled
/>
</div>

<div className="gx-field">
<label className="gx-label">Email</label>
<input
className="gx-input"
placeholder="you@example.com"
value={email}
onChange={(e)=>
setEmail(
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
<label className="gx-label">I am a</label>
<select
className="gx-input"
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
