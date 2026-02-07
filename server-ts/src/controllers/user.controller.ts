import { SortOrder } from "mongoose";
import {User, UserDocument} from "@models/user.model";
import { UserType } from "../../../../shared/types/user.type"
import { imageStorage } from "@utils/imagestorage";
import {Request, Response} from 'express'
import { IUserData } from "@interfaces/user.interface";
import { userFilterSchema, userSchema } from "@validators/user.validator";
import z from "zod";

class UserController{

    public createUser = async (userData: IUserData)=>{
        try {

            const { username, name, userType, gradYear, degreeType } = userSchema.parse(userData);

            const userPayload:any={
                    name,
                    userType,
                };

            switch (userType){

                case UserType.STUDENT:{

                    const admissionNumber = username.toLowerCase();
                    
                    const user = await User.findOne({
                        "studentDetails.admissionNumber": admissionNumber,
                        userType,
                    });
                    if (user) {
                        return {
                        success: false,
                        error: "User already exists",
                        username,
                        name,
                        };
                    }
                    userPayload.studentDetails = {
                        gradYear,
                        admissionNumber: username.toLowerCase(),
                    };
                    break;
                }
                case UserType.PROFESSOR:{
                    const email = username.toLowerCase();
                    if (!email) {
                        return {
                        success: false,
                        error: "Email is required",
                        username,
                        name,
                        };
                    }
                    const user = await User.findOne({
                        email,
                        userType,
                    });
                    if (user) {
                        return {
                        success: false,
                        error: "User already exists",
                        username,
                        name,
                        };
                    }
                    userPayload.email = email;
                    break;
                }
                case UserType.ALUMNI:{
                    const user = await User.findOne({
                        name,
                        userType,
                    });
                    if (user) {
                        return {
                        success: false,
                        error: "User already exists",
                        username,
                        name,
                        };
                    }
                    userPayload.alumniDetails = {
                        gradYear,
                    };
                    break;
                }
            }
            const result = await new User(userPayload).save();
        
            return {
              success: true,
              user: result,
            };
          } catch (error) {
            console.error("Error creating user:", error);

            if(error instanceof z.ZodError){
                const formattedErrors = error.issues.reduce<Record<string, string>>(
                (acc, issue) => {
                    const field = issue.path[0];
                    if (field) {
                    acc['field'] = issue.message;
                    }
                    return acc;
                },
                {}
                );
                return {
                    success: false,
                    error: formattedErrors,
                    username: userData.username,
                    name: userData.name,
                };
            }
            return {
              success: false,
              error: "Internal server error",
              username: userData.username,
              name: userData.name,
            };
          }
    }

    public getUserById = async (req:Request, res:Response)=>{
        try {
            
            const query = req.params.id ? { _id: req.params.id } : req.body;
        
            // Build the search criteria
            const searchCriteria:any = {}

            if (query._id) {
                searchCriteria._id = query._id;
            } else {
                if (query.name) {
                    // Case insensitive partial match for name
                    searchCriteria.name = { $regex: new RegExp(query.name, "i") };
                }

                if (query.username) {
                    // Case insensitive search for username
                    searchCriteria.username = { $regex: new RegExp(query.username, "i") };
                }

                if (query.email) {
                    // Case insensitive search for email
                    searchCriteria.email = { $regex: new RegExp(query.email, "i") };
                }

                // For student admission number
                if (query.admissionNumber) {
                    searchCriteria["studentDetails.admissionNumber"] = {
                    $regex: new RegExp(query.admissionNumber, "i"),
                    };
                }

                // For graduation year (applies to both students and alumni)
                if (query.gradYear) {
                    searchCriteria.$or = [
                    { "studentDetails.gradYear": query.gradYear },
                    { "alumniDetails.gradYear": query.gradYear },
                    ];
                }
            }
        
            // Find all users matching the search criteria
            const users = await User.find(searchCriteria).lean();
        
            if (!users.length) {
              return res.status(404).json({
                success: false,
                error: "No users found",
              });
            }
        
            // Map users to the desired response format
            const formattedUsers = users.map((user) => ({
              id: user._id,
              name: user.name,
              username: user.username,
              userType: user.userType,
              lastLogin: user.lastLogin,
              status: user.active ? "Active" : "Inactive",
              email: user.email,
              profilePicture: user.profilePicture,
              studentDetails: user?.studentDetails,
              alumniDetails: user?.alumniDetails,
              professorDetails: user?.professorDetails,
            }));
        
            return res.status(200).json({
              success: true,
              count: users.length,
              users: formattedUsers,
            });
          } catch (error) {
            console.error("Error fetching users:", error);
            return res.status(500).json({
              success: false,
              error: "Error fetching users",
              message: error.message,
            });
          }
    }

    public resetUser = async (req: Request, res: Response) => {
      try {
        const userId = req.params.id;
    
        if (!userId) {
          return res.status(400).json({
            success: false,
            error: "User ID is required",
          });
        }
    
        // Find the user
        const user = await User.findById(userId);
    
        if (!user) {
          return res.status(404).json({
            success: false,
            error: "User not found",
          });
        }
    
        // Delete profile picture from Cloudinary if it exists
    
        if (user.profilePicture && user.profilePicture.publicId) {
          await imageStorage.deleteImage(user.profilePicture.publicId);
        }
    
        // Preserve allowed fields
        const preservedFields = {
          name: user.name,
          username: user.username,
          userType: user.userType,
          studentDetails: user.studentDetails?.gradYear
            ? { gradYear: user.studentDetails.gradYear }
            : undefined,
          alumniDetails: user.alumniDetails?.gradYear
            ? { gradYear: user.alumniDetails.gradYear }
            : undefined,
        };
    
        // Reset all other fields to defaults
        user.email = undefined;
        user.password = undefined;
        user.active = false;
        user.professorDetails = undefined;
        user.activationToken = undefined;
        user.activationExpires = undefined;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
    
        // Reset profile picture
        user.profilePicture = {
          url: "",
          publicId: "",
        };
    
        // Restore preserved fields
        Object.assign(user, preservedFields);
    
        await user.save();
    
        return res.status(200).json({
          success: true,
          message: `User ${user.id} reset successfully`,
        });
      } catch (error) {
        console.error("Error resetting user:", error);
        return res.status(500).json({
          success: false,
          error: "Error resetting user",
          message: error.message,
        });
      }
    }

    public getAllUsers = async (req, res) => {
      try {
        // Pagination, filtering and projection for scalability
        const {
          page = 1,
          limit = 100,
          userTypes, // array of UserType values
          search, // free text search for name/email/username/admission no
          gradYear, // filter by graduation year (students/alumni)
          onlyActive, // boolean
          fields, // optional array of field paths to project
          sortBy = "updatedAt",
          sortOrder = "desc",
        } = req.body? userFilterSchema.parse(req.body) : {};
    
        const pageNum = Math.max(page || 1, 1);
        const pageSize = Math.min(Math.max(limit || 100, 1), 5000);
    
        // Build filter
        const filter:any = {};
        if (Array.isArray(userTypes) && userTypes.length > 0) {
          filter.userType = { $in: userTypes };
        }
        if (onlyActive === true) {
          filter.active = true;
        }
        if (gradYear) {
          filter.$or = [
            { "studentDetails.gradYear": gradYear },
            { "alumniDetails.gradYear": gradYear },
          ];
        }
        if (search && typeof search === "string" && search.trim().length > 0) {
          const s = search.trim();
          const regex = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
          filter.$or = [
            ...(filter.$or || []),
            { name: { $regex: regex } },
            { email: { $regex: regex } },
            { username: { $regex: regex } },
            { "studentDetails.admissionNumber": { $regex: regex } },
          ];
        }
    
        // Default projection to keep payload lean
        const defaultProjection = [
          "name",
          "username",
          "userType",
          "email",
          "lastLogin",
          "active",
          "profilePicture.url",
          "studentDetails.gradYear",
          "studentDetails.admissionNumber",
          "alumniDetails.gradYear",
          "professorDetails.position",
        ];
        const projectionList =
          Array.isArray(fields) && fields.length > 0 ? fields : defaultProjection;
        const projection = projectionList.join(" ");
    
        const sort: { [key: string]: SortOrder } = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
    
        // Query with lean() for performance
        const [items, total, counts] = await Promise.all([
          User.find(filter)
            .select(projection)
            .sort(sort)
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize)
            .lean(),
          User.countDocuments(filter),
          User.aggregate([
            { $match: filter },
            { $group: { _id: "$userType", count: { $sum: 1 } } },
          ]),
        ]);
    
        const countsByType = counts.reduce((acc, cur) => {
          acc[cur._id] = cur.count;
          return acc;
        }, {});
    
        // Map users to a normalized lightweight shape
        const users = items.map((u) => ({
          id: u._id.toString(),
          name: u.name,
          username: u.username,
          userType: u.userType,
          email: u.email,
          lastLogin: u.lastLogin,
          status: u.active ? "Active" : "Inactive",
          profilePicture: u.profilePicture?.url
            ? { url: u.profilePicture.url }
            : undefined,
          studentDetails: u.studentDetails
            ? {
                gradYear: u.studentDetails.gradYear,
                admissionNumber: u.studentDetails.admissionNumber,
              }
            : undefined,
          alumniDetails: u.alumniDetails
            ? { gradYear: u.alumniDetails.gradYear }
            : undefined,
          professorDetails: u.professorDetails
            ? { position: u.professorDetails.position }
            : undefined,
        }));
    
        return res.status(200).json({
          success: true,
          page: pageNum,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          countsByType,
          count: users.length,
          users,
        });
      } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
          success: false,
          error: "Error fetching users",
          message: error.message,
        });
      }
    };

    public updateProfileImage = async (userId, profilePicture) => {
        try {
                // userId is required and corresponds to the _id field in the User document
                if (!userId) {
                    throw new Error("userId is required");
                }

                // profilePicture is required
                if (!profilePicture) {
                    throw new Error("profilePicture is required");
                }

                // Use findOneAndUpdate with a _id query to avoid relying on a non-existent userId field in the schema
                const updatedUser = await User.findOneAndUpdate(
                    { _id: userId },
                    { profilePicture },
                    { new: true, runValidators: true }
                );

                if (!updatedUser) {
                throw new Error("User not found");
                }

            } catch (error) {
                console.error("Error updating profile image:", error);
                throw error;
            }
    };

    public verifyUserDetails = async (
      userType: UserType,
      email: string,
      name: string,
      admissionNumber: string
    ) => {
      let user:Partial<UserDocument>;
    
      if (userType === UserType.STUDENT) {
        user = await User.findOne({
          "studentDetails.admissionNumber": admissionNumber
            ? admissionNumber.toLowerCase()
            : "",
          userType,
          name,
        }).lean();
      } else if (userType === UserType.PROFESSOR) {
        user = await User.findOne({
          email: email,
          userType,
        }).lean();
      } else if (userType === UserType.ALUMNI) {
        user = await User.findOne({
          "alumniDetails.gradYear": admissionNumber,
          name,
          userType,
        }).lean();
      }
    
    
      if (!user) {
        const error:any = new Error("User not found. Please check your details.");
        error.statusCode = 404;
        throw error;
      }
    
      if (user.active === true) {
        const error:any = new Error("User already verified. Please login.");
        error.statusCode = 400;
        throw error;
      }
    
      return user;
    };
    
}

export default new UserController();
