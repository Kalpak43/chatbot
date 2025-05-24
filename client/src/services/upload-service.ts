import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, storage } from "@/firebase";

export async function uploadToStorage(file: File) {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("User not authenticated");
      return null;
    }

    const storageRef = ref(storage, `uploads/${user.uid}/${file.name}`);

    const snapshot = await uploadBytes(storageRef, file);

    if (!snapshot.metadata) {
      console.error("Snapshot metadata is null");
      return null;
    }

    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}
