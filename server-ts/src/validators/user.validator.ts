import z from "zod";
import { DegreeType, UserType } from "../../../../shared/types/user.type";

export const userSchema = z.object({
    name: z.string({error: (input) => input === undefined? "Name is Required!":"Invalid Name Format"}),
    username: z.string({error: (input) => input === undefined?  "Username is Required!":"Invalid Username"}),
    userType: z.enum(UserType, {error: input => input === undefined ? "User type is missing!":"User Type is Invalid!"}),
    gradYear: z.number({error: input =>  typeof input !== "number" ? "Invalid Graduation Year!":""}).optional(),
    degreeType: z.enum(DegreeType, {error: "Invalid Degree Type!"}).optional(),
}).superRefine((data, ctx)=>{


    if(data.userType === UserType.STUDENT){
        if(!data.gradYear && !data.degreeType){
            ctx.addIssue({
                code:"custom",
                message: "Graduation year and degree type are required for students",
            })
        }
    }
    if(data.userType === UserType.PROFESSOR){
        // pass
    }
    if(data.userType === UserType.ALUMNI){
        if(!data.gradYear){
            ctx.addIssue({
                code:"custom",
                message: "Graduation year is required for alumni",
            })
        }
    }
    if(data.userType === UserType.ADMIN){
        // pass   
    }
})

export const userFilterSchema = z.object({
    userTypes: z.array(z.enum(UserType), {error: (issue) => ({message: "Invalid user type"})}).optional(),
    search: z.string().optional(),
    gradYear: z.number({error: (input) => typeof input !== "number" ? "Invalid Graduation Year!":""}).optional(),
    onlyActive: z.boolean().optional(),
    fields: z.array(z.string()).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.number({error: (input) => typeof input !== "number" ? "Invalid Page Number!":""}).optional(),
    limit: z.number({error: (input) => typeof input !== "number" ? "Invalid Limit Number!":""}).optional(),
})
