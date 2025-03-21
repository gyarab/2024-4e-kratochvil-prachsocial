//https://docs.uploadthing.com/getting-started/appdir#create-a-next-js-api-route-using-the-file-router

import { createRouteHandler } from "uploadthing/next";
import { fileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: fileRouter,
});
