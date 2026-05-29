import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

const loginBox = $("loginBox");
const adminBox = $("adminBox");

const loginBtn = $("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = $("email")?.value;
    const password = $("password")?.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Giriş başarısız: " + error.message);
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (loginBox) loginBox.style.display = user ? "none" : "block";
  if (adminBox) adminBox.style.display = user ? "block" : "none";
});

const uploadHeroVideoBtn = $("uploadHeroVideoBtn");

if (uploadHeroVideoBtn) {
  uploadHeroVideoBtn.addEventListener("click", async () => {
    const file = $("heroVideoFile")?.files[0];

    if (!file) {
      alert("Video seç");
      return;
    }

    alert("Video yükleniyor...");

    const formData = new FormData();
    formData.append("file", file);
 formData.append("upload_preset", "saidvera_video");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dosgbutzh/video/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    if (!data.secure_url) {
      console.log(data);
      alert("Video yüklenemedi");
      return;
    }

    await setDoc(doc(db, "siteSettings", "main"), {
      heroVideo: data.secure_url
    }, { merge: true });

    alert("Video başarıyla yüklendi");
  });
}

const saveStoryBtn = $("saveStoryBtn");

if (saveStoryBtn) {
  saveStoryBtn.addEventListener("click", async () => {
    await setDoc(doc(db, "siteSettings", "main"), {
      storyTitle: $("storyTitleInput")?.value || "",
      storyText: $("storyTextInput")?.value || ""
    }, { merge: true });

    alert("Hikaye kaydedildi");
  });
}

const uploadPhotoBtn = $("uploadPhotoBtn");

if (uploadPhotoBtn) {
  uploadPhotoBtn.addEventListener("click", async () => {
    const file = $("photoFile")?.files[0];
    const title = $("photoTitle")?.value || "";

    if (!file) {
      alert("Fotoğraf seç");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "saidvera");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dosgbutzh/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    if (!data.secure_url) {
      console.log(data);
      alert("Fotoğraf yüklenemedi");
      return;
    }

    await addDoc(collection(db, "gallery"), {
      title,
      imageUrl: data.secure_url,
      createdAt: serverTimestamp()
    });

    alert("Fotoğraf yüklendi");
  });
}

const addDateBtn = $("addDateBtn");

if (addDateBtn) {
  addDateBtn.addEventListener("click", async () => {
    await addDoc(collection(db, "dates"), {
      title: $("dateTitle")?.value || "",
      date: $("dateValue")?.value || "",
      text: $("dateText")?.value || "",
      createdAt: serverTimestamp()
    });

    alert("Tarih eklendi");
  });
}

const addPlanBtn = $("addPlanBtn");

if (addPlanBtn) {
  addPlanBtn.addEventListener("click", async () => {
    await addDoc(collection(db, "plans"), {
      title: $("planTitle")?.value || "",
      text: $("planText")?.value || "",
      done: false,
      createdAt: serverTimestamp()
    });

    alert("Plan eklendi");
  });
}

const addMusicBtn = $("addMusicBtn");

if (addMusicBtn) {
  addMusicBtn.addEventListener("click", async () => {
    await addDoc(collection(db, "musicList"), {
      title: $("musicTitle")?.value || "",
      artist: $("musicArtist")?.value || "",
      url: $("musicUrl")?.value || "",
      createdAt: serverTimestamp()
    });

    alert("Müzik eklendi");
  });
}

const saveSecretBtn = $("saveSecretBtn");

if (saveSecretBtn) {
  saveSecretBtn.addEventListener("click", async () => {
    await setDoc(doc(db, "siteSettings", "main"), {
      secretMessage: $("secretMessageInput")?.value || ""
    }, { merge: true });

    alert("Gizli mesaj kaydedildi");
  });
}

const logoutBtn = $("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
  });
}
