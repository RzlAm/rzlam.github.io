// Data Proyek
const projects = [
  {
    title: "Project 1",
    description: "Deskripsi singkat project 1.",
    image: "https://via.placeholder.com/300",
    demoLink: "https://example.com/demo1",
    repoLink: "https://github.com/user/repo1",
  },
  {
    title: "Project 2",
    description: "Deskripsi singkat project 2.",
    image: "https://via.placeholder.com/300",
    demoLink: "https://example.com/demo2",
    repoLink: "https://github.com/user/repo2",
  },
  // Tambahkan lebih banyak projek di sini
];

// Fungsi untuk menambahkan proyek ke halaman
function loadProjects() {
  const projectContainer = document.getElementById("project-cards");
  projectContainer.innerHTML = "";

  projects.forEach((project) => {
    const card = `
            <div class="col-md-4">
                <div class="card shadow-sm">
                    <img src="${project.image}" class="card-img-top" alt="${project.title}">
                    <div class="card-body">
                        <h5 class="card-title">${project.title}</h5>
                        <p class="card-text">${project.description}</p>
                        <a href="${project.demoLink}" class="btn btn-primary" target="_blank">Lihat Demo</a>
                        <a href="${project.repoLink}" class="btn btn-secondary" target="_blank">Lihat Repo</a>
                    </div>
                </div>
            </div>
        `;
    projectContainer.innerHTML += card;
  });
}

// Fungsi untuk mengubah mode gelap
function toggleDarkMode() {
  const body = document.body;
  const navbar = document.querySelector(".navbar");
  const footer = document.querySelector("footer");
  const darkModeButton = document.getElementById("darkModeToggle");

  body.classList.toggle("dark-mode");
  navbar.classList.toggle("dark-mode");
  footer.classList.toggle("dark-mode");

  // Menyimpan preferensi mode gelap ke localStorage
  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
    darkModeButton.textContent = "☀️"; // Ubah ikon tombol ke matahari
  } else {
    localStorage.setItem("darkMode", "disabled");
    darkModeButton.textContent = "🌙"; // Ubah ikon tombol ke bulan
  }
}

// Mengecek preferensi dark mode saat halaman dimuat
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
  document.querySelector(".navbar").classList.add("dark-mode");
  document.querySelector("footer").classList.add("dark-mode");
  document.getElementById("darkModeToggle").textContent = "☀️";
}

// Memuat proyek saat halaman dimuat
document.addEventListener("DOMContentLoaded", loadProjects);
