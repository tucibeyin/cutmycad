export const AuthService = {
    login: async (username, password) => {
        // İleride buraya gerçek API isteği gelecek
        if (username === "admin" && password === "1234") {
            localStorage.setItem("user_token", "demo_token_123");
            return { success: true, user: username };
        }
        return { success: false, message: "Hatalı bilgiler!" };
    },

    logout: () => {
        localStorage.removeItem("user_token");
    },

    isAuthenticated: () => {
        return !!localStorage.getItem("user_token");
    }
};