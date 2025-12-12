export default function Home() {

    // Sayfa yüklendikten sonra çalışacak Tab (Sekme) mantığı
    setTimeout(() => {
        const tabs = document.querySelectorAll('.service-tab');
        const contents = document.querySelectorAll('.service-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                // 1. Tüm tabların aktiflik renklerini sıfırla (Gri yap)
                tabs.forEach(t => {
                    t.classList.remove('bg-primary', 'text-white', 'shadow-lg');
                    t.classList.add('bg-white', 'text-gray-600', 'hover:bg-gray-50');
                });

                // 2. Tıklanan tabı aktif yap (Mavi yap)
                this.classList.remove('bg-white', 'text-gray-600', 'hover:bg-gray-50');
                this.classList.add('bg-primary', 'text-white', 'shadow-lg');

                // 3. Tüm içerikleri gizle
                contents.forEach(c => c.classList.add('hidden'));

                // 4. İlgili içeriği göster
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
                    Projeniz için en uygun üretim yöntemini aşağıdan seçin ve dosyanızı yükleyin.
                </p>

                <div class="flex flex-wrap justify-center gap-4 mb-10">
                    <button class="service-tab bg-primary text-white shadow-lg px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center" data-target="cnc-panel">
                        <i class="fa-solid fa-gears mr-2"></i> CNC İşleme
                    </button>
                    
                    <button class="service-tab bg-white text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center border border-gray-200" data-target="laser-panel">
                        <i class="fa-solid fa-fire-burner mr-2"></i> Lazer & Büküm
                    </button>
                    
                    <button class="service-tab bg-white text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center border border-gray-200" data-target="3d-panel">
                        <i class="fa-solid fa-cube mr-2"></i> 3D Baskı
                    </button>
                </div>

                <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[300px]">
                    
                    <div id="cnc-panel" class="service-content p-8 animate-fade-in">
                        <div class="flex flex-col md:flex-row items-center gap-8">
                            <div class="flex-1 text-left">
                                <h3 class="text-2xl font-bold text-gray-900 mb-2">CNC Frezeleme ve Tornalama</h3>
                                <p class="text-gray-500 mb-4">
                                    Alüminyum, Çelik, Paslanmaz ve Plastik malzemeler için hassas talaşlı imalat. 
                                    ±0.05mm tolerans ile parçalarınız tam ölçüsünde.
                                </p>
                                <ul class="text-sm text-gray-600 space-y-2 mb-6">
                                    <li><i class="fa-solid fa-check text-green-500 mr-2"></i>3, 4 ve 5 Eksen İşleme</li>
                                    <li><i class="fa-solid fa-check text-green-500 mr-2"></i>Hızlı Prototipleme</li>
                                </ul>
                                <label class="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition inline-block">
                                    <i class="fa-solid fa-upload mr-2"></i> CNC Dosyası Yükle (.step)
                                    <input type="file" class="hidden">
                                </label>
                            </div>
                            <div class="w-full md:w-1/3 bg-gray-100 h-48 rounded-lg flex items-center justify-center text-gray-400">
                                <i class="fa-solid fa-gears text-6xl"></i>
                            </div>
                        </div>
                    </div>

                    <div id="laser-panel" class="service-content hidden p-8 animate-fade-in">
                        <div class="flex flex-col md:flex-row items-center gap-8">
                            <div class="flex-1 text-left">
                                <h3 class="text-2xl font-bold text-gray-900 mb-2">Sac Metal Şekillendirme</h3>
                                <p class="text-gray-500 mb-4">
                                    Lazer kesim, abkant büküm ve kaynak işlemleri. Düşük maliyetli ve hızlı üretim.
                                </p>
                                <ul class="text-sm text-gray-600 space-y-2 mb-6">
                                    <li><i class="fa-solid fa-check text-green-500 mr-2"></i>Fiber Lazer Kesim</li>
                                    <li><i class="fa-solid fa-check text-green-500 mr-2"></i>Siyah Sac, DKP, Paslanmaz</li>
                                </ul>
                                <label class="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition inline-block">
                                    <i class="fa-solid fa-upload mr-2"></i> DXF/DWG Yükle
                                    <input type="file" class="hidden">
                                </label>
                            </div>
                            <div class="w-full md:w-1/3 bg-gray-100 h-48 rounded-lg flex items-center justify-center text-gray-400">
                                <i class="fa-solid fa-fire-burner text-6xl"></i>
                            </div>
                        </div>
                    </div>

                    <div id="3d-panel" class="service-content hidden p-8 animate-fade-in">
                        <div class="flex flex-col md:flex-row items-center gap-8">
                            <div class="flex-1 text-left">
                                <h3 class="text-2xl font-bold text-gray-900 mb-2">Endüstriyel 3D Baskı</h3>
                                <p class="text-gray-500 mb-4">
                                    Karmaşık geometriler için FDM, SLA ve SLS teknolojileri. Fonksiyonel prototipler üretin.
                                </p>
                                <ul class="text-sm text-gray-600 space-y-2 mb-6">
                                    <li><i class="fa-solid fa-check text-green-500 mr-2"></i>PLA, ABS, PETG, Resin</li>
                                    <li><i class="fa-solid fa-check text-green-500 mr-2"></i>24 Saatte Kargo</li>
                                </ul>
                                <label class="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition inline-block">
                                    <i class="fa-solid fa-upload mr-2"></i> STL/OBJ Yükle
                                    <input type="file" class="hidden">
                                </label>
                            </div>
                            <div class="w-full md:w-1/3 bg-gray-100 h-48 rounded-lg flex items-center justify-center text-gray-400">
                                <i class="fa-solid fa-cube text-6xl"></i>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;
}