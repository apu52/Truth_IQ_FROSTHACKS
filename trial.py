import fitz  # PyMuPDF for PDFs
import pytesseract
import docx
import os
from PIL import Image

def extract_text_from_pdf(pdf_path):
    """Extracts text from normal PDFs using PyMuPDF."""
    doc = fitz.open(pdf_path)
    text = "\n".join([page.get_text() for page in doc])
    return text if text.strip() else None  # Return None if empty

def extract_text_from_image(image_path):
    """Extracts text from images or scanned PDFs using Tesseract OCR."""
    image = Image.open(image_path)
    return pytesseract.image_to_string(image)

def extract_text_from_docx(docx_path):
    """Extracts text from DOCX files."""
    doc = docx.Document(docx_path)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text(file_path):
    """Automatically detects file type and applies the right OCR method."""
    file_ext = file_path.lower().split(".")[-1]

    if file_ext == "pdf":
        text = extract_text_from_pdf(file_path)
        if text is None:  
            text = extract_text_from_image(file_path)
    
    elif file_ext in ["jpg", "jpeg", "png"]:
        text = extract_text_from_image(file_path)

    elif file_ext == "docx":
        text = extract_text_from_docx(file_path)

    else:
        return "Unsupported file type."

    return text if text else "No text detected."

if __name__ == "__main__":
    file_path = "Arittra Bag - Resume Original.pdf"  # Update with your file path
    extracted_text = extract_text(file_path)
    print(extracted_text)
