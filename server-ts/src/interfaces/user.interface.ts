import { UserType, DegreeType } from "../../../../shared/types/user.type.js";

export interface IUserData{
    name: string;
    username: string;
    userType: UserType;
    gradYear: number;
    degreeType: DegreeType;
}
