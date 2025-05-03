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
        link.addEventListener('click', function (e) {
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

    // 当切换到历史记录页面时加载数据
    if (hash === '#history') {
        loadHistory();
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


// 用户卡片交互逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 点击用户卡片显示下拉菜单
    const userCard = document.querySelector('.user-card');
    const dropdown = document.querySelector('.dropdown-content');

    if (userCard) {
        userCard.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // 点击外部关闭
        document.addEventListener('click', function () {
            dropdown.classList.remove('show');
        });

        // 防止菜单内部点击关闭
        dropdown.addEventListener('click', function (e) {
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
    fileCounter.textContent = t('uploadingFiles', {count: files.length});
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
    document.querySelector('.upload-label').classList.add('dragover');
});

document.addEventListener('dragleave', () => {
    document.querySelector('.upload-label').classList.remove('dragover');
});

document.addEventListener('drop', e => {
    e.preventDefault();
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


// 全局分页参数
let currentHistoryPage = 1;
let currentCategoryFilter = '';

// 初始化历史记录功能
function initHistory() {
    // 获取元素
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');

    // 绑定事件
    document.getElementById('applyFilter').addEventListener('click', () => {
        currentHistoryPage = 1; // 重置为第一页
        loadHistory();
    });

    // 绑定上一页按钮事件（确保存在）
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => changePage(-1));
    }

    // 绑定下一页按钮事件（确保存在）
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => changePage(1));
    }

    // 初始化加载
    loadHistory();
}

// 加载历史数据
async function loadHistory() {
    try {
        currentCategoryFilter = document.getElementById('categoryFilter').value;
        const response = await fetch(`/api/history?page=${currentHistoryPage}&category=${currentCategoryFilter}`);
        const data = await response.json();

        renderHistory(data);
        // updatePagination(data.has_prev, data.has_next);
        updatePagination(
            data.has_prev,
            data.has_next,
            data.current_page,
            data.total_pages
        );
    } catch (error) {
        console.error('加载历史记录失败:', error);
    }
}

// 渲染历史记录
function renderHistory(data) {
    const container = document.getElementById('historyList');
    const currentLang = localStorage.getItem('preferredLang') || 'zh'; // 通过localStorage获取

    container.innerHTML = data.items.length > 0
        ? data.items.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="image-pair">
                    <div class="thumbnail-container">
                        <img src="${item.original_image}" 
                            alt="原图" 
                            class="history-thumbnail"
                            data-enlargeable
                            data-original="${item.original_image}">
                        <span class="image-label" data-i18n="original_image">${t('original_image')}</span>
                    </div>
                    <div class="thumbnail-container">
                        <img src="${item.result_image}" 
                            alt="结果图" 
                            class="history-thumbnail"
                            data-enlargeable
                            data-original="${item.result_image}">
                        <span class="image-label" data-i18n="result_image">${t('result_image')}</span>
                    </div>
                </div>
                
                <div class="meta">
                    <!-- 第一行：检测时间 + 类别 -->
                    <div class="row">
                        <div class="info-item">
                            <span class="label" data-i18n="detection_time">${t('detection_time')}:</span>
                            <span>${new Date(item.created_at).toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="label" data-i18n="class">${t('class')}:</span>
                            ${item.detection_data.map(d => `
                                <span class="class-badge">${d.class_name}</span>
                            `).join('')}
                        </div>
                    </div>
                    <!-- 第二行：置信度阈值 + 交并比阈值 -->
                    <div class="row">
                        <div class="info-item">
                            <span class="label" data-i18n="conf_threshold">${t('conf_threshold')}:</span>
                            <span>${item.conf_threshold.toFixed(2)}</span>
                        </div>
                        <div class="info-item">
                            <span class="label" data-i18n="iou_threshold">${t('iou_threshold')}:</span>
                            <span>${item.iou_threshold.toFixed(2)}</span>
                        </div>
                    </div>
                    <!-- 第三行：置信度 -->
                    <div class="row">
                        <div class="info-item full-width">
                            <span class="label" data-i18n="confidence">${t('confidence')}:</span>
                            ${item.detection_data.map(d => `
                                <span class="confidence-value">${d.conf.toFixed(4)}</span>
                            `).join('')}
                        </div>
                    </div>
                    <!-- 第四行：坐标范围 -->
                    <div class="row">
                        <div class="info-item full-width">
                            <span class="label" data-i18n="coordinates">${t('coordinates')}:</span>
                            ${item.detection_data.map(d => `
                                <div class="coordinate-box">[${d.xyxy.map(n => n.toFixed(2)).join(', ')}]</div>
                            `).join('')}
                        </div>
                    </div>
                    
                </div>
                <div class="action-buttons">                   
                    <button class="export-btn" data-id="${item.id}" data-lang="${currentLang}" data-i18n="export_single">${t('export_single')}</button>
                </div>
                <button class="delete-btn" data-id="${item.id}">
                    <svg class="delete-icon" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                    </svg>
                </button>
            </div>
        `).join('')
        : `<div class="no-data" data-i18n="no_history">暂无历史记录</div>`;


    // 添加导出事件监听
    document.getElementById('historyList').addEventListener('click', (e) => {
        if (e.target.classList.contains('export-btn')) {
            const recordId = e.target.dataset.id;
            // window.location.href = `/api/history/${recordId}/export`;
            const lang = localStorage.getItem('preferredLang') || 'zh';
            window.location.href = `/api/history/${recordId}/export?lang=${lang}`;
        }
    });

    // 添加图片点击事件监听
    document.querySelectorAll('.history-thumbnail').forEach(img => {
        img.addEventListener('click', function (e) {
            e.stopPropagation();
            createImageModal(this.src, this.alt);
        });
    });
}

// 绑定删除事件
// document.getElementById('historyList').addEventListener('click', async (e) => {
//     if (e.target.classList.contains('delete-btn')) {
//         const itemId = e.target.dataset.id;
//         if (confirm(t('delete_confirm'))) {
//             try {
//                 const response = await fetch(`/api/history/${itemId}`, {
//                     method: 'DELETE'
//                 });
//                 if (response.ok) {
//                     loadHistory();
//                 }
//             } catch (error) {
//                 console.error('删除失败:', error);
//             }
//         }
//     }
// });

// 创建确认弹窗函数
function showDeleteConfirm(itemId) {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';

    modal.innerHTML = `
        <div class="confirm-dialog">
            <div class="confirm-content">
                <h3>${t('delete_confirm_title')}</h3>
                <p>${t('delete_confirm_text')}</p>
                <div class="confirm-buttons">
                    <button class="confirm-cancel">${t('cancel')}</button>
                    <button class="confirm-ok">${t('confirm')}</button>
                </div>
            </div>
        </div>
    `;

    // 点击取消
    modal.querySelector('.confirm-cancel').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // 点击确认
    modal.querySelector('.confirm-ok').addEventListener('click', async () => {
        try {
            const response = await fetch(`/api/history/${itemId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadHistory();
            }
        } catch (error) {
            console.error('删除失败:', error);
        }
        document.body.removeChild(modal);
    });

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    // ESC键关闭
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    document.body.appendChild(modal);
}

document.getElementById('historyList').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        const itemId = deleteBtn.dataset.id;
        showDeleteConfirm(itemId);
    }
});

// 创建图片模态框
function createImageModal(src, alt) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="close-button"></div>
            <img src="${src}" alt="${alt}" class="modal-image">
        </div>
    `;

    // 关闭处理
    const closeModal = () => document.body.removeChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    modal.querySelector('.close-button').addEventListener('click', closeModal);

    // ESC键关闭
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });

    document.body.appendChild(modal);
}


// 分页操作
function changePage(delta) {
    currentHistoryPage += delta;
    loadHistory();
}


// 更新分页状态
function updatePagination(hasPrev, hasNext, currentPage, totalPages) {
    const container = document.querySelector('.pagination');
    container.innerHTML = '';

    // 生成页码按钮
    const pages = generatePageNumbers(currentPage, totalPages);

    // 添加上一页按钮
    container.appendChild(createPageButton('«', currentPage - 1, !hasPrev));

    // 添加页码按钮
    pages.forEach(page => {
        if (page === '...') {
            container.appendChild(createEllipsis());
        } else {
            container.appendChild(createPageButton(
                page,
                page,
                page === currentPage
            ));
        }
    });

    // 添加下一页按钮
    container.appendChild(createPageButton('»', currentPage + 1, !hasNext));
}

// 生成智能页码数组（最多显示7个按钮）
function generatePageNumbers(current, total) {
    const range = 2; // 当前页两侧显示的页码数
    const pages = [];

    if (total <= 7) {
        return Array.from({length: total}, (_, i) => i + 1);
    }

    // 开头页码
    pages.push(1, 2);
    if (current > range + 3) pages.push('...');

    // 中间页码
    const start = Math.max(3, current - range);
    const end = Math.min(total - 2, current + range);
    for (let i = start; i <= end; i++) pages.push(i);

    // 结尾页码
    if (current < total - range - 2) pages.push('...');
    pages.push(total - 1, total);

    return [...new Set(pages)].sort((a, b) => a - b);
}

// 创建页码按钮
function createPageButton(text, page, disabled = false) {
    const btn = document.createElement('button');
    btn.className = `pagination-btn ${disabled ? 'disabled' : ''}`;
    btn.textContent = text;
    btn.dataset.page = page;

    if (!disabled && text !== '...') {
        btn.addEventListener('click', () => {
            currentHistoryPage = page;
            loadHistory();
        });
    }

    return btn;
}

// 创建省略号元素
function createEllipsis() {
    const span = document.createElement('span');
    span.className = 'pagination-ellipsis';
    span.textContent = '...';
    return span;
}

// 初始化时调用
document.addEventListener('DOMContentLoaded', initHistory);