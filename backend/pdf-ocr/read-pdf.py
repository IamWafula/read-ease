from pdf2image import convert_from_path
import pytesseract
import pandas as pd
import pprint
from PIL import Image, ImageDraw
import numpy as np

# Path to the PDF file
pdf_path = "example1.pdf"

# Convert PDF to images
images = convert_from_path(pdf_path)

# Initialize a list to store word data
word_data = []


def create_highlighted_page(image, data):
    # Convert the image to RGB
    image = image.convert("RGB")

    # Create a drawing object
    draw = ImageDraw.Draw(image)

    # Loop through each row in the data
    for index, row in data.iterrows():

        # randomly highlight
        rand_num = np.random.rand()
        if rand_num > 0.3:
            continue

        # Get the bounding box coordinates
        left = row["left"]
        top = row["top"]
        width = row["width"]
        height = row["height"]

        # Draw a rectangle around the word
        draw.rectangle([left, top, left + width, top + height], outline="red", width=2)

    return image


# Loop through each page
page = 1
for page_num, image in enumerate(images, start=1):

    # Print page dimensions
    width, height = image.size

    print(f"Page {page_num} dimensions: {width} x {height}")

    # Get OCR data
    ocr_data = pytesseract.image_to_data(
        image, output_type=pytesseract.Output.DATAFRAME
    )

    # Add the page number to the data
    ocr_data["page"] = page_num

    # Filter out rows without text (confidence = -1)
    ocr_data = ocr_data[ocr_data.conf != -1]

    # Append to word data
    word_data.append(ocr_data)

    page_image = image.convert("RGB")
    draw_page = ImageDraw.Draw(page_image)

    # Loop through each row in the data
    for index, row in ocr_data.iterrows():
        # Get the bounding box coordinates
        left = row["left"]
        top = row["top"]
        width = row["width"]
        height = row["height"]

        # Draw a rectangle around the word
        draw_page.rectangle(
            [left, top, left + width, top + height], outline="red", width=2
        )

    # Save the image
    page_image.save(f"page_{page_num}.jpg")


# Combine data from all pages into a single DataFrame
final_data = pd.concat(word_data, ignore_index=True)

# Save to CSV or print
final_data.to_csv("word_locations.csv", index=False)
print("Word locations saved to 'word_locations.csv'")
