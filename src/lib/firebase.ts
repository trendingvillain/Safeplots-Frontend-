export interface UploadProgress {
  progress: number;
  url?: string;
  error?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Core upload logic (Cloudflare R2 via backend)
 */
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${API_URL}/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress?.({ progress });
      }
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);

        if (xhr.status === 200) {
          onProgress?.({ progress: 100, url: response.url });
          resolve(response.url);
        } else {
          onProgress?.({ progress: 0, error: response.error });
          reject(response.error);
        }
      } catch (err) {
        reject(err);
      }
    };

    xhr.onerror = () => {
      onProgress?.({ progress: 0, error: "Upload failed" });
      reject("Upload failed");
    };

    xhr.send(formData);
  });
};

/**
 * Upload seller verification documents
 */
export const uploadSellerDocument = async (
  file: File,
  documentType: string,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  const extension = file.name.split(".").pop();

  const path = `sellers/${userId}/documents/${documentType}_${Date.now()}.${extension}`;

  return uploadFile(file, path, onProgress);
};

/**
 * Upload property media
 */
export const uploadPropertyMedia = async (
  files: File[],
  propertyId: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const extension = file.name.split(".").pop();

    const path = `properties/${propertyId}/${Date.now()}_${index}.${extension}`;

    return uploadFile(file, path, (p) => {
      onProgress?.(index, p);
    });
  });

  return Promise.all(uploadPromises);
};
