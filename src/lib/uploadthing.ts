//https://docs.uploadthing.com/getting-started/appdir#create-a-next-js-api-route-using-the-file-router

import { AppFileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<AppFileRouter>();
