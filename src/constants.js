const config = {
  db_name: "swissmode",
  cloudinary_cloud_name:"dmwfyn2op",
};

export const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};

export const jsonOptions = {
  limit: "16kb",
};

export const urlEncodedOptions = {
  extended: true,
  limit: "16kb",
};

export default config;
