import { AuthService } from "../services/AuthService.js";

export default function Dashboard() {
    // Güvenlik Kontrolü: Giriş yapmamışsa Login'e at
    if (!AuthService.isAuthenticated()) {
        window.location.hash = "/login";
        return "";
    }

    const username = localStorage.getItem("username") || "Kullanıcı";

    // Çıkış butonu mantığı
    setTimeout(() => {
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                AuthService.logout();
            }
        }
    }, 0);

    return `
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 class="text-lg leading-6 font-medium text-gray-900">Yönetim Paneli</h3>
                        <p class="mt-1 max-w-2xl text-sm text-gray-500">Hoş geldin, <span class="font-bold text-primary">${username}</span></p>
                    </div>
                    <button id="logoutBtn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition">
                        <i class="fa-solid fa-right-from-bracket mr-2"></i> Çıkış Yap
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                        <dt class="text-sm font-medium text-gray-500 truncate">Bekleyen Siparişler</dt>
                        <dd class="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                    </div>
                </div>
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                        <dt class="text-sm font-medium text-gray-500 truncate">Onaylanan Dosyalar</dt>
                        <dd class="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                    </div>
                </div>
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                        <dt class="text-sm font-medium text-gray-500 truncate">Toplam Kazanç</dt>
                        <dd class="mt-1 text-3xl font-semibold text-gray-900">0 ₺</dd>
                    </div>
                </div>
            </div>
        </div>
    `;
}