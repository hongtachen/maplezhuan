import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(
  file: File,
  path: string = "images",
): Promise<string> {
  const fileExtension = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

export async function uploadMultipleImages(
  files: File[],
  path: string = "images",
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file, path));
  return await Promise.all(uploadPromises);
}
