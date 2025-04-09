"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { Query, Document } from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { IImage } from "../database/models/image.model";

interface AddImageParams {
  image: {
    title: string;
    transformationType: string;
    publicId: string;
    secureURL: string;
    width: number;
    height: number;
    config: string;
    transformationUrl: string;
    aspectRatio?: string;
    color?: string;
    prompt?: string;
  };
  userId: string;
  path: string;
}

interface UpdateImageParams {
  image: {
    _id: string;
    title: string;
    transformationType: string;
    publicId: string;
    secureURL: string;
    width: number;
    height: number;
    config: string;
    transformationUrl: string;
    aspectRatio?: string;
    color?: string;
    prompt?: string;
  };
  userId: string;
  path: string;
}

interface CloudinaryResource {
  public_id: string;
  [key: string]: unknown;
}

type PopulatableImageQuery<T> = Query<T, Document<unknown, object, IImage> & IImage>;



const populateUser = <T>(query: PopulatableImageQuery<T>): PopulatableImageQuery<T> =>
  query.populate({
    path: "author",
    model: "User",
    select: "_id firstName lastName clerkId",
  });

// ADD IMAGE
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);
    if (!author) throw new Error("User not found");

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
  }
}

// UPDATE IMAGE
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id);
    if (!imageToUpdate || imageToUpdate.author.toString() !== userId) {
      throw new Error("Unauthorized or image not found");
    }

    const updatedImage = await Image.findByIdAndUpdate(image._id, image, {
      new: true,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error);
  }
}

// DELETE IMAGE
export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase();
    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    handleError(error);
  } finally {
    redirect("/");
  }
}

// GET IMAGE
export async function getImageById(imageId: string) {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));
    if (!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
  }
}

// GET IMAGES
export async function getAllImages({ limit = 9, page = 1, searchQuery = '' }: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    await connectToDatabase();

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const skipAmount = (page - 1) * limit;

    let query = {};

    if (searchQuery) {
      // Cloudinary search expression using Google Vision tags
      const expression = `folder=alter AND tags=${searchQuery}`;

      const { resources } = await cloudinary.search
        .expression(expression)
        .execute();

      const resourceIds = resources.map(
        (resource: CloudinaryResource) => resource.public_id
      );

      // MongoDB query combining Cloudinary auto-tagging and DB title search
      query = {
        $or: [
          { publicId: { $in: resourceIds } },
          { title: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }

    const images = await populateUser(
      Image.find(query)
        .sort({ updatedAt: -1 })
        .skip(skipAmount)
        .limit(limit)
    );

    const totalImages = await Image.countDocuments(query);
    const savedImages = await Image.countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error);
  }
}



// GET IMAGES BY USER
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connectToDatabase();

    const skipAmount = (page - 1) * limit;

    const images = await populateUser(
      Image.find({ author: userId })
        .sort({ updatedAt: -1 })
        .skip(skipAmount)
        .limit(limit)
    );

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
