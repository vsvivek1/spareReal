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

 const [username,
 setUsername] =
 useState("");

 const [password,
 setPassword] =
 useState("");

 const [confirmPassword,
 setConfirmPassword] =
 useState("");

 const [showPassword,
 setShowPassword] =
 useState(false);

 const [showConfirmPassword,
 setShowConfirmPassword] =
 useState(false);

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

   if(roles.length === 0){

     setError(
       "Select at least one option for \"I am a\"."
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
<div className="gx-input-group">
<input
className="gx-input"
type={showPassword ? "text" : "password"}
placeholder="At least 6 characters"
value={password}
autoComplete="new-password"
onChange={(e)=>
setPassword(
 e.target.value
)}
/>
<button
type="button"
className="gx-input-icon-btn"
onClick={() => setShowPassword((v) => !v)}
aria-label={showPassword ? "Hide password" : "Show password"}
>
{showPassword ? "🙈" : "👁"}
</button>
</div>
</div>

<div className="gx-field">
<label className="gx-label">Confirm password</label>
<div className="gx-input-group">
<input
className="gx-input"
type={showConfirmPassword ? "text" : "password"}
placeholder="••••••••"
value={confirmPassword}
autoComplete="new-password"
onChange={(e)=>
setConfirmPassword(
 e.target.value
)}
/>
<button
type="button"
className="gx-input-icon-btn"
onClick={() => setShowConfirmPassword((v) => !v)}
aria-label={showConfirmPassword ? "Hide password" : "Show password"}
>
{showConfirmPassword ? "🙈" : "👁"}
</button>
</div>
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
<label className="gx-label">I am a (select all that apply)</label>
<div className="gx-role-group">

{["Buyer", "Seller", "Workshop"].map((option)=>(

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
