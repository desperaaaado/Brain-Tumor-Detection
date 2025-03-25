const translations = {
    en: {
        title: "Brain Tumor Detection",
        uploadLabel: "Click to select files or drag and drop",
        maxFiles: "Maximum 10 files (JPG/JPEG)",
        success: "✔️ Success",
        error: "❌ Error",
        invalidFileAlert: "The following files are invalid:\n{{files}}\nOnly JPG/JPEG files are supported",
        uploadingFiles: "Uploading {{count}} files...",
        'invalid_file': "Invalid file format",
        'model_error': "Analysis failed",
        confidence: "Confidence Threshold",
        iou: "IOU Threshold",
        invalid_params: "Invalid parameter values (must be 0-1)",
        invalid_parameter_type: "Invalid parameter format",
        home: "Home",
        history: "History",
        changelog: "Changelog",
        contact: "Contact Us",
        login_title: "Login",
        register_title: "Register",
        username: "Username",
        password: "Password",
        email: "Email",
        have_account: "Already have an account?",
        no_account: "Don't have an account?",
        register_here: "Register here",
        login_here: "Login here"
        // 其他文本...
    },
    zh: {
        title: "脑肿瘤检测",
        uploadLabel: "点击选择文件或拖拽上传",
        maxFiles: "最多10个文件 (JPG/JPEG)",
        success: "✔️ 成功",
        error: "❌ 错误",
        invalidFileAlert: "您所上传的文件：\n{{files}}\n不在支持列表中，只支持上传JPG/JPEG类型文件",
        uploadingFiles: "正在上传{{count}}个文件...",
        'invalid_file': "无效文件格式",
        'model_error': "分析失败",
        confidence: "置信度阈值",
        iou: "交并比阈值",
        invalid_params: "参数值无效（必须为0-1）",
        invalid_parameter_type: "参数格式错误",
        home: "首页",
        history: "历史记录",
        changelog: "更新日志",
        contact: "联系我们",
        login_title: "登录",
        register_title: "注册",
        username: "用户名",
        password: "密码",
        email: "电子邮箱",
        have_account: "已有账号？",
        no_account: "没有账号？",
        register_here: "立即注册",
        login_here: "立即登录"
        // 其他文本...
    }
};

let currentLang = 'zh'; // 默认语言为中文

export function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        localStorage.setItem('preferredLang', lang);
        applyTranslations();
        refreshDynamicContent();
    }
}

// import {latestResults, renderResults} from './app.js'

// 动态内容刷新函数
function refreshDynamicContent() {
    // if (latestResults.length > 0) {
    //     renderResults(latestResults); // 使用最新数据重新渲染
    // }
    // 改为使用事件机制
    const event = new CustomEvent('languageChanged');
    document.dispatchEvent(event);
}

// export function t(key) {
//     return translations[currentLang][key] || `[${key}]`;
// }

export function t(key, params = {}) {
    let translation = translations[currentLang][key] || `[${key}]`;

    // 替换参数占位符
    Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
    });

    return translation;
}

export function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    // 特殊处理页面标题
    document.title = t('title');

    document.querySelector('.current-language').textContent =
        currentLang === 'zh' ? '中文' : 'English';
}