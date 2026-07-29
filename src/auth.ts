import NextAuth,{DefaultSession} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {loginValidation} from "./validations/login";
import bcrypt from "bcryptjs";
import {UserRoll} from "./types/user-roll";

declare module "next-auth" {
  interface User {
    roll?: UserRoll;
  }
  interface Session {
    user: {
      id: string;
      roll: UserRoll;
    } & DefaultSession["user"];
  }
}

export const {handlers,auth,signIn,signOut}= NextAuth({
    session:{
        strategy:"jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    providers:[
    Credentials({
        name:"Credentials",
        credentials:{
            email:{label:"Email",type:"email",placeholder:"abc@college.edu.in or abc@gmail.com"},
            password:{label:"Password",type:"password"}
        },
        async authorize(credentials) {
            const parsed = loginValidation.safeParse(credentials);
            if(!parsed.success)return null;
            const {email,password} = parsed.data;
            //const user = await prisma.user.findUnique({where:{email:email}});
            //if(!user)return null;
            const hashedPassword = await bcrypt.hash("user123", 10);
            const user = { id: "1", email: "user@example.com", password: hashedPassword ,roll:"Student" as UserRoll};
            const isValidPassword = await bcrypt.compare(password,user.password);
            if(!isValidPassword)return null;
            return {id:user.id,email:user.email,roll:user.roll};
        }
    }),
    ],

    pages:{
        signIn:"/login",
    },

    callbacks:{
        async jwt({token,user}){
            if(user){
                token.id = user.id;
                token.roll = user.roll;
            }
            return token;
        },
        async session({session,token}){
            if(token && session.user){
                session.user.id = token.id as string;
                session.user.roll = token.roll as UserRoll;
            }
            return session;
        }
    },
    secret:process.env.NEXTAUTH_SECRET,
});

