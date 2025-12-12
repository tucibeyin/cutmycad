import { AuthService } from "../services/AuthService.js";

export default function Dashboard() {
    if (!AuthService.isAuthenticated()) {
        window.location.hash = "/login";
        return "";
    }

    // --- SİPARİŞLERİ YÜKLE ---
    async function loadOrders() {
        try {
            const response = await fetch('/api/orders');
            const orders = await response.json();
            renderTable(orders);
        } catch (error) { console.error(error); }
    }

    // --- TABLO OLUŞTURUCU ---
    function renderTable(orders) {
        const tbody = document.getElementById("orderTableBody");
        const userRole = localStorage.getItem("role");

        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">Sipariş bulunamadı.</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                <td class="px-6 py-4 text-sm text-gray-400">#${order.id}</td>
                
                <td class="px-6 py-4">
                    <div class="text-sm font-bold text-gray-800">${order.customer}</div>
                    <div class="text-xs text-gray-400">${order.date}</div>
                </td>
                
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">${order.service}</span>
                </td>
                
                <td class="px-6 py-4 text-sm">
                    <a href="${order.download_url}" class="text-gray-600 hover:text-primary"><i class="fa-solid fa-file-arrow-down mr-2"></i> ${order.file}</a>
                </td>
                
                <td class="px-6 py-4">
                    ${getStatusBadge(order.status)}
                </td>
                
                <td class="px-6 py-4">
                    ${renderPriceColumn(order, userRole)}
                </td>

                <td class="px-6 py-4 text-right">
                    ${renderActions(order, userRole)}
                </td>
            </tr>
        `).join('');
    }

    // --- YARDIMCI HTML FONKSİYONLARI ---

    function getStatusBadge(status) {
        if (status === 'Onaylandı') return '<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold"><i class="fa-solid fa-check-double"></i> Onaylandı</span>';
        if (status === 'Pazarlık') return '<span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold"><i class="fa-solid fa-handshake"></i> Pazarlık</span>';
        if (status === 'Fiyatlandı') return '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold"><i class="fa-solid fa-tag"></i> Fiyat Geldi</span>';
        return '<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold"><i class="fa-solid fa-clock"></i> Bekliyor</span>';
    }

    function renderPriceColumn(order, role) {
        // ADMIN GÖRÜNÜMÜ
        if (role === 'admin') {
            let extraInfo = '';
            if (order.status === 'Pazarlık') {
                extraInfo = `<div class="text-xs text-purple-600 mt-1">Müşteri Teklifi: <b>${order.counter_offer} ₺</b></div>`;
            }
            return `
                <div class="flex flex-col">
                    <div class="flex items-center space-x-1">
                        <input type="number" id="price-${order.id}" value="${order.price || ''}" placeholder="0" class="w-20 border border-gray-300 rounded px-2 py-1 text-sm">
                        <button onclick="savePrice(${order.id})" class="text-green-600 hover:bg-green-100 p-1 rounded"><i class="fa-solid fa-save"></i></button>
                    </div>
                    ${extraInfo}
                </div>
            `;
        }

        // MÜŞTERİ GÖRÜNÜMÜ
        else {
            if (!order.price) return '<span class="text-gray-400 text-xs">-</span>';

            // Eğer müşteri onayladıysa sadece fiyatı göster
            if (order.status === 'Onaylandı') return `<span class="text-green-600 font-bold text-lg">${order.price} ₺</span>`;

            // Fiyat gelmiş ama henüz onaylanmamışsa
            return `
                <div class="flex flex-col items-start space-y-1">
                    <span class="text-lg font-bold text-gray-900">${order.price} ₺</span>
                    ${order.counter_offer ? `<span class="text-xs text-purple-500">Teklifiniz: ${order.counter_offer} ₺</span>` : ''}
                </div>
            `;
        }
    }

    function renderActions(order, role) {
        // ADMIN
        if (role === 'admin') {
            return `
                <button onclick="deleteOrder(${order.id})" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash"></i></button>
            `;
        }

        // MÜŞTERİ
        else {
            // Eğer sipariş onaylanmışsa işlem yapamasın (Sadece görüntülesin)
            if (order.status === 'Onaylandı') return '';

            // Eğer fiyat geldiyse Onayla/Pazarlık butonlarını göster
            if (order.price > 0 && order.status !== 'Onaylandı') {
                return `
                    <div class="flex items-center justify-end space-x-2">
                        <button onclick="approveOrder(${order.id})" class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs" title="Fiyatı Onayla">
                            <i class="fa-solid fa-check"></i> Onayla
                        </button>
                        <button onclick="makeCounterOffer(${order.id})" class="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs" title="Karşı Teklif Ver">
                            <i class="fa-solid fa-hand-holding-dollar"></i> Teklif
                        </button>
                        <button onclick="deleteOrder(${order.id})" class="text-red-400 hover:text-red-600 ml-2" title="Siparişi İptal Et"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
            }

            // Henüz fiyat yoksa sadece silme/güncelleme
            return `
                <div class="flex items-center justify-end space-x-3">
                    <label class="cursor-pointer text-blue-500 hover:text-blue-700" title="Dosyayı Güncelle">
                        <i class="fa-solid fa-rotate"></i>
                        <input type="file" class="hidden" onchange="updateFile(${order.id}, this)">
                    </label>
                    <button onclick="deleteOrder(${order.id})" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
        }
    }

    // --- AKSİYON FONKSİYONLARI ---

    window.approveOrder = async (id) => {
        if (!confirm("Fiyatı onaylıyor musunuz? Sipariş üretime alınacaktır.")) return;
        try {
            await fetch(`/api/orders/${id}/approve`, { method: 'POST' });
            loadOrders();
            alert("Sipariş onaylandı!");
        } catch (e) { alert("Hata"); }
    };

    window.makeCounterOffer = async (id) => {
        const offer = prompt("Teklif ettiğiniz fiyatı girin (TL):");
        if (!offer) return;
        try {
            await fetch(`/api/orders/${id}/counter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offer: parseFloat(offer) })
            });
            loadOrders();
            alert("Teklifiniz iletildi.");
        } catch (e) { alert("Hata"); }
    };

    window.savePrice = async (id) => {
        const val = document.getElementById(`price-${id}`).value;
        if (!val) return;
        await fetch(`/api/orders/${id}/quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: parseFloat(val) })
        });
        loadOrders();
    };

    window.deleteOrder = async (id) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
        if (res.ok) loadOrders();
    };

    window.updateFile = async (id, input) => {
        const file = input.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        await fetch(`/api/orders/${id}/update-file`, { method: 'POST', body: fd });
        loadOrders();
    };

    // Başlat
    setTimeout(() => loadOrders(), 100);

    return `
        <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Sipariş Yönetimi</h2>
            <div class="shadow-lg overflow-hidden border-b border-gray-200 sm:rounded-lg bg-white">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hizmet</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosya</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="orderTableBody" class="bg-white divide-y divide-gray-200"></tbody>
                </table>
            </div>
        </div>
    `;
}