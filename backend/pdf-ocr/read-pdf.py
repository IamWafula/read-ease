from pdf2image import convert_from_path
import pytesseract
import pandas as pd
import pprint
from PIL import Image, ImageDraw
import numpy as np

import os
import json

# import text analysis service
from text_analysis import generate_analysis, generate_analysis_groq

# async imports
import asyncio
import pickle


async def main():

    def get_page_ref_data(pdf_path):
        # Convert PDF to images
        images = convert_from_path(pdf_path)

        # Initialize a list to store word data
        word_data = []

        # Loop through each page
        page_ref = {}

        for page_num, image in enumerate(images, start=1):
            print(f"Processing page {page_num}...")
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

            page_ref[page_num] = (image, ocr_data)

        return page_ref, word_data

    def create_highlighted_page(image, data, first_word_dict, next_image_data=None):

        # Convert the image to RGB
        image = image.convert("RGB")

        # Create a drawing object
        draw = ImageDraw.Draw(image)

        index = 0
        len_data = len(data)

        # Get the row data to list
        row_data = data.to_dict(orient="records")

        # load next image data
        if next_image_data:
            next_image, next_data = next_image_data
            if next_image is not None and next_data is not None:
                next_row_data = next_data.to_dict(orient="records")

        # dictionary to store words already highlighted
        highlighted_words = {}
        overlays = []

        # TODO: possibly insert routine to check highlight first
        # then another to highlight
        while index < len_data:

            # Create a semi-transparent overlay
            overlay = Image.new("RGBA", image.size, (255, 255, 255, 0))

            # get the next row
            row = row_data[index]

            # check if words in important
            # if not, skip
            row_text = row["text"]

            # covert all to string
            row_text = str(row_text)

            # convert to lowercase
            row_text = row_text.lower()

            # filter out non-alphanumeric characters
            row_text = "".join(filter(str.isalnum, row_text))

            all_present = True

            # check if the word is in the first word dictionary
            if row_text not in first_word_dict:
                index += 1
                continue
            else:
                # check if the rest of the sentence is in the dictionary

                # TODO: check if multiple sentences share the same starter
                full_phrase = first_word_dict[row_text][0]

                # get current data index
                curr_index = index
                curr_phrase_index = 0

                # check if the rest of the sentence is in the dictionary
                while curr_phrase_index < len(full_phrase) and curr_index < len_data:

                    # get the current phrase
                    phrase = full_phrase[curr_phrase_index]

                    # get the next row
                    row = row_data[curr_index]

                    # check if the words are in the phrase
                    row_text = str(row["text"])

                    # filter out non-alphanumeric characters
                    row_text = "".join(filter(str.isalnum, row_text))

                    # convert to lowercase
                    row_text = row_text.lower()

                    # covert all to string
                    row_text = str(row_text)

                    # convert to lowercase
                    row_text = row_text.lower()

                    # filter out non-alphanumeric characters
                    row_text = "".join(filter(str.isalnum, row_text))

                    # check if the word is in the first word dictionary
                    if row_text != phrase:
                        all_present = False
                        break

                    curr_phrase_index += 1
                    curr_index += 1

                if not all_present:
                    index += 1
                    continue

                if all_present:
                    row = row_data[index]

                    for i in range(curr_phrase_index):
                        # Get the bounding box coordinates
                        row = row_data[index + i]

                        left = row["left"]
                        top = row["top"]
                        width = row["width"]
                        height = row["height"]

                        OPACITY = 50
                        # create an overlay with the bounding box
                        overlay_draw = ImageDraw.Draw(overlay)
                        overlay_draw.rectangle(
                            [left, top, left + width, top + height],
                            fill=(229, 235, 52, OPACITY),
                        )

                        # add to highlighted words by location
                        highlighted_words[(left, top)] = row["text"]

                    # Composite the overlay with the original image
                    image = Image.alpha_composite(image.convert("RGBA"), overlay)

                    index += curr_phrase_index

                    continue

            # region deprecated single text draw

            # TODO: check if the rest of the sentence is in the dictionary
            # insert code here to check the rest of the sentence
            # could possibly include multiple pages if the sentence is long, maybe max 2 pages
            # check if the next words are in the dictionary
            # if they whole sentence is in the dictionary, highlight the sentence from the current index

            # # if all_present:
            # # Get the bounding box coordinates
            # left = row["left"]
            # top = row["top"]
            # width = row["width"]
            # height = row["height"]

            # OPACITY = 128
            # # create an overlay with the bounding box
            # overlay_draw = ImageDraw.Draw(overlay)
            # overlay_draw.rectangle(
            #     [left, top, left + width, top + height],
            #     fill=(229, 235, 52, OPACITY),
            # )

            # # Composite the overlay with the original image
            # image = Image.alpha_composite(image.convert("RGBA"), overlay)

            index += 1

            # endregion

        # Convert the image back to RGB
        image = image.convert("RGB")

        return image

    # Path to the PDF file
    pdf_path = "example1.pdf"
    csv_path = "word_data.csv"

    if os.path.exists(csv_path):
        # Read data from CSV
        final_data = pd.read_csv(csv_path)

        # load page reference
        page_ref = {}

        # count number of pages in pages folder
        num_pages = (
            len(
                [
                    name
                    for name in os.listdir("pages")
                    if os.path.isfile(os.path.join("pages", name))
                ]
            )
            // 2
        )

        for page_num in range(1, num_pages + 1):
            # load image
            image = Image.open(f"pages/page_{page_num}.jpg")

            # load ocr data
            with open(f"pages/page_{page_num}.json", "r") as f:
                ocr_data = json.load(f)

            page_ref[page_num] = (image, pd.DataFrame(ocr_data))

    else:
        # Get page reference
        page_ref, word_data = get_page_ref_data(pdf_path)

        # Save page reference
        for page_num, (image, ocr_data) in page_ref.items():

            image.save(f"pages/page_{page_num}.jpg")

            # save ocr data to json
            with open(f"pages/page_{page_num}.json", "w") as f:
                json.dump(ocr_data.to_dict(), f)

        # save word data to csv
        final_data = pd.concat(word_data)
        final_data.to_csv(csv_path, index=False)

    full_text = final_data.text.str.cat(sep=" ")

    # check if text analysis has been done

    if os.path.exists("analysis.pkl"):
        with open("analysis.pkl", "rb") as f:
            analysis = pickle.load(f)
    else:
        # Get analysis
        analysis = await generate_analysis_groq(full_text)
        with open("analysis.pkl", "wb") as f:
            pickle.dump(analysis, f)

    # get topic sentences
    sentences = analysis["sentences"]
    keywords = analysis["keywords"]

    pprint.pprint(analysis)

    # # get individual words words in the sentences
    words_to_highlight = [i for i in sentences if len(i.split()) > 1]

    words_to_highlight = [i.split() for i in words_to_highlight]

    # ensure that words are strings
    words_to_highlight = [[str(i).lower() for i in sts] for sts in words_to_highlight]

    # only retain alphanumeric characters for each word
    words_to_highlight = [
        ["".join(filter(str.isalnum, i)) for i in sts] for sts in words_to_highlight
    ]

    for kword in keywords:
        words_to_highlight.append([kword])

    first_word_dictionary = {}
    for sts in words_to_highlight:
        if sts[0] not in first_word_dictionary:
            first_word_dictionary[sts[0]] = [sts]
        else:
            first_word_dictionary[sts[0]].append(sts)

    # Highlight the words

    idx = 0
    page_ref_items = list(page_ref.items())
    num_pages = len(page_ref_items)

    # limit to the first two pages
    # num_pages = 2

    while idx < num_pages:
        page_num, (image, ocr_data) = page_ref_items[idx]

        width, height = image.size
        print(f"Page {page_num} dimensions: {width} x {height}")

        # Create a highlighted page

        next_image = None
        next_ocr_data = None
        if idx < num_pages - 1:
            nextImage = page_ref_items[idx + 1][1][0]
            next_ocr_data = page_ref_items[idx + 1][1][1]

        highlighted_page = create_highlighted_page(
            image, ocr_data, first_word_dictionary, (nextImage, next_ocr_data)
        )
        # Save the image
        highlighted_page.save(f"highlights/highlighted_page_{page_num}.jpg")

        idx += 1

    # Save to CSV or print
    final_data.to_csv("word_locations.csv", index=False)
    print("Word locations saved to 'word_locations.csv'")


# Run the main function
asyncio.run(main())
