from PIL import Image
import cv2
import base64
import io
import torch  
from torch.autograd import Variable
from torchvision import datasets, transforms, models 
import sys


binaryData = sys.argv[1] 
toggle = int(sys.argv[2])

qualityClasses = ["Apple", "Banana", "Beef", "Bread", "Butter", "Chicken", "Lettuce", "Orange"]

qualityModel = torch.load('/Users/arsh/Documents/ucla/winter24/ideahacks2024/backend/assets/OurCNN.pth')
qualityModel.eval()

test_transforms = transforms.Compose([
    transforms.Resize(size=(256*(toggle), 256*toggle)),
    transforms.ToTensor()
])

def predict_Quality(image):
  image_tensor = test_transforms(image).float()

  image_tensor = image_tensor.unsqueeze_(0)
  input_ = Variable(image_tensor)
  input_3 = []
  if (toggle == 2):
    input_2 = torch.tensor_split(input_, 2, dim=2)
    for item in input_2:
        input_3.extend(list(torch.tensor_split(item, 2, dim=3)))

  classifications = []

  if toggle == 1: 
    output = qualityModel(input_)
    index = output.argmax()
    classifications.append(str(qualityClasses[index]))
  else:
    for input in input_3:
        output = qualityModel(input)
        index = output.argmax()
        classifications.append(str(qualityClasses[index]))

  return ','.join(classifications)

def classify(image):
  classifications = predict_Quality(image)
  return classifications
  
def stringToImage(base64_string):
    imgdata = base64.b64decode(base64_string)
    return Image.open(io.BytesIO(imgdata))

pilImage = stringToImage(binaryData)
finalLabel = classify(pilImage)


print(finalLabel)

sys.stdout.flush()