import {t, applyTranslations} from "./i18n.js";

document.getElementById('sendCodeBtn').addEventListener('click', async () => {
    const btn = document.getElementById('sendCodeBtn');
    const emailInput = document.getElementById('email');
    const email = emailInput.value;

    // 简单邮箱格式验证
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        alert(t('invalid_email'));
        return;
    }

    // 禁用按钮
    btn.disabled = true;
    let countdown = 60;

    // 更新按钮文字
    const updateButtonText = () => {
        btn.innerHTML = t('resend_after', {seconds: countdown});
    };

    // 开始倒计时
    const timer = setInterval(() => {
        countdown--;
        updateButtonText();

        if (countdown <= 0) {
            clearInterval(timer);
            btn.disabled = false;
            btn.innerHTML = '<span data-i18n="send_code"></span>';
            applyTranslations(); // 重新应用语言翻译
        }
    }, 1000);

    try {
        const response = await fetch('/send_verification_code', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email})
        });

        if (!response.ok) {
            throw new Error(t('send_failed'));
        }

        updateButtonText();
    } catch (error) {
        alert(t('send_code_failed'));
        clearInterval(timer);
        btn.disabled = false;
        btn.innerHTML = '<span data-i18n="send_code"></span>';
        applyTranslations();
    }
});


// 通用错误处理
function initErrorHandling() {
    // 自动消失逻辑
    document.querySelectorAll('[data-auto-dismiss]').forEach(alert => {
        const delay = parseInt(alert.dataset.autoDismiss) || 3000;
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300); // 渐隐动画
        }, delay);
    });

    // 清除已有错误（当用户开始输入时）
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            document.querySelector('.alert')?.remove();
        });
    });
}

// 在DOM加载后调用
document.addEventListener('DOMContentLoaded', initErrorHandling);