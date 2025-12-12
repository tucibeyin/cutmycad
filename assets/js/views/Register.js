export default function Register() {

    // Sayfa yüklendikten sonra çalışacak
    setTimeout(() => {
        const btn = document.getElementById("registerBtn");
        if (btn) {
            btn.onclick = async () => {
                // Form Verilerini Al
                const firstName = document.getElementById("firstName").value;
                const lastName = document.getElementById("lastName").value;
                const phone = document.getElementById("phone").value;
                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;
                const msgBox = document.getElementById("msgBox");

                // Butonu Kilitle
                btn.innerText = "Kaydediliyor...";
                btn.disabled = true;

                try {
                    const response = await fetch('/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            first_name: firstName,
                            last_name: lastName,
                            phone: phone,
                            email: email,
                            password: password
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        alert("Kayıt Başarılı! Giriş sayfasına yönlendiriliyorsunuz.");
                        window.location.hash = "/login";
                    } else {
                        msgBox.innerText = "Hata: " + data.error;
                        msgBox.classList.remove("hidden");
                        btn.innerText = "Kayıt Ol";
                        btn.disabled = false;
                    }
                } catch (error) {
                    alert("Sunucu hatası!");
                }
            };
        }
    }, 0);

    return `
        <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <div>
                    <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">
                        Yeni Hesap Oluştur
                    </h2>
                    <p class="mt-2 text-center text-sm text-gray-600">
                        Hızlı teklif almak için bilgilerinizi girin.
                    </p>
                </div>
                
                <div class="mt-8 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Ad</label>
                            <input id="firstName" type="text" class="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Soyad</label>
                            <input id="lastName" type="text" class="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Telefon</label>
                        <input id="phone" type="text" placeholder="05XX XXX XX XX" class="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">E-Posta Adresi</label>
                        <input id="email" type="email" class="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Şifre</label>
                        <input id="password" type="password" class="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary">
                    </div>

                    <div id="msgBox" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm text-center"></div>

                    <button id="registerBtn" class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 transition">
                        Kayıt Ol
                    </button>

                    <div class="text-center text-sm">
                        Zaten hesabın var mı? <a href="#/login" class="font-medium text-primary hover:text-blue-500">Giriş Yap</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}