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

let storyItems = [];
let storyPageCurrent = 1;

let heroVideoItems = [];
let heroVideoPageCurrent = 1;

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
  loadAdminStories();
  loadAdminHeroVideos();
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

await addDoc(collection(db, "heroVideos"), {
  videoUrl: data.secure_url,
  createdAt: serverTimestamp()
});

alert("Video arşive eklendi");

loadAdminHeroVideos();
});

$("saveStoryBtn")?.addEventListener("click", async () => {
  await addDoc(collection(db, "stories"), {
    storyTitle: $("storyTitleInput")?.value || "",
    storyText: $("storyTextInput")?.value || "",
    createdAt: serverTimestamp()
  });

  alert("Hikaye listeye eklendi");
  loadAdminStories();
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
      <div class="relative bg-white/70 rounded-3xl overflow-hidden shadow-lg border border-rose-100 group">
        <img 
          src="${item.imageUrl}" 
          class="admin-gallery-img w-full h-40 object-cover cursor-pointer"
          alt="${item.title || "Galeri fotoğrafı"}"
        >

        <div class="p-4">
          <h3 class="font-bold text-rose-600 text-lg mb-3">
            ${item.title || "Başlıksız"}
          </h3>

          <button 
            class="deleteGalleryBtn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold"
            data-id="${item.id}"
          >
            Sil
          </button>
        </div>
      </div>
    `;
  });

  const totalPages = Math.ceil(galleryItems.length / pageSize) || 1;

  if (info) {
    info.textContent = `${galleryPageCurrent} / ${totalPages}`;
  }

  document.querySelectorAll(".deleteGalleryBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      if (!confirm("Bu fotoğraf silinsin mi?")) return;

      await deleteDoc(doc(db, "gallery", id));

      alert("Fotoğraf silindi");

      loadAdminGallery();
    });
  });


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
let adminHoverTimer = null;

document.addEventListener("mouseover", (e) => {
  const img = e.target.closest(".admin-gallery-img");
  if (!img) return;

  clearTimeout(adminHoverTimer);

  adminHoverTimer = setTimeout(() => {
    let preview = document.getElementById("adminPhotoPreview");

    if (!preview) {
      preview = document.createElement("div");
      preview.id = "adminPhotoPreview";
      preview.innerHTML = `
        <div class="admin-photo-preview-box">
          <img id="adminPhotoPreviewImg" src="">
        </div>
      `;
      document.body.appendChild(preview);
    }

    document.getElementById("adminPhotoPreviewImg").src = img.src;
    preview.classList.add("active");
  }, 1000);
});

document.addEventListener("mouseout", (e) => {
  const img = e.target.closest(".admin-gallery-img");
  if (!img) return;

  clearTimeout(adminHoverTimer);

  const preview = document.getElementById("adminPhotoPreview");
  const previewImg = document.getElementById("adminPhotoPreviewImg");

  if (preview) preview.classList.remove("active");
  if (previewImg) previewImg.src = "";
});



async function loadAdminStories() {
  const list = $("storyAdminList");
  if (!list) return;

  const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  storyItems = [];

  snapshot.forEach((docSnap) => {
    storyItems.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderStoryPage();
}

function renderStoryPage() {
  const list = $("storyAdminList");
  const info = $("storyPageInfo");

  if (!list) return;

  const start = (storyPageCurrent - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = storyItems.slice(start, end);

  list.innerHTML = "";

  pageItems.forEach((item) => {
    list.innerHTML += `
      <div class="bg-white/70 rounded-3xl shadow-lg border border-rose-100 p-4">
        <h3 class="font-bold text-rose-600 text-lg mb-2">
          ${item.storyTitle || "Başlıksız"}
        </h3>

        <p class="text-sm text-rose-900/80 line-clamp-5 mb-4">
          ${item.storyText || ""}
        </p>

        <button
          class="selectStoryBtn bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-bold"
          data-id="${item.id}"
        >
          Seç / Yayınla
        </button>
      </div>
    `;
  });

  const totalPages = Math.ceil(storyItems.length / pageSize) || 1;

  if (info) {
    info.textContent = `${storyPageCurrent} / ${totalPages}`;
  }

  document.querySelectorAll(".selectStoryBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const selected = storyItems.find((x) => x.id === btn.dataset.id);

      if (!selected) return;

      await setDoc(
        doc(db, "siteSettings", "main"),
        {
          storyTitle: selected.storyTitle || "",
          storyText: selected.storyText || ""
        },
        { merge: true }
      );

      alert("Bu hikaye ana sitede yayınlandı");
    });
  });
}

$("storyPrevBtn")?.addEventListener("click", () => {
  if (storyPageCurrent > 1) {
    storyPageCurrent--;
    renderStoryPage();
  }
});

$("storyNextBtn")?.addEventListener("click", () => {
  const totalPages = Math.ceil(storyItems.length / pageSize) || 1;

  if (storyPageCurrent < totalPages) {
    storyPageCurrent++;
    renderStoryPage();
  }
});
async function loadAdminHeroVideos() {

  const list = $("heroVideoAdminList");

  if (!list) return;

  const q = query(
    collection(db, "heroVideos"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  heroVideoItems = [];

  snapshot.forEach((docSnap) => {

    heroVideoItems.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderHeroVideoPage();
}

function renderHeroVideoPage() {

  const list = $("heroVideoAdminList");
  const info = $("heroVideoPageInfo");

  if (!list) return;

  const start =
    (heroVideoPageCurrent - 1) * pageSize;

  const end =
    start + pageSize;

  const pageItems =
    heroVideoItems.slice(start, end);

  list.innerHTML = "";

  pageItems.forEach((item) => {

    list.innerHTML += `
      <div class="bg-white/70 rounded-3xl overflow-hidden shadow-lg border border-rose-100 p-3">

        <video
          src="${item.videoUrl}"
          class="w-full h-40 object-cover rounded-2xl mb-3"
          muted
        ></video>

        <button
          class="selectHeroVideoBtn bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-bold w-full mb-2"
          data-url="${item.videoUrl}"
        >
          Seç / Yayınla
        </button>

        <button
          class="deleteHeroVideoBtn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold w-full"
          data-id="${item.id}"
        >
          Sil
        </button>

      </div>
    `;
  });

  const totalPages =
    Math.ceil(heroVideoItems.length / pageSize) || 1;

  if (info) {
    info.textContent =
      `${heroVideoPageCurrent} / ${totalPages}`;
  }

  document.querySelectorAll(".selectHeroVideoBtn").forEach((btn) => {

    btn.addEventListener("click", async () => {

      await setDoc(
        doc(db, "siteSettings", "main"),
        {
          heroVideo: btn.dataset.url
        },
        { merge: true }
      );

      alert("Video yayınlandı");
    });
  });

  document.querySelectorAll(".deleteHeroVideoBtn").forEach((btn) => {

    btn.addEventListener("click", async () => {

      if (!confirm("Video silinsin mi?")) return;

      await deleteDoc(
        doc(db, "heroVideos", btn.dataset.id)
      );

      alert("Video silindi");

      loadAdminHeroVideos();
    });
  });
}

$("heroVideoPrevBtn")?.addEventListener("click", () => {

  if (heroVideoPageCurrent > 1) {

    heroVideoPageCurrent--;

    renderHeroVideoPage();
  }
});

$("heroVideoNextBtn")?.addEventListener("click", () => {

  const totalPages =
    Math.ceil(heroVideoItems.length / pageSize) || 1;

  if (heroVideoPageCurrent < totalPages) {

    heroVideoPageCurrent++;

    renderHeroVideoPage();
  }
});
let videoHoverTimer = null;

document.addEventListener("mouseover", (e) => {
  const video = e.target.closest(".admin-video-preview");
  if (!video) return;

  clearTimeout(videoHoverTimer);

  videoHoverTimer = setTimeout(() => {
    openAdminVideoModal(video.dataset.url);
  }, 1000);
});

document.addEventListener("mouseout", (e) => {
  const video = e.target.closest(".admin-video-preview");
  if (!video) return;

  clearTimeout(videoHoverTimer);
});

document.addEventListener("click", (e) => {
  const video = e.target.closest(".admin-video-preview");
  if (!video) return;

  openAdminVideoModal(video.dataset.url);
});

function openAdminVideoModal(url) {
  let modal = document.getElementById("adminVideoModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "adminVideoModal";
    modal.innerHTML = `
      <div class="admin-video-modal-box">
        <button id="adminVideoModalClose">×</button>
        <video id="adminVideoModalPlayer" controls autoplay playsinline></video>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("adminVideoModalClose").addEventListener("click", closeAdminVideoModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeAdminVideoModal();
    });
  }

  const player = document.getElementById("adminVideoModalPlayer");
  player.src = url;
  modal.classList.add("active");
}

function closeAdminVideoModal() {
  const modal = document.getElementById("adminVideoModal");
  const player = document.getElementById("adminVideoModalPlayer");

  if (player) {
    player.pause();
    player.src = "";
  }

  if (modal) {
    modal.classList.remove("active");
  }
}
