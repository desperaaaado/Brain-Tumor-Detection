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
        conf_threshold: "Confidence Threshold",
        iou_threshold: "IOU Threshold",
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
        login_here: "Login here",
        send_code: "Send Code",
        verification_code: "Verification Code",
        enter_email: "Enter your email",
        enter_code: "Enter verification code",
        enter_password: "Enter your password",
        enter_username: "Enter your username",
        invalid_email: "Please enter a valid email address",
        resend_after: "Resend in {{seconds}} seconds",
        send_code_failed: "Failed to send verification code",
        send_failed: "Send failed",
        logout: "Log out",
        errors: {
            username_exists: "Username already exists",
            email_exists: "Email already registered",
            code_expired: "Verification code expired",
            code_invalid: "Invalid verification code",
            registration_failed: "Registration failed",
            wrong_username_or_password: "Wrong username or password"
        },
        all_categories: "All Categories",
        apply_filter: "Apply Filter",
        export_csv: "Export CSV",
        detection_time: "Detection Time",
        parameters: "Parameters",
        coordinates: "Coordinates",
        class_0: "No tumor",
        class_1: "Glioma",
        class_2: "Meningioma",
        class_3: "Pituitary",
        class_4: "Space-occupying lesion",
        previous: "Previous",
        next: "Next",
        no_history: "No detection records",
        // delete_confirm: "Are you sure to delete this record?",
        delete_confirm_title: "Delete Confirmation",
        delete_confirm_text: "Are you sure you want to delete this record?",
        confirm: "Confirm",
        cancel: "Cancel",
        export_single: "export CSV",
        class: "Class",
        confidence: "Confidence",
        original_image: "Original Image",
        result_image: "Result Image",
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
        conf_threshold: "置信度阈值",
        iou_threshold: "交并比阈值",
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
        login_here: "立即登录",
        send_code: "发送验证码",
        verification_code: "验证码",
        enter_email: "请输入邮箱",
        enter_code: "请输入验证码",
        enter_password: "请输入密码",
        enter_username: "请输入用户名",
        invalid_email: "请输入有效的邮箱地址",
        resend_after: "{{seconds}}秒后重发",
        send_code_failed: "验证码发送失败，请重试",
        send_failed: "发送失败",
        logout: "退出登录",
        errors: {
            username_exists: "用户名已存在",
            email_exists: "邮箱已注册",
            code_expired: "验证码已过期",
            code_invalid: "验证码错误",
            registration_failed: "注册失败",
            wrong_username_or_password: "用户名或密码错误"
        },
        all_categories: "全部类别",
        apply_filter: "应用筛选",
        export_csv: "导出CSV",
        detection_time: "检测时间",
        parameters: "参数设置",
        coordinates: "坐标范围",
        class_0: "无肿瘤",
        class_1: "神经胶质瘤",
        class_2: "脑膜瘤",
        class_3: "垂体瘤",
        class_4: "占位性病变",
        previous: "上一页",
        next: "下一页",
        no_history: "暂无检测记录",
        // delete_confirm: "确定要删除此记录吗？",
        delete_confirm_title: "确认删除",
        delete_confirm_text: "确定要删除此记录吗？",
        confirm: "确定",
        cancel: "取消",
        export_single: "导出 CSV",
        class: "类别",
        confidence: "置信度",
        original_image: "原图",
        result_image: "结果图",
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


// 动态内容刷新函数
function refreshDynamicContent() {
    // if (latestResults.length > 0) {
    //     renderResults(latestResults); // 使用最新数据重新渲染
    // }
    // 改为使用事件机制
    const event = new CustomEvent('languageChanged');
    document.dispatchEvent(event);
}


export function t(key, params = {}) {
    // 支持嵌套结构（如 errors.username_exists）
    const keys = key.split('.');
    let value = translations[currentLang];

    // 逐级获取嵌套值
    for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
    }

    // 处理未找到翻译的情况
    let translation = value !== undefined ? value : `[${key}]`;

    // 替换参数占位符
    Object.keys(params).forEach(param => {
        translation = translation.replace(
            new RegExp(`{{${param}}}`, 'g'),
            params[param]
        );
    });

    return translation;
}

export function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    // placeholder翻译
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    // 错误信息翻译
    document.querySelectorAll('[data-i18n-error]').forEach(el => {
        const errorKey = el.getAttribute('data-i18n-error');
        el.textContent = t(`errors.${errorKey}`);
    });
    // 特殊处理页面标题
    document.title = t('title');

    document.querySelector('.current-language').textContent =
        currentLang === 'zh' ? '中文' : 'English';
}