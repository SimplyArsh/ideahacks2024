import sys 
import io
import cv2
import base64 
import numpy as np
from PIL import Image


binaryData = sys.argv[1]
print("1")

# Take in base64 string and return PIL image
def stringToImage(base64_string):
    imgdata = base64.b64decode(base64_string)
    return Image.open(io.BytesIO(imgdata))


# convert PIL Image to an RGB image( technically a numpy array ) that's compatible with opencv
def toRGB(image):
    return cv2.cvtColor(np.array(image), cv2.COLOR_BGR2RGB)


try:
    image = stringToImage(binaryData)
    print("2")

    rgb = toRGB(image)
    print("3")
except:
    the_type, the_value, the_traceback = sys.exc_info()
    print(the_type)



print(type(rgb))


sys.stdout.flush()