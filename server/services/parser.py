import pdfplumber
from docx import Document


def extract_text_from_pdf(file):
    with pdfplumber.open(file) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    return text.strip()


def extract_text_from_docx(file):
    doc = Document(file)
    text = "\n".join(para.text for para in doc.paragraphs if para.text.strip())
    return text.strip()
