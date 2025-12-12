export const AuthService = {
    // Giriş Yap
    login: async (username, password) => {
        try {
            // Sunucuya (Python) istek atıyoruz
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Giriş başarılıysa kullanıcı adını tarayıcıya kaydet (Hafıza)
                localStorage.setItem("user_token", "logged_in");
                localStorage.setItem("username", data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.error };
            }
        } catch (error) {
            return { success: false, message: "Sunucu hatası! Bağlantı yok." };
        }
    },

    // Çıkış Yap
    logout: async () => {
        // Sunucuya çıkış isteği at
        await fetch('/api/logout', { method: 'POST' });

        // Tarayıcı hafızasını temizle
        localStorage.removeItem("user_token");
        localStorage.removeItem("username");

        // Ana sayfaya yönlendir
        window.location.hash = '/login';
    },

    // Oturum Kontrolü (Sayfa yenilenince hatırlaması için)
    isAuthenticated: () => {
        return !!localStorage.getItem("user_token");
    }
};