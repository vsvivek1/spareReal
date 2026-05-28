"use client";

import {
 useEffect,
 useState
} from "react";

import Link from "next/link";

import {
 useAuth
} from "@/contexts/AuthContext";

import {
 getUserProfile
} from "@/services/userService";

export default function ProfilePage(){

 const {
   user
 } = useAuth();

 const [profile,
 setProfile] =
 useState<any>(null);

 const [loading,
 setLoading] =
 useState(true);

 useEffect(()=>{

   const loadProfile =
   async()=>{

     if(!user) return;

     const data =
     await getUserProfile(
       user.uid
     );

     setProfile(data);

     setLoading(false);

   };

   loadProfile();

 },[user]);

 if(loading){

   return <h1>Loading...</h1>;

 }

 return(

<div
style={{
 padding:"30px"
}}
>

<h1>
 My Profile
</h1>

<br/>

{
 profile?.profileImage && (

<img
src={
 profile.profileImage
}
width="120"
/>

 )
}

<br/><br/>

<p>

<b>Name:</b>

{
 profile?.name
}

</p>

<p>

<b>Phone:</b>

{
 profile?.phone
}

</p>

<p>

<b>Email:</b>

{
 profile?.email
}

</p>

<p>

<b>District:</b>

{
 profile?.district
}

</p>

<p>

<b>Place:</b>

{
 profile?.place
}

</p>

<p>

<b>Role:</b>

{
 profile?.role
}

</p>

<br/>

<Link href="/user/edit">

<button>
 Edit Profile
</button>

</Link>

</div>

 );

}