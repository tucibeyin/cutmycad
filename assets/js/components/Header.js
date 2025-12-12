export default function Header() {
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
                        <a href="#/services" class="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Hizmetler</a>
                        <a href="#/dashboard" class="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Siparişlerim</a>
                    </nav>

                    <div class="flex items-center space-x-4">
                        <a href="#/login" class="text-gray-600 hover:text-primary font-medium text-sm">Giriş Yap</a>
                        <a href="#/register" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150">
                            Fiyat Al
                        </a>
                    </div>
                </div>
            </div>
        </header>
    `;
}