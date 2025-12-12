export default function Home() {
    return `
        <div class="bg-white pb-16">
            <div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span class="block">CNC, Lazer ve 3D Baskı</span>
                    <span class="block text-primary">Anında Fiyat Teklifi Alın</span>
                </h1>
                <p class="mt-4 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    CAD dosyalarınızı yükleyin (DXF, DWG, STEP), üretim teknolojisini seçin ve projenizi başlatalım.
                </p>
                
                <div class="mt-10 max-w-xl mx-auto">
                    <div class="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition cursor-pointer bg-gray-50">
                        <div class="space-y-1 text-center">
                            <i class="fa-solid fa-cloud-arrow-up text-4xl text-gray-400"></i>
                            <div class="flex text-sm text-gray-600">
                                <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500 focus-within:outline-none">
                                    <span>Dosya Yükle</span>
                                    <input id="file-upload" name="file-upload" type="file" class="sr-only">
                                </label>
                                <p class="pl-1">veya sürükleyip bırakın</p>
                            </div>
                            <p class="text-xs text-gray-500">
                                .STEP, .DXF, .DWG, .STL (Max 50MB)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-gray-50 py-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div class="p-6 bg-white rounded-lg shadow-sm">
                        <i class="fa-solid fa-gears text-4xl text-primary mb-4"></i>
                        <h3 class="text-lg font-medium text-gray-900">CNC İşleme</h3>
                        <p class="mt-2 text-gray-500 text-sm">Hassas metal ve plastik parçalar için frezeleme ve tornalama.</p>
                    </div>
                    <div class="p-6 bg-white rounded-lg shadow-sm">
                        <i class="fa-solid fa-fire-burner text-4xl text-primary mb-4"></i>
                        <h3 class="text-lg font-medium text-gray-900">Lazer Kesim & Büküm</h3>
                        <p class="mt-2 text-gray-500 text-sm">Sac metal parçalarınız için hızlı kesim ve büküm hizmeti.</p>
                    </div>
                    <div class="p-6 bg-white rounded-lg shadow-sm">
                        <i class="fa-solid fa-cube text-4xl text-primary mb-4"></i>
                        <h3 class="text-lg font-medium text-gray-900">3D Baskı</h3>
                        <p class="mt-2 text-gray-500 text-sm">FDM, SLA ve SLS teknolojileriyle hızlı prototipleme.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}