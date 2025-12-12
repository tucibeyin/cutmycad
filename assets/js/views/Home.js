export default function Home() {

    // Tab (Sekme) Mantığı
    setTimeout(() => {
        const tabs = document.querySelectorAll('.service-tab');
        const contents = document.querySelectorAll('.service-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                // Renkleri sıfırla
                tabs.forEach(t => {
                    t.classList.remove('bg-primary', 'text-white', 'shadow-lg');
                    t.classList.add('bg-white', 'text-gray-600', 'hover:bg-gray-50');
                });

                // Aktif olanı boya
                this.classList.remove('bg-white', 'text-gray-600', 'hover:bg-gray-50');
                this.classList.add('bg-primary', 'text-white', 'shadow-lg');

                // İçerikleri değiştir
                contents.forEach(c => c.classList.add('hidden'));
                const targetId = this.getAttribute('data-target');
                document.getElementById(targetId).classList.remove('hidden');
            });
        });
    }, 0);

    return `
        <div class="bg-gradient-to-b from-gray-50 to-white pb-16">
            <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
                
                <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-4">
                    Üretim teknolojisini seç,<br>
                    <span class="text-primary">anında fiyat al.</span>
                </h1>
                
                <p class="mt-4 text-gray-500 text-lg max-w-2xl mx-auto mb-10">
                    Projeniz için en uygun üretim yöntemini aşağıdan seçin, makine simülasyonunu izleyin ve dosyanızı yükleyin.
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

                <div class="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 min-h-[400px]">
                    
                    <div id="cnc-panel" class="service-content p-8 animate-fade-in flex flex-col md:flex-row items-center gap-10">
                        <div class="flex-1 text-left order-2 md:order-1">
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">CNC Frezeleme</h3>
                            <p class="text-gray-500 mb-4">
                                Blok malzemeden talaş kaldırarak üretim. Yüksek hassasiyetli parçalar için robotik kollar ve matkaplar iş başında.
                            </p>
                            <label class="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-xl cursor-pointer transition shadow-lg hover:shadow-xl inline-flex items-center">
                                <i class="fa-solid fa-upload mr-3"></i> CNC Dosyası Yükle (.step)
                                <input type="file" class="hidden">
                            </label>
                        </div>
                        <div class="w-full md:w-1/2 flex justify-center order-1 md:order-2 bg-blue-50 rounded-xl p-4">
                            <lottie-player src="https://assets3.lottiefiles.com/packages/lf20_w51pcehl.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;"  loop  autoplay></lottie-player>
                        </div>
                    </div>

                    <div id="laser-panel" class="service-content hidden p-8 animate-fade-in flex flex-col md:flex-row items-center gap-10">
                        <div class="flex-1 text-left order-2 md:order-1">
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">Lazer Kesim Teknolojisi</h3>
                            <p class="text-gray-500 mb-4">
                                Işık hızında kesim. Sac metallerinizi milimetrik hassasiyetle kesip şekillendiriyoruz.
                            </p>
                            <label class="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-xl cursor-pointer transition shadow-lg hover:shadow-xl inline-flex items-center">
                                <i class="fa-solid fa-upload mr-3"></i> DXF/DWG Yükle
                                <input type="file" class="hidden">
                            </label>
                        </div>
                        <div class="w-full md:w-1/2 flex justify-center order-1 md:order-2 bg-orange-50 rounded-xl p-4">
                             <lottie-player src="https://assets2.lottiefiles.com/packages/lf20_m911a8.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;"  loop  autoplay></lottie-player>
                        </div>
                    </div>

                    <div id="3d-panel" class="service-content hidden p-8 animate-fade-in flex flex-col md:flex-row items-center gap-10">
                        <div class="flex-1 text-left order-2 md:order-1">
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">Katmanlı İmalat (3D Baskı)</h3>
                            <p class="text-gray-500 mb-4">
                                Dijital dosyalarınız katman katman gerçeğe dönüşüyor. Hızlı prototipleme simülasyonu.
                            </p>
                            <label class="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-xl cursor-pointer transition shadow-lg hover:shadow-xl inline-flex items-center">
                                <i class="fa-solid fa-upload mr-3"></i> STL Dosyası Yükle
                                <input type="file" class="hidden">
                            </label>
                        </div>
                        <div class="w-full md:w-1/2 flex justify-center order-1 md:order-2 bg-indigo-50 rounded-xl p-4">
                            <lottie-player src="https://assets8.lottiefiles.com/packages/lf20_accg3lm5.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;"  loop  autoplay></lottie-player>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;
}