import { AuthService } from "../services/AuthService.js";

export default function Home() {

    // --- JAVASCRIPT MANTIĞI ---
    setTimeout(() => {
        // Tab Geçişleri
        const tabs = document.querySelectorAll('.service-tab');
        const contents = document.querySelectorAll('.service-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                tabs.forEach(t => {
                    t.classList.remove('bg-primary', 'text-white', 'shadow-lg');
                    t.classList.add('bg-white', 'text-gray-600', 'hover:bg-gray-50');
                });
                this.classList.remove('bg-white', 'text-gray-600', 'hover:bg-gray-50');
                this.classList.add('bg-primary', 'text-white', 'shadow-lg');
                contents.forEach(c => c.classList.add('hidden'));
                const targetId = this.getAttribute('data-target');
                document.getElementById(targetId).classList.remove('hidden');
            });
        });

        // --- DOSYA YÜKLEME MANTIĞI ---
        window.handleFileUpload = async function (inputElement, serviceType) {
            // 1. Kullanıcı giriş yapmış mı?
            if (!AuthService.isAuthenticated()) {
                alert("Dosya yüklemek için lütfen önce giriş yapın.");
                window.location.hash = "/login";
                return;
            }

            const file = inputElement.files[0];
            if (!file) return;

            // 2. Yükleniyor Mesajı Göster
            const label = inputElement.parentElement;
            const originalText = label.innerHTML;
            label.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Yükleniyor...';
            label.classList.add('opacity-75', 'cursor-wait');

            // 3. Dosyayı Gönder (FormData kullanıyoruz)
            const formData = new FormData();
            formData.append('file', file);
            formData.append('service_type', serviceType);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Dosyanız başarıyla yüklendi! Siparişiniz oluşturuldu.");
                    window.location.hash = "/dashboard"; // Başarılıysa panele git
                } else {
                    alert("Hata: " + result.error);
                    label.innerHTML = originalText; // Hatada eski haline dön
                }
            } catch (error) {
                alert("Yükleme sırasında bir hata oluştu.");
                label.innerHTML = originalText;
            }
        };

    }, 0);

    return `
        <div class="bg-gradient-to-b from-gray-50 to-white pb-16">
            <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
                
                <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-4">
                    Endüstriyel Üretim Çözümleri<br>
                    <span class="text-primary">Dosyanı Yükle, Üretime Başla.</span>
                </h1>
                
                <p class="mt-4 text-gray-500 text-lg max-w-2xl mx-auto mb-10">
                    CNC Freze, Lazer Kesim ve 3D Baskı ihtiyaçlarınız için online fiyatlandırma.
                </p>

                <div class="flex flex-wrap justify-center gap-4 mb-10">
                    <button class="service-tab bg-primary text-white shadow-lg px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center" data-target="cnc-panel">
                        <i class="fa-solid fa-gears mr-2"></i> CNC İşleme
                    </button>
                    <button class="service-tab bg-white text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center border border-gray-200" data-target="laser-panel">
                        <i class="fa-solid fa-fire-burner mr-2"></i> Lazer Kesim
                    </button>
                    <button class="service-tab bg-white text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center border border-gray-200" data-target="3d-panel">
                        <i class="fa-solid fa-cube mr-2"></i> 3D Baskı
                    </button>
                </div>

                <div class="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 min-h-[450px]">
                    
                    <div id="cnc-panel" class="service-content p-8 animate-fade-in flex flex-col md:flex-row items-center gap-10">
                        <div class="flex-1 text-left order-2 md:order-1">
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">CNC Frezeleme</h3>
                            <p class="text-gray-500 mb-4">Hassas CNC işleme.</p>
                            <label class="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-xl cursor-pointer transition shadow-lg inline-flex items-center">
                                <i class="fa-solid fa-upload mr-3"></i> CNC Dosyası Yükle
                                <input type="file" class="hidden" onchange="handleFileUpload(this, 'CNC İşleme')">
                            </label>
                        </div>
                        <div class="w-full md:w-1/2 flex justify-center order-1 md:order-2 bg-gray-50 rounded-xl p-4">
                            <lottie-player src="/assets/anim/cnc.json" background="transparent" speed="1" style="width: 300px; height: 300px;" loop autoplay></lottie-player>
                        </div>
                    </div>

                    <div id="laser-panel" class="service-content hidden p-8 animate-fade-in flex flex-col md:flex-row items-center gap-10">
                        <div class="flex-1 text-left order-2 md:order-1">
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">Fiber Lazer Kesim</h3>
                            <p class="text-gray-500 mb-4">Hızlı ve pürüzsüz kesim.</p>
                            <label class="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-xl cursor-pointer transition shadow-lg inline-flex items-center">
                                <i class="fa-solid fa-upload mr-3"></i> DXF Yükle
                                <input type="file" class="hidden" onchange="handleFileUpload(this, 'Lazer Kesim')">
                            </label>
                        </div>
                        <div class="w-full md:w-1/2 flex justify-center order-1 md:order-2 bg-gray-50 rounded-xl p-4">
                            <lottie-player src="/assets/anim/laser.json" background="transparent" speed="1" style="width: 300px; height: 300px;" loop autoplay></lottie-player>
                        </div>
                    </div>

                    <div id="3d-panel" class="service-content hidden p-8 animate-fade-in flex flex-col md:flex-row items-center gap-10">
                        <div class="flex-1 text-left order-2 md:order-1">
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">Endüstriyel 3D Baskı</h3>
                            <p class="text-gray-500 mb-4">FDM ve SLA teknolojileri.</p>
                            <label class="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-xl cursor-pointer transition shadow-lg inline-flex items-center">
                                <i class="fa-solid fa-upload mr-3"></i> STL Yükle
                                <input type="file" class="hidden" onchange="handleFileUpload(this, '3D Baskı')">
                            </label>
                        </div>
                        <div class="w-full md:w-1/2 flex justify-center order-1 md:order-2 bg-gray-50 rounded-xl p-4">
                            <lottie-player src="/assets/anim/3d.json" background="transparent" speed="1" style="width: 300px; height: 300px;" loop autoplay></lottie-player>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;
}