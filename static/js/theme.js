// theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return; // 👈 关键检查

    let currentTheme = localStorage.getItem('theme') || 'light';

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(currentTheme);
    }

    themeToggle.addEventListener('click', toggleTheme);
    setTheme(currentTheme);
});