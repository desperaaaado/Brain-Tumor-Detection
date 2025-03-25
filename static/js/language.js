import {setLanguage, t} from './i18n.js';


document.addEventListener('DOMContentLoaded', () => {
    // 初始化语言和图标
    const preferredLang = localStorage.getItem('preferredLang') || 'zh';
    setLanguage(preferredLang);

    // 更新当前语言显示
    const currentLanguage = document.querySelector('.current-language');
    const flagPath = currentLanguage.getAttribute(`data-flag-${preferredLang}`);
    const languageText = preferredLang === 'zh' ? '中文' : 'English';

    currentLanguage.innerHTML = `
        <img class="flag-icon" src="${flagPath}" alt="${languageText}">
        ${languageText}
    `;

    // 语言切换事件绑定
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', function () {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);

            // 更新图标和文本
            const flagPath = currentLanguage.getAttribute(`data-flag-${lang}`);
            const languageText = lang === 'zh' ? '中文' : 'English';
            currentLanguage.innerHTML = `
                <img class="flag-icon" src="${flagPath}" alt="${languageText}">
                ${languageText}
            `;
        });
    });
});
