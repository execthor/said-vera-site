import { auth, db } from "./firebase.js";;

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

const loginBox = document.getElementById("loginBox");
const adminBox = document.getElementById("adminBox");

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert("Giriş başarısız: " + error.message);
  }
});

onAuthStateChanged(auth, (user) => {
  loginBox.style.display = user ? "none" : "block";
  adminBox.style.display = user ? "block" : "none";
});

document.getElementById("uploadHeroVideoBtn").addEventListener("click", async () => {
  const file = document.getElementById("heroVideoFile").files[0];

  if (!file) {
    alert("Video seç");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "saidvera");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dosgbutzh/video/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();

  await setDoc(doc(db, "siteSettings", "main"), {
    heroVideo: data.secure_url
  }, { merge: true });

  alert("Video yüklendi ve ana video değiştirildi");
});

document.getElementById("saveStoryBtn").addEventListener("click", async () => {
  const storyTitle = document.getElementById("storyTitleInput").value;
  const storyText = document.getElementById("storyTextInput").value;

  await setDoc(doc(db, "siteSettings", "main"), {
    storyTitle,
    storyText
  }, { merge: true });

  alert("Hikaye kaydedildi");
});

document.getElementById("uploadPhotoBtn").addEventListener("click", async () => {
  const file = document.getElementById("photoFile").files[0];
  const title = document.getElementById("photoTitle").value;

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

  await addDoc(collection(db, "gallery"), {
    title,
    imageUrl: data.secure_url,
    createdAt: serverTimestamp()
  });

  alert("Fotoğraf yüklendi");
});

document.getElementById("addDateBtn").addEventListener("click", async () => {
  const title = document.getElementById("dateTitle").value;
  const date = document.getElementById("dateValue").value;
  const text = document.getElementById("dateText").value;

  await addDoc(collection(db, "dates"), {
    title,
    date,
    text,
    createdAt: serverTimestamp()
  });

  alert("Tarih eklendi");
});

document.getElementById("addPlanBtn").addEventListener("click", async () => {
  const title = document.getElementById("planTitle").value;
  const text = document.getElementById("planText").value;

  await addDoc(collection(db, "plans"), {
    title,
    text,
    done: false,
    createdAt: serverTimestamp()
  });

  alert("Plan eklendi");
});

document.getElementById("addMusicBtn").addEventListener("click", async () => {
  const title = document.getElementById("musicTitle").value;
  const artist = document.getElementById("musicArtist").value;
  const url = document.getElementById("musicUrl").value;

  await addDoc(collection(db, "musicList"), {
    title,
    artist,
    url,
    createdAt: serverTimestamp()
  });

  alert("Müzik eklendi");
});

document.getElementById("saveSecretBtn").addEventListener("click", async () => {
  const secretMessage = document.getElementById("secretMessageInput").value;

  await setDoc(doc(db, "siteSettings", "main"), {
    secretMessage
  }, { merge: true });

  alert("Gizli mesaj kaydedildi");
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
});
document.getElementById("uploadHeroVideoBtn").addEventListener("click", async () => {
  console.log("Video yükle butonuna basıldı");

  const fileInput = document.getElementById("heroVideoFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Lütfen video seç");
    return;
  }

  alert("Video yükleniyor, lütfen bekle...");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "saidvera");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dosgbutzh/video/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();

  console.log("Cloudinary cevabı:", data);

  if (!data.secure_url) {
    alert("Video yüklenemedi. Console ekranına bak.");
    return;
  }

  await setDoc(doc(db, "siteSettings", "main"), {
    heroVideo: data.secure_url
  }, { merge: true });

  alert("Video başarıyla yüklendi ve kaydedildi");
});
