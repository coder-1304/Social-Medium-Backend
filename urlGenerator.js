const { Storage } = require("@google-cloud/storage");

const generateUrl = async (imageName) => {
  const storage = new Storage({
    keyFilename: "/etc/secrets/admin.json",
  });

  const bucket = storage.bucket("images-node-js.appspot.com"); // Replace with your storage bucket name
  const imagePath = `images/${imageName}`; // Specify the path to your image

  const imageFile = bucket.file(imagePath);

  try {
    const results = await imageFile.getSignedUrl({
      action: "read",
      expires: "01-01-2099", // Set an expiration date far in the future or as needed
    });
    const url = results[0];
    return url;
  } catch (error) {
    console.error("Error getting image URL:", error);
    throw error; // Propagate the error if needed
  }
};

module.exports = generateUrl;
