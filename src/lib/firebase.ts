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

export interface UploadProgress {
  progress: number;
  url?: string;
  error?: string;
}

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
 */
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
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
  });
};

/**
 * Uploads seller verification documents using Firebase Auth UID for security.
 */
export const uploadSellerDocument = async (
  file: File,
  documentType: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  await ensureFirebaseAuth();
  
  // Use the Firebase UID instead of passing Supabase ID manually.
  // This allows the Security Rule: "allow write: if request.auth.uid == userId" to pass.
  const firebaseUid = auth.currentUser?.uid;
  if (!firebaseUid) throw new Error("Authentication failed");

  const extension = file.name.split('.').pop();
  const path = `sellers/${firebaseUid}/documents/${documentType}_${Date.now()}.${extension}`;
  
  return uploadFile(file, path, onProgress);
};

/**
 * Properties upload logic
 */
export const uploadPropertyMedia = async (
  files: File[],
  propertyId: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const extension = file.name.split('.').pop();
    // Property media can stay structured by propertyId
    const path = `properties/${propertyId}/${Date.now()}_${index}.${extension}`;
    
    return uploadFile(file, path, (p) => {
      onProgress?.(index, p);
    });
  });

  return Promise.all(uploadPromises);
};