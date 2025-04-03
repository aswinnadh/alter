
import { type ClassValue, clsx } from "clsx";
import qs from "qs"; // ✅ Ensure type declarations are installed
import { twMerge } from "tailwind-merge";

import { aspectRatioOptions } from "@/constants";

// ✅ Install type declarations for qs
// Run: npm install --save-dev @types/qs

// ✅ UTILITY FUNCTION: Combine Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ ERROR HANDLER

export const handleError = (error: unknown): never => {
  if (error instanceof Error) {
    console.error(error.message);
    throw new Error(`Error: ${error.message}`);
  } else if (typeof error === "string") {
    console.error(error);
    throw new Error(`Error: ${error}`);
  } else {
    console.error(error);
    throw new Error(`Unknown error: ${JSON.stringify(error)}`);
  }
};


// ✅ PLACEHOLDER LOADER - while image is transforming
const shimmer = (w: number, h: number): string => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#7986AC" offset="20%" />
      <stop stop-color="#68769e" offset="50%" />
      <stop stop-color="#7986AC" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#7986AC" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string): string =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export const dataUrl = `data:image/svg+xml;base64,${toBase64(shimmer(1000, 1000))}`;

// ✅ FORM URL QUERY
export const formUrlQuery = ({
  searchParams,
  key,
  value,
}: {
  searchParams: URLSearchParams;
  key: string;
  value: string | null;
}): string => {
  const params = { ...qs.parse(searchParams.toString()), [key]: value };

  return `${window.location.pathname}?${qs.stringify(params, {
    skipNulls: true,
  })}`;
};

// ✅ REMOVE KEY FROM QUERY
export function removeKeysFromQuery({
  searchParams,
  keysToRemove,
}: {
  searchParams: string;
  keysToRemove: string[];
}): string {
  const currentUrl = qs.parse(searchParams);

  keysToRemove.forEach((key) => {
    delete currentUrl[key as keyof typeof currentUrl];
  });

  // Remove null or undefined values
  Object.keys(currentUrl).forEach((key) => {
    if (currentUrl[key as keyof typeof currentUrl] == null) {
      delete currentUrl[key as keyof typeof currentUrl];
    }
  });

  return `${window.location.pathname}?${qs.stringify(currentUrl)}`;
}

// ✅ DEBOUNCE FUNCTION (Using Spread Instead of Apply)
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ✅ GET IMAGE SIZE FUNCTION
export type AspectRatioKey = keyof typeof aspectRatioOptions;
interface ImageData {
  aspectRatio?: AspectRatioKey;
  width?: number;
  height?: number;
}
export const getImageSize = (
  type: string,
  image: ImageData,
  dimension: "width" | "height"
): number => {
  if (type === "fill") {
    return (
      aspectRatioOptions[image.aspectRatio as AspectRatioKey]?.[dimension] || 1000
    );
  }
  return image?.[dimension] ?? 1000;
};

// ✅ DOWNLOAD IMAGE FUNCTION
export const download = (url: string, filename: string): void => {
  if (!url) {
    throw new Error("Resource URL not provided! You need to provide one");
  }

  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobURL;
      a.download = filename.length ? `${filename.replace(/\s/g, "_")}.png` : "download.png";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(blobURL);
      document.body.removeChild(a);
    })
    .catch((error) => handleError(error));
};

// ✅ DEEP MERGE OBJECTS FUNCTION (Fixed Type Issue)
export const deepMergeObjects = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  obj1: T,
  obj2: U
): T & U => {
  if (!obj2) return obj1 as T & U;

  const output: Record<string, unknown> = { ...obj1 };

  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      const value1 = obj1[key as keyof T];
      const value2 = obj2[key as keyof U];

      if (
        typeof value1 === "object" &&
        value1 !== null &&
        typeof value2 === "object" &&
        value2 !== null
      ) {
        // 🔹 Recursively merge nested objects
        output[key] = deepMergeObjects(value1 as Record<string, unknown>, value2 as Record<string, unknown>);
      } else {
        // 🔹 Assign non-object values directly
        output[key] = value2;
      }
    }
  }

  return output as T & U;
};
