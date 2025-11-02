import mongoose from "mongoose";
import { RoleType } from "../../../../shared/types/user.type.js";

const MemberRoleAssignmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    roleType: {
      type: String,
      enum: [
        RoleType.LIFETIME_MEMBER,
        RoleType.ANNUAL_MEMBER,
        RoleType.SECRETARY,
      ],
      required: [true, "Role type is required"],
    },
    membershipKey: {
      type: String,
      required: [true, "Membership key is required"],
      trim: true,
      // Examples: "2016", "2015-16", "2020"
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries by roleType and membershipKey
MemberRoleAssignmentSchema.index({ roleType: 1, membershipKey: 1 });

// Unique index to prevent duplicate assignments
MemberRoleAssignmentSchema.index(
  { user: 1, roleType: 1, membershipKey: 1 },
  { unique: true }
);

// Index for user lookups
MemberRoleAssignmentSchema.index({ user: 1 });

export default mongoose.model(
  "MemberRoleAssignment",
  MemberRoleAssignmentSchema
);
