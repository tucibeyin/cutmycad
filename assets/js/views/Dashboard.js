import { AuthService } from "../services/AuthService.js";

export default function Dashboard() {
    if (!AuthService.isAuthenticated()) {
        window.location.hash = "/login";
        return "";
    }

    const username = localStorage.getItem("username") || "Kullanıcı";

    // Siparişleri Yükle
    async function loadOrders() {
        try {
            const response = await fetch('/api/orders');
            const orders = await response.json();
            renderTable(orders);
        } catch (error) {
            console.error("Hata:", error);
        }
    }

    // --- TABLO ÇİZİMİ ---
    function renderTable(orders) {
        const tbody = document.getElementById("orderTableBody");
        const userRole = localStorage.getItem("role");

        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">Henüz hiç siparişiniz yok.</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">#${order.id}</td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold text-gray-800">${order.customer}</div>
                    <div class="text-xs text-gray-400">${order.date}</div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full 
                    ${order.service === 'CNC İşleme' ? 'bg-blue-100 text-blue-800' :
                order.service === 'Lazer Kesim' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}">
                        ${order.service}
                    </span>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <a href="${order.download_url}" class="flex items-center text-gray-600 hover:text-primary transition" title="İndir">
                        <i class="fa-solid fa-file-lines mr-2"></i> ${order.file}
                    </a>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                    ${order.status === 'Bekliyor'
                ? '<span class="text-yellow-600 font-bold text-xs bg-yellow-50 px-2 py-1 rounded"><i class="fa-solid fa-clock"></i> Bekliyor</span>'
                : '<span class="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded"><i class="fa-solid fa-check"></i> Fiyatlandı</span>'}
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                    ${userRole === 'admin'
                ? `<div class="flex items-center space-x-1">
                             <input type="number" id="price-${order.id}" value="${order.price || ''}" placeholder="0" class="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:border-primary focus:outline-none">
                             <button onclick="savePrice(${order.id})" class="text-green-500 hover:text-green-700 bg-green-50 p-1 rounded"><i class="fa-solid fa-check"></i></button>
                           </div>`
                : `<span class="text-sm font-bold text-gray-800">${order.price ? order.price + ' ₺' : '-'}</span>`
            }
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-3">
                        
                        ${(userRole === 'admin' || order.status === 'Bekliyor') ? `
                            <label class="cursor-pointer text-blue-500 hover:text-blue-700" title="Dosyayı Güncelle">
                                <i class="fa-solid fa-rotate"></i>
                                <input type="file" class="hidden" onchange="updateFile(${order.id}, this)">
                            </label>
                        ` : ''}

                        ${(userRole === 'admin' || order.status === 'Bekliyor') ? `
                            <button onclick="deleteOrder(${order.id})" class="text-red-400 hover:text-red-600 transition" title="Siparişi Sil">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // --- FONKSİYONLAR (Global Scope) ---

    // 1. SİLME FONKSİYONU
    window.deleteOrder = async function (id) {
        if (!confirm("Bu siparişi ve dosyasını silmek istediğinize emin misiniz?")) return;

        try {
            const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadOrders(); // Tabloyu yenile
            } else {
                alert("Silinemedi! (Yetkiniz yok veya sipariş işlemde)");
            }
        } catch (err) { alert("Sunucu hatası"); }
    }

    // 2. DOSYA GÜNCELLEME FONKSİYONU
    window.updateFile = async function (id, input) {
        const file = input.files[0];
        if (!file) return;

        if (!confirm("Mevcut dosya silinip yerine bu yüklenecek. Emin misiniz?")) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`/api/orders/${id}/update-file`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert("Dosya başarıyla güncellendi!");
                loadOrders();
            } else {
                alert("Güncelleme başarısız.");
            }
        } catch (err) { alert("Hata oluştu"); }
    }

    // 3. FİYAT KAYDETME
    window.savePrice = async function (id) {
        const priceVal = document.getElementById(`price-${id}`).value;
        if (!priceVal) return;

        try {
            await fetch(`/api/orders/${id}/quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: parseFloat(priceVal) })
            });
            loadOrders();
            alert("Fiyat girildi.");
        } catch (err) { alert("Hata"); }
    }

    // Başlat
    setTimeout(() => loadOrders(), 100);

    return `
        <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
            <div class="md:flex md:items-center md:justify-between mb-6">
                <div class="flex-1 min-w-0">
                    <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Sipariş Yönetimi
                    </h2>
                    <p class="text-sm text-gray-500 mt-1">Siparişlerinizi buradan takip edebilirsiniz.</p>
                </div>
            </div>

            <div class="flex flex-col">
                <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div class="shadow-lg overflow-hidden border-b border-gray-200 sm:rounded-lg bg-white">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri / Tarih</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hizmet</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosya</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody id="orderTableBody" class="bg-white divide-y divide-gray-200"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}