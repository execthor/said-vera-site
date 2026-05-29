import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const pageSize = 25;

let galleryItems = [];
let galleryPageCurrent = 1;

const loginBox = $("loginBox");
const adminBox = $("adminBox");

$("loginBtn")?.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(
      auth,
      $("email")?.value || "",
      $("password")?.value || ""
    );
  } catch (error) {
    alert("Giriş başarısız: " + error.message);
  }
});

onAuthStateChanged(auth, (user) => {
  if (loginBox) loginBox.style.display = user ? "none" : "block";
  if (adminBox) adminBox.style.display = user ? "block" : "none";

  if (user) {
    loadAdminGallery();
  }
});

document.querySelectorAll("[data-page]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.page;

    document.querySelectorAll(".admin-page").forEach((page) => {
      page.classList.add("hidden");
    });

    document.getElementById(target)?.classList.remove("hidden");
  });
});

$("uploadHeroVideoBtn")?.addEventListener("click", async () => {
  const file = $("heroVideoFile")?.files[0];

  if (!file) return alert("Video seç");

  alert("Video yükleniyor...");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "saidvera_video");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dosgbutzh/video/upload",
    { method: "POST", body: formData }
  );

  const data = await response.json();

  if (!data.secure_url) {
    console.log(data);
    return alert("Video yüklenemedi");
  }

  await setDoc(
    doc(db, "siteSettings", "main"),
    { heroVideo: data.secure_url },
    { merge: true }
  );

  alert("Video başarıyla yüklendi");
});

$("saveStoryBtn")?.addEventListener("click", async () => {
  await setDoc(
    doc(db, "siteSettings", "main"),
    {
      storyTitle: $("storyTitleInput")?.value || "",
      storyText: $("storyTextInput")?.value || ""
    },
    { merge: true }
  );

  alert("Hikaye kaydedildi");
});

$("uploadPhotoBtn")?.addEventListener("click", async () => {
  const file = $("photoFile")?.files[0];
  const title = $("photoTitle")?.value || "";

  if (!file) return alert("Fotoğraf seç");

  alert("Fotoğraf yükleniyor...");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "saidvera");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dosgbutzh/image/upload",
    { method: "POST", body: formData }
  );

  const data = await response.json();

  if (!data.secure_url) {
    console.log(data);
    return alert("Fotoğraf yüklenemedi");
  }

  await addDoc(collection(db, "gallery"), {
    title,
    imageUrl: data.secure_url,
    createdAt: serverTimestamp()
  });

  alert("Fotoğraf yüklendi");

  loadAdminGallery();
});

$("addDateBtn")?.addEventListener("click", async () => {
  await addDoc(collection(db, "dates"), {
    title: $("dateTitle")?.value || "",
    date: $("dateValue")?.value || "",
    text: $("dateText")?.value || "",
    createdAt: serverTimestamp()
  });

  alert("Tarih eklendi");
});

$("addPlanBtn")?.addEventListener("click", async () => {
  await addDoc(collection(db, "plans"), {
    title: $("planTitle")?.value || "",
    text: $("planText")?.value || "",
    done: false,
    createdAt: serverTimestamp()
  });

  alert("Plan eklendi");
});

$("addMusicBtn")?.addEventListener("click", async () => {
  await addDoc(collection(db, "musicList"), {
    title: $("musicTitle")?.value || "",
    artist: $("musicArtist")?.value || "",
    url: $("musicUrl")?.value || "",
    createdAt: serverTimestamp()
  });

  alert("Müzik eklendi");
});

$("saveSecretBtn")?.addEventListener("click", async () => {
  await setDoc(
    doc(db, "siteSettings", "main"),
    { secretMessage: $("secretMessageInput")?.value || "" },
    { merge: true }
  );

  alert("Gizli mesaj kaydedildi");
});

$("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
});

async function loadAdminGallery() {
  const list = $("galleryAdminList");
  if (!list) return;

  const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  galleryItems = [];

  snapshot.forEach((docSnap) => {
    galleryItems.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderGalleryPage();
}

function renderGalleryPage() {
  const list = $("galleryAdminList");
  const info = $("galleryPageInfo");

  if (!list) return;

  const start = (galleryPageCurrent - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = galleryItems.slice(start, end);

  list.innerHTML = "";

  pageItems.forEach((item) => {
    list.innerHTML += `
      <div class="bg-white/70 rounded-3xl overflow-hidden shadow-lg border border-rose-100">
        <img src="${item.imageUrl}" class="w-full h-40 object-cover">
        <div class="p-4">
          <h3 class="font-bold text-rose-600 text-lg mb-2">
            ${item.title || "Başlıksız"}
          </h3>
        </div>
      </div>
    `;
  });

  const totalPages = Math.ceil(galleryItems.length / pageSize) || 1;

  if (info) {
    info.textContent = `${galleryPageCurrent} / ${totalPages}`;
  }
}

$("galleryPrevBtn")?.addEventListener("click", () => {
  if (galleryPageCurrent > 1) {
    galleryPageCurrent--;
    renderGalleryPage();
  }
});

$("galleryNextBtn")?.addEventListener("click", () => {
  const totalPages = Math.ceil(galleryItems.length / pageSize) || 1;

  if (galleryPageCurrent < totalPages) {
    galleryPageCurrent++;
    renderGalleryPage();
  }
});
