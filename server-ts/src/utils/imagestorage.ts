import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config();

export type UploadResult = { url: string , public_id:string } | null;
export type DeleteResult = { deleted: boolean } | null;

export interface IImageStorage {
  uploadImage(localFilePath: string): Promise<UploadResult>;
  deleteImage(publicId: string): Promise<DeleteResult>;
}

abstract class ImageStorage implements IImageStorage {
  abstract uploadImage(localFilePath: string): Promise<UploadResult>;
  abstract deleteImage(publicId: string): Promise<DeleteResult>;
}


class CloudinaryStorage extends ImageStorage {
    
    constructor() {
        super()
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadImage(localFilePath: string): Promise<UploadResult> {

        try {  
        
                if(!localFilePath) return null
        
                const response=await cloudinary.uploader.upload(
                    localFilePath,{
                        resource_type:'auto'
                    }
                )
        
                console.log('file saved on cloudinary ',response.url)
        
                fs.unlinkSync(localFilePath)
                return {url:response.url,public_id:response.public_id}
            } catch (error) {
                fs.unlinkSync(localFilePath)
                return null
            }
    }

    async deleteImage(publicId: string): Promise<DeleteResult> {
        try {
            if(!publicId) return null
            const response=await cloudinary.uploader.destroy(publicId)
            return {deleted:true}
        } catch (error) {
            return null
        }   
    }
}

export const imageStorage = new CloudinaryStorage()