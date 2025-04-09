"use client";

import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { dataUrl, getImageSize } from "@/lib/utils";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";

type MediaUploaderProps = {
  onValueChange: (value: string) => void;
  setImage: React.Dispatch<unknown>;
  image: ImageData;
  publicId: string | null;
  type: string;
};

const MediaUploader = ({
  onValueChange,
  setImage,
  image,
  publicId,
  type,
}: MediaUploaderProps) => {
  const onUploadSuccessHandler = (result: unknown) => {
    const uploadResult = result as {
      info: {
        public_id: string;
        width: number;
        height: number;
        secure_url: string;
      };
    };
    setImage((prevState: Transformations | null) => ({
      ...(prevState ?? {}),
      publicId: uploadResult.info.public_id,
      width: uploadResult.info.width,
      height: uploadResult.info.height,
      secureURL: uploadResult.info.secure_url,
    }));

    onValueChange(uploadResult?.info?.public_id);
    toast.success("Image uploaded successfully.", {
      description: "'1' credit deducted",
      classNames: {
        toast: "bg-green-100 border-green-500 text-green-900",
        description: "text-green-800 text-sm",
        title: "font-semibold text-green-900",
      },
    });
  };
  const onUploadErrorHandler = () => {
    toast.error("Upload Failed", {
      description: "Something went wrong. Please try again.",
      classNames: {
        toast: "bg-red-100 border-red-500 text-red-900",
        description: "text-red-800 text-sm",
        title: "font-semibold text-red-900",
      },
    });
  };
  return (
    <>
      <CldUploadWidget
        uploadPreset="aswin_alter"
        options={{
          multiple: false,
          resourceType: "image",
        }}
        onSuccess={onUploadSuccessHandler}
        onError={onUploadErrorHandler}
      >
        {({ open }) => {
          return (
            <div className="flex flex-col gap-4 ">
              <h3 className="h3-bold text-dark-600">Orginal</h3>
              {publicId ? (
                <>
                  <div className="cursor-pointer overflow-hidden rounded-[10px]">
                    <CldImage
                      width={getImageSize(type, image, "width")}
                      height={getImageSize(type, image, "height")}
                      src={publicId}
                      alt="image"
                      sizes="(max-width: 767px) 100vw, 50vw"
                      placeholder={dataUrl as PlaceholderValue}
                      className="media-uploader_cldImage"
                    />
                  </div>
                </>
              ) : (
                <div className="media-uploader_cta " onClick={() => open()}>
                  <div className="media-uploader_cta-image ">
                    <Image
                      src="/assets/icons/add.svg"
                      alt="Add Image"
                      width={24}
                      height={24}
                    />
                  </div>
                  <p className="p-14-medium">Click here to upload image</p>
                </div>
              )}
            </div>
          );
        }}
      </CldUploadWidget>
      <Toaster />
    </>
  );
};

export default MediaUploader;
