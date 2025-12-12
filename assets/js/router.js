import Home from './views/Home.js';
import Login from './views/Login.js';
import Register from './views/Register.js'; // <-- YENİ
import Dashboard from './views/Dashboard.js';

const routes = {
    '/': Home,
    '/login': Login,
    '/register': Register, // <-- YENİ
    '/dashboard': Dashboard
};

export function router() {
    const path = window.location.hash.slice(1) || '/';
    const viewFunction = routes[path] || Home;
    return viewFunction();
}