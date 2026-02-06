import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { Strategy as LocalStrategy } from "passport-local";
import { User, IBaseUser } from "@models/user.model";
import dotenv from "dotenv";

dotenv.config();