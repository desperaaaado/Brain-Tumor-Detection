from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename
from ultralytics import YOLO
from datetime import datetime
import os
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import secrets
import random
import string
from collections import defaultdict
import time

verification_codes = defaultdict(dict)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
# app.config['SECRET_KEY'] = 'fixed-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:12345678@localhost/brain-tumor-detection-database'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 邮件配置
app.config['MAIL_SERVER'] = 'smtp.qq.com'  # QQ邮箱SMTP服务器
app.config['MAIL_PORT'] = 465  # SSL端口
app.config['MAIL_USE_SSL'] = True  # 启用SSL
app.config['MAIL_USERNAME'] = '1226875104@qq.com'  # QQ邮箱
app.config['MAIL_PASSWORD'] = 'spwtzidnpgxvgcfh'  # 邮箱授权码（非登录密码）
mail = Mail(app)

# 初始化扩展
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'


# 用户模型
class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['RESULT_FOLDER'] = 'static/results'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB limit

# Load model
model = YOLO('./model/train6_best.pt')

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['RESULT_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg'}


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


# 登录路由
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()

        if user and bcrypt.check_password_hash(user.password_hash, password):
            login_user(user)
            next_page = request.args.get('next')
            if next_page:
                next_page = next_page.split('#')[0]
            return redirect(next_page or url_for('index'))

        return render_template('login.html', error_key='wrong_username_or_password')
    return render_template('login.html')


# 注册路由
@app.route('/register', methods=['GET', 'POST'])
def register():
    current_lang = request.cookies.get('preferredLang', 'zh')

    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        code = request.form.get('code')

        # 验证用户名是否存在
        if User.query.filter_by(username=username).first():
            return render_template('register.html', error_key='username_exists')
        # 验证邮箱是否已注册
        if User.query.filter_by(email=email).first():
            return render_template('register.html', error_key='email_exists')

        # 验证验证码
        stored_data = verification_codes.get(email)
        current_time = time.time()

        # 检查验证码是否存在且未过期
        if not stored_data or current_time > stored_data['expire']:
            return render_template('register.html', error_key='code_expired')
        if stored_data['code'] != code:
            return render_template('register.html', error_key='code_invalid')

        # 验证通过后删除验证码
        del verification_codes[email]

        # 创建用户
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, email=email, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for('login'))
    return render_template('register.html')


@app.route('/send_verification_code', methods=['POST'])
def send_verification_code():
    email = request.json.get('email')

    # 生成6位随机验证码
    code = ''.join(random.choices(string.digits, k=6))

    # 存储验证码（5分钟有效期）
    verification_codes[email] = {
        'code': code,
        'expire': time.time() + 300  # 300秒=5分钟
    }

    # 发送邮件
    msg = Message(
        subject='Your Verification Code',
        sender='1226875104@qq.com',
        recipients=[email]
    )
    msg.body = f'Your verification code is: {code}'
    mail.send(msg)

    return jsonify({'status': 'success'})


# 退出登录
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
@login_required
def index():
    print(f"当前登录用户：{current_user.username}")
    return render_template('index.html', username=current_user.username)


@app.route('/predict', methods=['POST'])
@login_required
def predict():
    if 'files' not in request.files:
        return jsonify({"status": "error", "message": "No files uploaded"}), 400

    files = request.files.getlist('files')
    if len(files) == 0:
        return jsonify({"status": "error", "message": "Empty file list"}), 400

    results = []

    for file in files:
        if not allowed_file(file.filename):
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": "Invalid file type"
            })
            continue

        file_info = {
            "original_filename": secure_filename(file.filename),
            "status": "success",
            "result_url": None,
            "error": None
        }

        if file.filename == '':
            file_info.update({
                "status": "error",
                "error": "Empty filename"
            })
            results.append(file_info)
            continue

        try:
            # Generate unique filenames
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
            safe_filename = f"{timestamp}_{file_info['original_filename']}"

            # Save original file
            upload_path = os.path.join(app.config['UPLOAD_FOLDER'], safe_filename)
            file.save(upload_path)

            # Process prediction
            try:
                # get parameter values
                conf = float(request.form.get('conf', 0.25))
                iou = float(request.form.get('iou', 0.70))

                # parameter validation
                if not (0 <= conf <= 1) or not (0 <= iou <= 1):
                    return jsonify({"error": "invalid_params"}), 400

                # prediction
                pred_results = model.predict(upload_path,
                                             conf=conf,
                                             iou=iou)
                boxes = pred_results[0].boxes
                print('boxes:', boxes)
                for box in boxes:
                    print('xyxy:', box.xyxy.tolist()[0])
                    print('conf:', box.conf.tolist()[0])
                    print('class:', box.cls.tolist()[0])

            except ValueError:
                return jsonify({"error": "invalid_parameter_type"}), 400

            # Save result image
            result_filename = f"result_{safe_filename}"
            result_path = os.path.join(app.config['RESULT_FOLDER'], result_filename)
            pred_results[0].save(result_path)

            file_info["result_url"] = f"/static/results/{result_filename}"

        except Exception as e:
            file_info.update({
                "status": "error",
                "error": str(e)
            })

        finally:
            # Cleanup original file
            if os.path.exists(upload_path):
                os.remove(upload_path)

        results.append(file_info)

    return jsonify({"results": results})


@app.route('/static/results/<filename>')
@login_required
def serve_result(filename):
    return send_from_directory(app.config['RESULT_FOLDER'], filename)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # 创建数据库表

    app.run(debug=True)
    # TODO 将检测结果的详细数据(xyxy,class,class_id,confidence,etc)导出为csv等
    # TODO 历史记录、按类别筛选功能
