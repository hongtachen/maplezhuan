import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "./config";
import { v4 as uuidv4 } from "uuid";
import { withTimeout } from "@/lib/video/withTimeout";

const VIDEO_UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;

export type UploadVideoResult = {
  videoUrl: string;
  durationSec?: number;
};

export type UploadVideoProgress = (percent: number) => void;

export async function uploadImage(
  file: File,
  path: string = "images",
): Promise<string> {
  const fileExtension = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadMultipleImages(
  files: File[],
  path: string = "images",
): Promise<string[]> {
  return Promise.all(files.map((file) => uploadImage(file, path)));
}

export async function uploadVideo(
  file: File,
  path: string,
  options?: {
    durationSec?: number;
    onProgress?: UploadVideoProgress;
  },
): Promise<UploadVideoResult> {
  const fileExtension = file.name.split(".").pop() || "mp4";
  const fileName = `${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  const uploadWork = async (): Promise<UploadVideoResult> => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type || "video/mp4",
    });

    await new Promise<void>((resolve, reject) => {
      task.on(
        "state_changed",
        (snapshot) => {
          const percent =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          options?.onProgress?.(percent);
        },
        reject,
        () => resolve(),
      );
    });

    const videoUrl = await getDownloadURL(storageRef);
    return { videoUrl, durationSec: options?.durationSec };
  };

  return withTimeout(
    uploadWork(),
    VIDEO_UPLOAD_TIMEOUT_MS,
    "视频上传超时，请稍后重试",
  );
}
