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

