## Introduction

This is a front-end system for brain tumor detection based on YOLOv11 model.

## Project Structure

```text
Brain-Tumor-Detection/
|
├── static/
|   ├── css/
|   |   ├── auth.css
|   |   ├── sidebar.css
|   |   └── styles.css
|   |
|   ├── images/
|   |   └── icons/
|   |
|   ├── js/
|   |   ├── app.js
|   |   ├── i18n.js
|   |   ├── language.js
|   |   ├── theme.js
|   |   └── verify.js 
|   |
|   └── results/  
|
├── templates/
|   ├── index.html
|   ├── login.html
|   └── register.html
|
├── app.py
├── archive.yaml
├── yolo.py
└── yolo11l.pt        
```

## Model Performance

| Model                                                        | $mAP50$      | $AP_{No\_tumor}50$ | $AP_{glioma}50$ | $AP_{meningioma}50$ | $AP_{pituitary}50$ | $AP_{space-occupying\ lesion}50$ |
| ------------------------------------------------------------ | ------------ | ------------------ | --------------- | ------------------- | ------------------ | -------------------------------- |
| [Baseline](https://universe.roboflow.com/brain-tumor-detection-wsera/tumor-detection-ko5jp/model/3) | $65.0\%$     | **$98\%$**         | $53\%$          | **$94\%$**          | **$80\%$**         | $0\%$                            |
| Ours                                                         | **$67.3\%$** | $97.5\%$           | **$68.7\%$**    | $92.7\%$            | $77.5\%$           | $0\%$                            |

<img src="static/images/PR_curve.png" alt="PR_curve" style="zoom:25%;" />