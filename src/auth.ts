import NextAuth,{DefaultSession} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {loginValidation} from "./validations/login";
import bcrypt from "bcryptjs";
import {UserRole} from "./types/user-role";

declare module "next-auth" {
  interface User {
    role?: UserRole;
  }
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

export const {handlers,auth,signIn,signOut}= NextAuth({
    session:{
        strategy:"jwt",
       // maxAge: 30 * 24 * 60 * 60, // 30 days
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

            const{default:prisma} = await import("@/lib/prisma");

            const user = await prisma.user.findUnique({where:{email:email}});
            if(!user)throw new Error("User not found, Please check your email and password or contact the administrator");

            const isValidPassword = await bcrypt.compare(password,user.passwordHash);
            if(!isValidPassword)throw new Error("Wrong Password entered");

            return {id:user.id,email:user.email,role:user.role as UserRole};
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
                token.role = user.role;
                token.name = user.name;
            }
            return token;
        },
        async session({session,token}){
            if(token && session.user){
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
                session.user.name = token.name as string;
            }
            return session;
        }
    },
    secret:process.env.NEXTAUTH_SECRET,
});

