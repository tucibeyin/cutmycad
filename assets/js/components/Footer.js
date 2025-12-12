export default function Footer() {
    const year = new Date().getFullYear();

    return `
        <footer class="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800">
            <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    
                    <div class="col-span-1 md:col-span-1">
                        <div class="flex items-center text-white text-xl font-bold mb-4">
                            <i class="fa-solid fa-layer-group text-primary mr-2"></i> CutMyCad
                        </div>
                        <p class="text-sm text-gray-400">
                            CNC, Lazer ve 3D Baskı üretiminde dijital çözüm ortağınız.
                        </p>
                    </div>

                    <div>
                        <h3 class="text-sm font-semibold text-white uppercase mb-4">Menü</h3>
                        <ul class="space-y-2">
                            <li><a href="#/" class="text-sm hover:text-primary">Ana Sayfa</a></li>
                            <li><a href="#/login" class="text-sm hover:text-primary">Giriş Yap</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="text-sm font-semibold text-white uppercase mb-4">Hizmetler</h3>
                        <ul class="space-y-2">
                            <li><span class="text-sm text-gray-400">CNC Frezeleme</span></li>
                            <li><span class="text-sm text-gray-400">Lazer Kesim</span></li>
                            <li><span class="text-sm text-gray-400">3D Baskı</span></li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="text-sm font-semibold text-white uppercase mb-4">İletişim</h3>
                        <ul class="space-y-3">
                            <li class="flex items-center"><i class="fa-solid fa-phone mr-2 text-primary"></i> <span class="text-sm">0850 123 45 67</span></li>
                            <li class="flex items-center"><i class="fa-solid fa-envelope mr-2 text-primary"></i> <span class="text-sm">destek@cutmycad.com</span></li>
                        </ul>
                    </div>
                </div>
                
                <div class="mt-8 border-t border-gray-800 pt-8 text-center">
                    <p class="text-xs text-gray-500">&copy; ${year} CutMyCad Teknoloji. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </footer>
    `;
}