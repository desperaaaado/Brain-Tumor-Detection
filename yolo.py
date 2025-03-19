import ultralytics
from ultralytics import YOLO
import os

# os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

if __name__ == '__main__':
    ultralytics.checks()
    model = YOLO('yolo11m.pt')  # load a pretrained detection model
    # Train the model
    results = model.train(data="archive.yaml", epochs=100, imgsz=640, patience=30, lr0=1e-4,
                          box=6.0, cls=1.0, dfl=1.8)

    # fine-tuning
    # model = YOLO('./runs/detect/train19/weights/best.pt')
    # results = model.train(data="archive.yaml", epochs=50, imgsz=640, patience=30, lr0=1e-4, cos_lr=True,
    #                       box=6.0, cls=1.0, dfl=1.8, close_mosaic=30, optimizer='AdamW')
    # validate
    # metrics = model.val(data="archive.yaml")
    # print(metrics)

    # Inference using the model
    # model = YOLO("./runs/detect/train5/weights/best.pt")
    # results = model.predict("./datasets/archive/test/images/meningioma_217_jpg.rf.66362d374e2b7e952fd5b9bcdaac4a61.jpg")
    # results[0].save('save.jpg')
