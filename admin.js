```js
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

let dateItems = [];
let datePageCurrent = 1;

const loginBox = $("loginBox");
const adminBox = $("adminBox");

/* LOGIN */
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
    loadAdminDates();
  }
});

/* SAYFA GEÇİŞ */
document.querySelectorAll("[data-page]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.page;

    document.querySelectorAll(".admin-page").forEach((page) => {
      page.classList.add("hidden");
    });

    document.getElementById(target)?.classList.remove("hidden");

    document.querySelectorAll(".menu-btn").forEach((b) => {
      b.classList.remove("active-menu");
    });

    btn.classList.add("active-menu");
  });
});

/* VİDEO YÜKLE */
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

/* HİKAYE EKLE */
$("saveStoryBtn")?.addEventListener("click", async () => {
  await addDoc(collection(db, "stories"), {
    storyTitle: $("storyTitleInput")?.value || "",
    storyText: $("storyTextInput")?.value || "",
    createdAt: serverTimestamp()
  });

  alert("Hikaye listeye eklendi");
  loadAdminStories();
});

/* FOTOĞRAF YÜKLE */
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

/* TARİH EKLE */
$("addDateBtn")?.addEventListener("click", async () => {
  await addDoc(collection(db, "dates"), {
    title: $("dateTitle")?.value || "",
    date: $("dateValue")?.value || "",
    text: $("dateText")?.value || "",
    createdAt: serverTimestamp()
  });

  alert("Tarih eklendi");
  loadAdminDates();
});

/* PLAN EKLE */
$("addPlanBtn")?.addEventListener("click", async () => {
  await addDoc(collection(db, "plans"), {
    title: $("planTitle")?.value || "",
    text: $("planText")?.value || "",
    type: $("planType")?.value || "near",
    done: false,
    createdAt: serverTimestamp()
  });

  alert("Plan eklendi");
});

/* SPOTIFY PLAYLIST */
$("saveSpotifyPlaylistBtn")?.addEventListener("click", async () => {
  const url = $("spotifyPlaylistUrl")?.value || "";

  if (!url.includes("open.spotify.com/playlist/")) {
    alert("Geçerli Spotify playlist linki gir");
    return;
  }

  await setDoc(
    doc(db, "siteSettings", "main"),
    {
      spotifyPlaylistUrl: url
    },
    { merge: true }
  );

  alert("Spotify playlist linki kaydedildi");
});

/* GİZLİ MESAJ */
$("saveSecretBtn")?.addEventListener("click", async () => {
  await setDoc(
    doc(db, "siteSettings", "main"),
    { secretMessage: $("secretMessageInput")?.value || "" },
    { merge: true }
  );

  alert("Gizli mesaj kaydedildi");
});

/* ÇIKIŞ */
$("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
});

/* GALERİ LİSTE */
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
  if (info) info.textContent = `${galleryPageCurrent} / ${totalPages}`;

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

/* FOTOĞRAF HOVER */
let adminHoverTimer = null;

document.addEventListener("mouseover", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  const img = target.closest(".admin-gallery-img");

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
  const target = e.target;

  if (!(target instanceof Element)) return;

  const img = target.closest(".admin-gallery-img");

  if (!img) return;

  clearTimeout(adminHoverTimer);

  const preview = document.getElementById("adminPhotoPreview");
  const previewImg = document.getElementById("adminPhotoPreviewImg");

  if (preview) preview.classList.remove("active");
  if (previewImg) previewImg.src = "";
});

/* HİKAYE LİSTE */
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
  if (info) info.textContent = `${storyPageCurrent} / ${totalPages}`;

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

/* VİDEO LİSTE */
async function loadAdminHeroVideos() {
  const list = $("heroVideoAdminList");
  if (!list) return;

  const q = query(collection(db, "heroVideos"), orderBy("createdAt", "desc"));
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

  const start = (heroVideoPageCurrent - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = heroVideoItems.slice(start, end);

  list.innerHTML = "";

  pageItems.forEach((item) => {
    list.innerHTML += `
      <div 
        class="admin-video-card bg-white/70 rounded-3xl overflow-hidden shadow-lg border border-rose-100 p-3"
        data-url="${item.videoUrl}"
      >
        <video
          src="${item.videoUrl}"
          class="admin-video-preview w-full h-40 object-cover rounded-2xl mb-3 cursor-pointer"
          muted
          playsinline
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

  const totalPages = Math.ceil(heroVideoItems.length / pageSize) || 1;
  if (info) info.textContent = `${heroVideoPageCurrent} / ${totalPages}`;

  document.querySelectorAll(".selectHeroVideoBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await setDoc(
        doc(db, "siteSettings", "main"),
        { heroVideo: btn.dataset.url },
        { merge: true }
      );

      alert("Video yayınlandı");
    });
  });

  document.querySelectorAll(".deleteHeroVideoBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Video silinsin mi?")) return;

      await deleteDoc(doc(db, "heroVideos", btn.dataset.id));

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
  const totalPages = Math.ceil(heroVideoItems.length / pageSize) || 1;

  if (heroVideoPageCurrent < totalPages) {
    heroVideoPageCurrent++;
    renderHeroVideoPage();
  }
});

/* VİDEO HOVER VE MODAL */
let videoHoverTimer = null;

document.addEventListener("mouseenter", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  const card = target.closest(".admin-video-card");

  if (!card) return;

  clearTimeout(videoHoverTimer);

  videoHoverTimer = setTimeout(() => {
    const video = card.querySelector("video");
    if (!video) return;

    video.currentTime = 0;
    video.muted = true;
    video.play().catch(() => {});
  }, 500);
}, true);

document.addEventListener("mouseleave", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  const card = target.closest(".admin-video-card");

  if (!card) return;

  clearTimeout(videoHoverTimer);

  const video = card.querySelector("video");
  if (!video) return;

  video.pause();
  video.currentTime = 0;
}, true);

document.addEventListener("click", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  if (target.closest("button")) return;

  const card = target.closest(".admin-video-card");

  if (!card) return;

  openAdminVideoModal(card.dataset.url);
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

    document
      .getElementById("adminVideoModalClose")
      .addEventListener("click", closeAdminVideoModal);

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

/* ÖNEMLİ TARİHLER */
function formatDateTRAdmin(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

async function loadAdminDates() {
  const list = $("datesAdminList");
  if (!list) return;

  const q = query(collection(db, "dates"), orderBy("date", "asc"));
  const snapshot = await getDocs(q);

  dateItems = [];

  snapshot.forEach((docSnap) => {
    dateItems.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderDatePage();
}

function renderDatePage() {
  const list = $("datesAdminList");
  const info = $("datesPageInfo");

  if (!list) return;

  const start = (datePageCurrent - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = dateItems.slice(start, end);

  list.innerHTML = "";

  pageItems.forEach((item) => {
    list.innerHTML += `
      <div class="date-admin-card">
        <h3>${formatDateTRAdmin(item.date)}</h3>
        <h4>${item.title || "Başlıksız"}</h4>
        <p>${item.text || ""}</p>

        <button
          class="deleteDateBtn"
          data-id="${item.id}"
        >
          Sil
        </button>
      </div>
    `;
  });

  const totalPages = Math.ceil(dateItems.length / pageSize) || 1;

  if (info) {
    info.textContent = `${datePageCurrent} / ${totalPages}`;
  }

  document.querySelectorAll(".deleteDateBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Bu tarih silinsin mi?")) return;

      await deleteDoc(doc(db, "dates", btn.dataset.id));

      alert("Tarih silindi");
      loadAdminDates();
    });
  });
}

$("datesPrevBtn")?.addEventListener("click", () => {
  if (datePageCurrent > 1) {
    datePageCurrent--;
    renderDatePage();
  }
});

$("datesNextBtn")?.addEventListener("click", () => {
  const totalPages = Math.ceil(dateItems.length / pageSize) || 1;

  if (datePageCurrent < totalPages) {
    datePageCurrent++;
    renderDatePage();
  }
});
```
