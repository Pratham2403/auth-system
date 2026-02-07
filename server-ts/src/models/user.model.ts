import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserType, DegreeType } from "../../../../shared/types/user.type.js";

export interface IBaseUser {
  name: string;
  username: string;
  email: string;
  password?: string;
  active: boolean;
  userType: UserType;
  provider?: string;
  providerId?: string;
  lastLogin?: Date;
  profilePicture?: {
    url: string;
    publicId: string;
  };
  activationToken?: string;
  activationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  generateActivationToken(): string;
  generateResetPasswordToken(): string;
}

export interface IStudentUser extends IBaseUser {
  userType: UserType.STUDENT;
  studentDetails: {
    gradYear: number;
    admissionNumber: string;
    degree: DegreeType;
  };
}

export interface IProfessorUser extends IBaseUser {
  userType: UserType.PROFESSOR;
  professorDetails: {
    googleScholarLink: string;
    position: string;
  };
}

export interface IAlumniUser extends IBaseUser {
  userType: UserType.ALUMNI;
  alumniDetails: {
    gradYear: number;
    linkedInProfile: string;
  };
}

export interface IAdminUser extends IBaseUser {
  userType: UserType.ADMIN;
}

export type UserDocument =
  | IStudentUser
  | IProfessorUser
  | IAlumniUser
  | IAdminUser;


const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    username: { type: String },
    email: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    password: { type: String, select: false, minlength: 6 },
    active: { type: Boolean, default: false },
    userType: {
      type: String,
      enum: Object.values(UserType),
      required: true,
    },

    studentDetails: {
      gradYear: Number,
      admissionNumber: String,
      degree: {
        type: String,
        enum: Object.values(DegreeType),
      },
    },

    professorDetails: {
      googleScholarLink: String,
      position: String,
    },

    alumniDetails: {
      gradYear: Number,
      linkedInProfile: String,
    },

    activationToken: String,
    activationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    profilePicture: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    provider: {
      type: String,
      enum: ["local", "google", "github", "linkedin"],
      default: "local",
    },
    providerId: String,
    lastLogin: Date,
  },
  { timestamps: true }
);


// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  // Only hash the password if it's modified (or new) and defined
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  // Skip password hashing if using OAuth
  if (this.provider !== "local") {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Schema validation middleware
UserSchema.pre("validate", function (next) {
  if (this.userType === UserType.STUDENT) {
    if (!this.studentDetails?.gradYear) {
      this.invalidate(
        "studentDetails.gradYear",
        "Graduation year is required for students"
      );
    }
    if (this.studentDetails?.admissionNumber) {
      this.studentDetails.admissionNumber =
        this.studentDetails.admissionNumber.toLowerCase();
    }
  }

  if (this.userType === UserType.ALUMNI) {
    if (!this.alumniDetails?.gradYear) {
      this.invalidate(
        "alumniDetails.gradYear",
        "Graduation year is required for alumni"
      );
    }
  }

  next();
});


// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      userType: this.userType,
      username: this.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

// Match user-entered password to hashed password in database (defensive)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // If either value is missing or not a string, don't attempt bcrypt.compare
  if (typeof enteredPassword !== "string" || !enteredPassword) {
    return false;
  }

  const hashed = this.password;
  if (typeof hashed !== "string" || !hashed) {
    // Happens when password isn't selected (select: false) or account has no local password
    return false;
  }

  try {
    return await bcrypt.compare(enteredPassword, hashed);
  } catch (e) {
    // In unlikely event bcrypt throws, treat as non-match
    return false;
  }
};

// Generate activation token
UserSchema.methods.generateActivationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.activationToken = token;
  this.activationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return token;
};

// Generate password reset token
UserSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return resetToken;
};

// Static methods
UserSchema.statics.findByCredentials = async function (username, password) {
  const user = await this.findOne({ username: username.toLowerCase() }).select(
    "+password"
  );

  if (!user) {
    return null;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return null;
  }

  return user;
};

export const User = mongoose.model("User", UserSchema);