import { z } from "zod";
export const loginValidation = z.object({
    email: z.email(),
    password: z.string().min(6,"Password should be atleast of 6 characters")
});