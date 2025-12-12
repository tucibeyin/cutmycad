import { AuthService } from "../services/AuthService.js";

export default function Dashboard() {
    if (!AuthService.isAuthenticated()) {
        window.location.hash = "/login";
        return "";
    }

    const username = localStorage.getItem("username") || "Admin";

    // Siparişleri Çeken Fonksiyon
    async function loadOrders() {
        try {
            const response = await fetch('/api/orders');
            const orders = await response.json();
            renderTable(orders);
        } catch (error) {
            console.error("Siparişler yüklenemedi", error);
        }
    }

    function renderTable(orders) {
        const tbody = document.getElementById("orderTableBody");
        const userRole = localStorage.getItem("role"); // Rolü buradan okuyoruz

        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">Henüz siparişiniz yok.</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${order.customer}</div>
                    <div class="text-sm text-gray-500">${order.date}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        ${order.service}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex items-center">
                        <i class="fa-solid fa-file mr-2 text-gray-400"></i> ${order.file}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${order.status === 'Bekliyor'
                ? '<span class="text-yellow-600 font-bold text-xs"><i class="fa-solid fa-clock"></i> Fiyat Bekliyor</span>'
                : '<span class="text-green-600 font-bold text-xs"><i class="fa-solid fa-check-circle"></i> Fiyatlandı</span>'}
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                    ${userRole === 'admin'
                ? /* ADMİN İSE: Düzenlenebilir Input Göster */ `
                        <div class="flex items-center space-x-2">
                            <input type="number" id="price-${order.id}" value="${order.price || ''}" placeholder="0.00" class="w-20 border border-gray-300 rounded px-2 py-1 text-sm">
                            <button onclick="savePrice(${order.id})" class="text-green-600 hover:text-green-800"><i class="fa-solid fa-save"></i></button>
                        </div>
                        `
                : /* MÜŞTERİ İSE: Sadece Fiyatı Göster */ `
                        <div class="text-sm font-bold text-gray-900">
                            ${order.price ? order.price + ' ₺' : '-'}
                        </div>
                        `
            }
                </td>
            </tr>
        `).join('');
    }

    // Fiyat Kaydetme Fonksiyonunu Global Yap (HTML'den erişilebilsin)
    window.savePrice = async function (id) {
        const priceVal = document.getElementById(`price-${id}`).value;
        if (!priceVal) { alert("Lütfen fiyat girin!"); return; }

        const btn = event.currentTarget; // Tıklanan buton
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; // Loading ikonu

        try {
            const res = await fetch(`/api/orders/${id}/quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: parseFloat(priceVal) })
            });

            if (res.ok) {
                // Başarılı olursa satırı güncelle (tekrar yükle)
                loadOrders();
                alert("Fiyat müşteriye iletildi!");
            }
        } catch (err) {
            alert("Hata oluştu!");
        }
    }

    // İlk yüklemede çalıştır
    setTimeout(() => {
        loadOrders();
    }, 100);

    return `
        <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
            
            <div class="md:flex md:items-center md:justify-between mb-6">
                <div class="flex-1 min-w-0">
                    <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Sipariş Yönetimi
                    </h2>
                </div>
                <div class="mt-4 flex md:mt-0 md:ml-4">
                    <button onclick="fetch('/api/create-fake-orders').then(() => location.reload())" class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none">
                        <i class="fa-solid fa-database mr-2"></i> Test Verisi Oluştur
                    </button>
                </div>
            </div>

            <div class="flex flex-col">
                <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri / Tarih</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hizmet Türü</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yüklenen Dosya</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat Teklifi (TL)</th>
                                    </tr>
                                </thead>
                                <tbody id="orderTableBody" class="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td colspan="6" class="text-center py-4 text-gray-500">Yükleniyor...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `;
}