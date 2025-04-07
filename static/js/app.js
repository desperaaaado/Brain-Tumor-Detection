// ------------------
// 主题切换功能
// ------------------
const themeToggle = document.getElementById('themeToggle');
let currentTheme = localStorage.getItem('theme') || 'light';

// 初始化主题
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// 切换主题
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);

    // 适配医学图像显示
    const images = document.querySelectorAll('.result-image');
    images.forEach(img => {
        img.style.filter = currentTheme === 'dark'
            ? 'brightness(0.9) contrast(1.1)'
            : 'none';
    });
}

// 按钮点击事件
themeToggle.addEventListener('click', toggleTheme);

// 初始化
setTheme(currentTheme);

// ------------------
// 语言切换功能
// ------------------
import {setLanguage, t} from './i18n.js';

document.addEventListener('languageChanged', () => {
    if (latestResults) {
        renderResults(latestResults);
    }
});


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


// ------------------
// 侧边栏功能
// ------------------
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');

// 切换侧边栏
function toggleSidebar() {
    sidebar.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

// 菜单按钮点击事件
menuToggle.addEventListener('click', toggleSidebar);

// 点击外部关闭侧边栏
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});


document.addEventListener('DOMContentLoaded', () => {
    // 侧边栏菜单点击处理
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');

            // 更新URL hash
            window.location.hash = target;

            // 手动触发路由处理
            handleRouting();
        });
    });

    // 初始化路由
    handleRouting();

    // 监听浏览器前进/后退
    window.addEventListener('hashchange', handleRouting);
});

// 路由处理
function handleRouting() {
    // const hash = window.location.hash || '#home';
    // 获取当前哈希，如果不存在则默认为#home
    let hash = window.location.hash;

    if (!hash || hash === '#login') {
        hash = '#home';  // 修正错误哈希
        history.replaceState(null, null, hash);
    }


    // 强制滚动到页面顶部
    window.scrollTo(0, 0);

    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    // 显示当前页面
    const currentPage = document.querySelector(hash);
    if (currentPage) {
        currentPage.style.display = 'block';

        // 添加双重滚动保障
        requestAnimationFrame(() => {
            window.scrollTo({
                top: 0,
                behavior: 'instant' // 强制立即滚动
            });
            currentPage.scrollTop = 0;
        });
    }

    // 更新菜单激活状态
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === hash) {
            link.classList.add('active');
        }
    });

    // 移动端自动关闭侧边栏
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        menuToggle.classList.remove('active');
    }
}


// 初始化路由
window.addEventListener('load', handleRouting);
window.addEventListener('hashchange', handleRouting);


// 添加认证状态检查函数
function isAuthenticated() {
    // 这里需要与后端session/cookie配合
    return document.cookie.includes('session='); // 根据实际认证方式调整
}

// 修改侧边栏显示登录状态
function updateAuthUI() {
    const authLinks = document.getElementById('auth-links');
    if (isAuthenticated()) {
        authLinks.innerHTML = `
            <li><a href="#logout" data-i18n="logout">Logout</a></li>
        `;
    } else {
        authLinks.innerHTML = `
            <li><a href="#login" data-i18n="login">Login</a></li>
            <li><a href="#register" data-i18n="register">Register</a></li>
        `;
    }
}



// 用户卡片交互逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 点击用户卡片显示下拉菜单
    const userCard = document.querySelector('.user-card');
    const dropdown = document.querySelector('.dropdown-content');

    if (userCard) {
        userCard.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // 点击外部关闭
        document.addEventListener('click', function() {
            dropdown.classList.remove('show');
        });

        // 防止菜单内部点击关闭
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});


// ------------------
// 文件上传功能
// ------------------

// 初始化滑块
const confSlider = document.getElementById('confThreshold');
const iouSlider = document.getElementById('iouThreshold');
const confValue = document.getElementById('confValue');
const iouValue = document.getElementById('iouValue');

// 实时更新显示值
confSlider.addEventListener('input', (e) => {
    confValue.textContent = parseFloat(e.target.value).toFixed(2);
});

iouSlider.addEventListener('input', (e) => {
    iouValue.textContent = parseFloat(e.target.value).toFixed(2);
});

const fileInput = document.getElementById('fileInput');
const resultsContainer = document.getElementById('resultsContainer');
const loader = document.getElementById('loader');
const fileCounter = document.getElementById('fileCounter');

fileInput.addEventListener('change', handleFileSelect);

async function handleFileSelect(e) {
    // 获取当前参数值
    const conf = parseFloat(confSlider.value);
    const iou = parseFloat(iouSlider.value);

    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 文件类型过滤
    const invalidFiles = files.filter(file =>
        !['image/jpeg', 'image/jpg'].includes(file.type));

    if (invalidFiles.length > 0) {
        // alert(`您所上传的文件
        //     ${invalidFiles.map(f => f.name).join(', ')}\n不在文件类型支持列表中，只支持上传JPG/JPEG类型文件`);
        // return;
        const message = t('invalidFileAlert', {
            files: invalidFiles.map(f => f.name).join(', ')
        });
        alert(message);
        return;
    }

    // Show loader
    loader.style.display = 'block';
    // fileCounter.textContent = `Uploading ${files.length} files...`;
    fileCounter.textContent = t('uploadingFiles', { count: files.length });
    resultsContainer.innerHTML = '';

    const formData = new FormData();
    formData.append('conf', conf);
    formData.append('iou', iou);
    files.forEach(file => formData.append('files', file));

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        renderResults(data.results);

    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        loader.style.display = 'none';
        fileCounter.textContent = '';
        fileInput.value = ''; // Reset input
    }
}

export let latestResults = [];

export function renderResults(results) {
    latestResults = results; // 保存最新结果

    resultsContainer.innerHTML = results.map(result => `
                <div class="result-card">
                    <div class="image-container">
                        ${result.status === 'success' ? `
                            <img src="${result.result_url}" class="result-image">
                        ` : `
                            <div class="error-placeholder">
                                <span>⚠️ Error</span>
                            </div>
                         `}
                    </div>
                    <div class="card-content">
                        <div class="filename">${result.original_filename}</div>
                        <div class="status ${result.status}">
                            ${result.status === 'success' 
                                ? t('success') 
                                : `${t('error')}: ${result.error}`}
                        </div>
                    </div>
                </div>
            `).join('');
}

// Drag and drop handling
document.addEventListener('dragover', e => {
    e.preventDefault();
    // document.querySelector('.upload-label').style.borderColor = 'var(--primary-color)';
    document.querySelector('.upload-label').classList.add('dragover');
});

document.addEventListener('dragleave', () => {
    // document.querySelector('.upload-label').style.borderColor = '#ccc';
    document.querySelector('.upload-label').classList.remove('dragover');
});

document.addEventListener('drop', e => {
    e.preventDefault();
    // document.querySelector('.upload-label').style.borderColor = '#ccc';
    document.querySelector('.upload-label').classList.remove('dragover');
    if (e.dataTransfer.files) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect({target: fileInput});
    }
});

// 点击图片放大查看
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('result-image')) {
        const modal = document.createElement('div');
        modal.style = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            cursor: zoom-out;
        `;

        const img = document.createElement('img');
        img.src = e.target.src;
        img.style = `
            max-width: 90vw;
            max-height: 90vh;
            object-fit: contain;
        `;

        modal.appendChild(img);
        modal.onclick = () => document.body.removeChild(modal);
        document.body.appendChild(modal);
    }
});

