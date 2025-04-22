from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for, Response
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
import csv
from io import StringIO

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


# 数据库表 检测历史
class DetectionHistory(db.Model):
    __tablename__ = 'detection_history'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    original_image = db.Column(db.String(255), nullable=False)
    result_image = db.Column(db.String(255), nullable=False)
    detection_data = db.Column(db.JSON, nullable=False)  # 存储检测结果数据
    conf_threshold = db.Column(db.Float, nullable=False)
    iou_threshold = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='histories')


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

            # 保存检测结果数据
            detection_data = []
            for box in boxes:
                detection_data.append({
                    'xyxy': box.xyxy.tolist()[0],
                    'conf': box.conf.item(),
                    'cls': box.cls.item(),
                    'class_name': model.names[int(box.cls)]
                })

            # 创建历史记录
            new_history = DetectionHistory(
                user_id=current_user.id,
                original_image=upload_path,
                result_image=result_path,
                detection_data=detection_data,
                conf_threshold=conf,
                iou_threshold=iou
            )
            db.session.add(new_history)

        except Exception as e:
            file_info.update({
                "status": "error",
                "error": str(e)
            })

        # finally:
        #     # Cleanup original file
        #     if os.path.exists(upload_path):
        #         os.remove(upload_path)

        results.append(file_info)

    db.session.commit()
    return jsonify({"results": results})


@app.route('/static/results/<filename>')
@login_required
def serve_result(filename):
    return send_from_directory(app.config['RESULT_FOLDER'], filename)


@app.route('/uploads/<filename>')
@login_required
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/history')
@login_required
def api_history():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    category = request.args.get('category', '')

    # 构建查询
    query = DetectionHistory.query.filter_by(user_id=current_user.id)
    if category:
        # MySQL JSON查询语法
        query = query.filter(
            db.text(f"JSON_CONTAINS(detection_data, :value, '$')")
        ).params(value=f'{{"cls": {int(category)}}}')

    # 分页查询
    pagination = query.order_by(DetectionHistory.created_at.desc()).paginate(page=page, per_page=per_page)

    # 构造JSON响应
    return jsonify({
        'items': [{
            'id': item.id,
            'original_image': item.original_image,
            'result_image': item.result_image,
            'detection_data': item.detection_data,
            'conf_threshold': item.conf_threshold,
            'iou_threshold': item.iou_threshold,
            'created_at': item.created_at.isoformat(),
        } for item in pagination.items],
        'has_prev': pagination.has_prev,
        'has_next': pagination.has_next,
        'total_pages': pagination.pages,
        'current_page': pagination.page
    })


# 删除历史记录
@app.route('/api/history/<int:history_id>', methods=['DELETE'])
@login_required
def delete_history(history_id):
    history = DetectionHistory.query.get_or_404(history_id)
    if history.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    # 删除文件（按需添加）
    # if os.path.exists(history.original_image):
    #     os.remove(history.original_image)
    # if os.path.exists(history.result_image):
    #     os.remove(history.result_image)

    db.session.delete(history)
    db.session.commit()
    return jsonify({"status": "success"})


# 导出历史记录的 CSV 文件
@app.route('/api/history/<int:history_id>/export')
@login_required
def export_single_history(history_id):
    # 获取语言参数
    lang = request.args.get('lang', 'zh')

    history = DetectionHistory.query.get_or_404(history_id)
    if history.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    si = StringIO()
    si.write('\ufeff')
    cw = csv.writer(si)

    # 获取表头翻译
    headers = {
        'en': [
            'Original image', 'Result image', 'Confidence threshold',
            'IOU threshold', 'Class', 'Confidence', 'Coordinates', 'Detection Time'
        ],
        'zh': [
            '原始图像', '结果图像', '置信度阈值',
            '交并比阈值', '类别', '置信度', '坐标范围', '检测时间'
        ]
    }.get(lang, 'zh')  # 默认中文

    # 写入动态表头
    cw.writerow(headers)

    # 公共数据
    base_data = [
        os.path.basename(history.original_image),
        os.path.basename(history.result_image),
        f"{history.conf_threshold:.2f}",
        f"{history.iou_threshold:.2f}",
        history.created_at.strftime('%Y-%m-%d %H:%M:%S')
    ]

    # 填充检测数据
    for detection in history.detection_data:
        cw.writerow([
            base_data[0],  # Original image
            base_data[1],  # Result image
            base_data[2],  # conf threshold
            base_data[3],  # iou threshold
            detection['class_name'],
            f"{detection['conf']:.4f}",
            f"{detection['xyxy']}",
            base_data[4]  # Detection Time
        ])

    output = si.getvalue().encode('utf-8-sig')
    return Response(
        output,
        mimetype="text/csv; charset=utf-8-sig",
        headers={"Content-disposition": f"attachment; filename=detection_{history_id}_{lang}.csv"}
    )


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # 创建数据库表

    app.run(debug=True)
    # TODO 将检测结果的详细数据(xyxy,class,class_id,confidence,etc)导出为csv等
    # TODO 历史记录、按类别筛选功能
