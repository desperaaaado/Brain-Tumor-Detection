from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from ultralytics import YOLO
from datetime import datetime
import os

# Initialize Flask app
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['RESULT_FOLDER'] = 'static/results'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB limit

# Load model
model = YOLO('./model/train6_best.pt')

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['RESULT_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg'}


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
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
def serve_result(filename):
    return send_from_directory(app.config['RESULT_FOLDER'], filename)


if __name__ == '__main__':
    app.run(debug=True)
    # TODO 多语言支持
    # TODO 历史记录、按类别筛选功能
