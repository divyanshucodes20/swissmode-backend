import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import config from "../constants.js";

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (path) => {
  try {
    if (!path) return null;
    return await cloudinary.uploader.upload(path, {
      resource_type: "auto",
    });
  } catch (error) {
    fs.unlinkSync(path);
    return null;
  }
};
const deleteFromCloudinary = async (publicIds) => {
  const promises = publicIds.map((id) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(id, (error, result) => {
        if (error) return reject(error);
        resolve();
      });
    });
  });

  await Promise.all(promises);
};

export { uploadOnCloudinary ,deleteFromCloudinary};
