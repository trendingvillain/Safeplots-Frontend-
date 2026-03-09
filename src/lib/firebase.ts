<<<<<<< HEAD
=======
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  getAuth, 
  signInAnonymously, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

>>>>>>> 31fd67e1781374933d1ae85adc3b67b2b2f6c224
export interface UploadProgress {
  progress: number;
  url?: string;
  error?: string;
}

<<<<<<< HEAD
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Core upload logic (Cloudflare R2 via backend)
=======
/**
 * Ensures a Firebase session exists.
 */
const ensureFirebaseAuth = async () => {
  if (!auth.currentUser) {
    try {
      // This is crucial for Firebase Security Rules to work
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error("Firebase Auth Error:", error.message);
      throw error;
    }
  }
};

/**
 * Core upload logic
>>>>>>> 31fd67e1781374933d1ae85adc3b67b2b2f6c224
 */
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
<<<<<<< HEAD
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
=======
  await ensureFirebaseAuth();

  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({ progress });
      },
      (error) => {
        onProgress?.({ progress: 0, error: error.message });
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        onProgress?.({ progress: 100, url });
        resolve(url);
      }
    );
>>>>>>> 31fd67e1781374933d1ae85adc3b67b2b2f6c224
  });
};

/**
<<<<<<< HEAD
 * Upload seller verification documents
=======
 * Uploads seller verification documents using Firebase Auth UID for security.
>>>>>>> 31fd67e1781374933d1ae85adc3b67b2b2f6c224
 */
export const uploadSellerDocument = async (
  file: File,
  documentType: string,
<<<<<<< HEAD
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  const extension = file.name.split(".").pop();

  const path = `sellers/${userId}/documents/${documentType}_${Date.now()}.${extension}`;

=======
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  await ensureFirebaseAuth();
  
  // Use the Firebase UID instead of passing Supabase ID manually.
  // This allows the Security Rule: "allow write: if request.auth.uid == userId" to pass.
  const firebaseUid = auth.currentUser?.uid;
  if (!firebaseUid) throw new Error("Authentication failed");

  const extension = file.name.split('.').pop();
  const path = `sellers/${firebaseUid}/documents/${documentType}_${Date.now()}.${extension}`;
  
>>>>>>> 31fd67e1781374933d1ae85adc3b67b2b2f6c224
  return uploadFile(file, path, onProgress);
};

/**
<<<<<<< HEAD
 * Upload property media
=======
 * Properties upload logic
>>>>>>> 31fd67e1781374933d1ae85adc3b67b2b2f6c224
 */
export const uploadPropertyMedia = async (
  files: File[],
  propertyId: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
<<<<<<< HEAD
    const extension = file.name.split(".").pop();

    const path = `properties/${propertyId}/${Date.now()}_${index}.${extension}`;

=======
    const extension = file.name.split('.').pop();
    // Property media can stay structured by propertyId
    const path = `properties/${propertyId}/${Date.now()}_${index}.${extension}`;
    
>>>>>>> 31fd67e1781374933d1ae85adc3b67b2b2f6c224
    return uploadFile(file, path, (p) => {
      onProgress?.(index, p);
    });
  });

  return Promise.all(uploadPromises);
};