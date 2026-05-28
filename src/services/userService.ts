import {
 collection,
 doc,
 getDoc,
 getDocs,
 query,
 setDoc,
 updateDoc,
 where
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export const normalizePhone =
(phone:string)=>{

 let value =
 phone.replace(/\D/g,"");

 // Remove country code
 if(
   value.startsWith("91") &&
   value.length===12
 ){

   value =
   value.slice(2);

 }

 // Remove leading zero
 if(
   value.startsWith("0") &&
   value.length===11
 ){

   value =
   value.slice(1);

 }

 return value;

};

export const getUserProfile =
async(uid:string)=>{

 try{

   const ref =
   doc(
     db,
     "users",
     uid
   );

   const snapshot =
   await getDoc(ref);

   if(snapshot.exists()){

     return snapshot.data();

   }

   return null;

 }catch(error){

   console.log(error);

   return null;

 }

};

export const saveUserProfile =
async(
 uid:string,
 data:any
)=>{

 try{

   const ref =
   doc(
     db,
     "users",
     uid
   );

   await setDoc(
     ref,
     {
       ...data,

       normalizedPhone:
       normalizePhone(
         data.phone
       )
     }
   );

 }catch(error){

   console.log(error);

 }

};

export const updateUserProfile =
async(
 uid:string,
 data:any
)=>{

 try{

   const ref =
   doc(
     db,
     "users",
     uid
   );

   await updateDoc(
     ref,
     {
       ...data,

       normalizedPhone:
       normalizePhone(
         data.phone
       )
     }
   );

 }catch(error){

   console.log(error);

 }

};

export const getUserByPhone =
async(phone:string)=>{

 try{

   const normalizedPhone =
   normalizePhone(phone);

   const q =
   query(
     collection(
       db,
       "users"
     ),

     where(
       "normalizedPhone",
       "==",
       normalizedPhone
     )
   );

   const snapshot =
   await getDocs(q);

   if(snapshot.empty){

     return null;

   }

   return {

     id:
     snapshot.docs[0].id,

     ...snapshot.docs[0].data()

   };

 }catch(error){

   console.log(error);

   return null;

 }

};