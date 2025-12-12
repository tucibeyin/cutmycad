import { AuthService } from "../services/AuthService.js";

export default function Header() {
    // 1. Kullanıcı giriş yapmış mı kontrol et
    const isLoggedIn = AuthService.isAuthenticated();
    const username = localStorage.getItem("username") || "Kullanıcı";

    // 2. Dropdown menüyü açıp kapatan küçük fonksiyon (Global scope'a ekliyoruz)
    window.toggleUserMenu = function () {
        const menu = document.getElementById('user-dropdown');
        if (menu) menu.classList.toggle('hidden');
    }

    // 3. Çıkış Yapma Fonksiyonu
    window.handleLogout = function () {
        AuthService.logout();
        // Dropdown'ı kapat
        document.getElementById('user-dropdown').classList.add('hidden');
    }

    // --- HTML ÇIKTISI ---
    return `
        <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    
                    <div class="flex-shrink-0 flex items-center cursor-pointer" onclick="window.location.hash='/'">
                        <i class="fa-solid fa-layer-group text-primary text-2xl mr-2"></i>
                        <span class="font-bold text-xl tracking-tight text-gray-900">CutMyCad</span>
                    </div>
                    
                    <nav class="hidden md:flex space-x-8">
                        <a href="#/" class="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Ana Sayfa</a>
                        <a href="#/" onclick="document.querySelector('[data-target=\'cnc-panel\']').click()" class="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Hizmetler</a>
                        ${isLoggedIn ? '<a href="#/dashboard" class="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Siparişlerim</a>' : ''}
                    </nav>

                    <div class="flex items-center space-x-4">
                        
                        ${!isLoggedIn ?
                            /* --- GİRİŞ YAPMAMIŞSA GÖSTERİLECEK --- */ `
                            <a href="#/login" class="text-gray-600 hover:text-primary font-medium text-sm">Giriş Yap</a>
                            <a href="#/register" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 shadow-md">
                                Fiyat Al
                            </a>
                            `
            :
                            /* --- GİRİŞ YAPMIŞSA GÖSTERİLECEK (User Menu) --- */ `
                            <div class="relative ml-3">
                                <div>
                                    <button onclick="toggleUserMenu()" type="button" class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                                        <span class="sr-only">Kullanıcı menüsünü aç</span>
                                        <div class="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                            ${username.charAt(0).toUpperCase()}
                                        </div>
                                        <span class="ml-3 text-gray-700 font-medium hidden md:block">${username} <i class="fa-solid fa-chevron-down text-xs ml-1 text-gray-400"></i></span>
                                    </button>
                                </div>

                                <div id="user-dropdown" class="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in-down" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabindex="-1">
                                    <div class="px-4 py-2 border-b border-gray-100">
                                        <p class="text-sm text-gray-500">Oturum açıldı</p>
                                        <p class="text-sm font-medium text-gray-900 truncate">${username}</p>
                                    </div>
                                    <a href="#/dashboard" onclick="toggleUserMenu()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem"><i class="fa-solid fa-gauge mr-2 text-gray-400"></i> Panelim</a>
                                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem"><i class="fa-solid fa-gear mr-2 text-gray-400"></i> Ayarlar</a>
                                    <a href="#" onclick="handleLogout()" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50" role="menuitem"><i class="fa-solid fa-right-from-bracket mr-2 text-red-400"></i> Çıkış Yap</a>
                                </div>
                            </div>
                            `
        }

                    </div>
                </div>
            </div>
        </header>
    `;
}