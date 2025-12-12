import { AuthService } from "../services/AuthService.js";

export default function Login() {
    // Sayfa yüklendikten sonra çalışacak (Butona tıklama olayı)
    setTimeout(() => {
        const btn = document.getElementById("loginBtn");

        if (btn) {
            btn.onclick = async () => {
                const userInp = document.getElementById("username").value;
                const passInp = document.getElementById("password").value;
                const msgBox = document.getElementById("msgBox");

                // Butonu pasif yap (Çift tıklamayı önle)
                btn.innerText = "Giriş yapılıyor...";
                btn.disabled = true;

                const result = await AuthService.login(userInp, passInp);

                if (result.success) {
                    // Başarılı! Dashboard'a git
                    window.location.hash = "/dashboard";
                } else {
                    // Hata var! Mesaj göster
                    msgBox.innerText = "Hata: " + result.message;
                    msgBox.classList.remove("hidden");
                    btn.innerText = "Giriş Yap";
                    btn.disabled = false;
                }
            };
        }
    }, 0);

    return `
        <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <div>
                    <i class="fa-solid fa-user-circle text-5xl text-primary mx-auto block text-center mb-4"></i>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Hesabınıza Giriş Yapın
                    </h2>
                    <p class="mt-2 text-center text-sm text-gray-600">
                        Admin paneli ve sipariş yönetimi
                    </p>
                </div>
                
                <div class="mt-8 space-y-6">
                    <div class="rounded-md shadow-sm -space-y-px">
                        <div class="mb-4">
                            <label for="username" class="sr-only">Kullanıcı Adı</label>
                            <input id="username" name="username" type="text" required class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Kullanıcı Adı">
                        </div>
                        <div>
                            <label for="password" class="sr-only">Şifre</label>
                            <input id="password" name="password" type="password" required class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Şifre">
                        </div>
                    </div>

                    <div id="msgBox" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm text-center"></div>

                    <div>
                        <button id="loginBtn" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150">
                            Giriş Yap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}