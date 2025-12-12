import Home from './views/Home.js'; // Bunu da oluşturman gerek
import Login from './views/Login.js';
import Dashboard from './views/Dashboard.js';

const routes = {
    '/': Home,
    '/login': Login,
    '/dashboard': Dashboard
};

export function router() {
    const path = window.location.hash.slice(1) || '/';
    const viewFunction = routes[path] || Home;

    // HTML içeriğini oluştur
    const content = viewFunction();

    // Header ve Footer'ı app.js'te yöneteceğiz, burası sadece main içeriği döner
    return content;
}