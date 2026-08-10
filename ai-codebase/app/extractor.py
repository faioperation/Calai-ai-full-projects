import os
import pandas as pd
from pypdf import PdfReader
from docx import Document
try:
    import win32com.client
    WIN32_AVAILABLE = True
except ImportError:
    WIN32_AVAILABLE = False

def convert_doc_to_docx(doc_path: str) -> str:
    """Uses Microsoft Word to convert old .doc file into .docx (Windows only)."""
    if not WIN32_AVAILABLE:
        raise RuntimeError(
            "Legacy .doc conversion requires 'pywin32' and Microsoft Word, which are only available on Windows. "
            "Please upload your file as .docx, .pdf, or .txt for Linux VPS deployment."
        )
    
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False

    doc = word.Documents.Open(os.path.abspath(doc_path))
    new_path = doc_path + "x"

    doc.SaveAs(os.path.abspath(new_path), FileFormat=16)
    doc.Close()
    word.Quit()

    return new_path

def extract_text_from_docx(docx_path: str) -> str:
    """Extracts text from a valid .docx file."""
    document = Document(docx_path)
    return "\n".join([para.text for para in document.paragraphs])

def extract_text_from_excel(file_path: str) -> str:
    """Extracts text from an Excel or CSV file."""
    try:
        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
        
        # Convert the dataframe to a clean text representation
        text = df.to_string(index=False)
        return text
    except Exception as e:
        return f"Error extracting from spreadsheet: {str(e)}"

def extract_text(file_path: str) -> str:
    """
    Main extractor supporting PDF, DOCX, DOC, TXT, XLSX, CSV.
    """
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

    if ext == ".docx":
        return extract_text_from_docx(file_path)

    if ext == ".doc":
        converted_path = convert_doc_to_docx(file_path)
        return extract_text_from_docx(converted_path)

    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
            
    if ext in [".xlsx", ".xls", ".csv"]:
        return extract_text_from_excel(file_path)

    raise ValueError("Unsupported file type. Only PDF, DOC, DOCX, TXT, XLSX, CSV are allowed.")

def extract_business_name(rules_text: str, fallback_name: str = "") -> str:
    """
    Extracts the real business name from the uploaded business rules/scripts text.
    Looks for 'Business Name: X' first, then greeting patterns, then falls back.
    """
    import re

    if not rules_text:
        return fallback_name

    # Strategy 1: Look for "Business Name: <name>"
    match = re.search(r'Business Name:\s*(.+)', rules_text, re.IGNORECASE)
    if match:
        name = match.group(1).strip().rstrip('.')
        if name:
            return name

    # Strategy 2: Look for greeting patterns like "welcome to <name>"
    match = re.search(r'welcome to\s+(.+?)[\.,!?\n]', rules_text, re.IGNORECASE)
    if match:
        name = match.group(1).strip()
        if name and len(name) < 60:
            return name

    # Strategy 3: Look for "calling <name>" in greeting scripts
    match = re.search(r'calling\s+(.+?)[\.,!?\n]', rules_text, re.IGNORECASE)
    if match:
        name = match.group(1).strip()
        if name and len(name) < 60:
            return name

    # Fallback: use the provided fallback name (usually business_id)
    return fallback_name


def generate_uk_restaurant_prompt(
    business_id: str,
    business_rules: str,
    menu_text: str,
    special_offers_text: str = "",
    business_name: str = ""
) -> str:
    """
    Generates a UK restaurant system prompt.
    If special offers are empty, the assistant is told that no offers are active.
    Uses business_name (extracted from scripts) for customer-facing references.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    prompt_path = os.path.join(base_dir, "uk_system_prompt.txt")

    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt_template = f.read()

    cleaned_special_offers = (special_offers_text or "").strip()

    if not cleaned_special_offers:
        cleaned_special_offers = (
            "No active special offers are currently configured. "
            "Do not mention, create, suggest, or apply any special offers, discounts, bundles, free drinks, meal deals, or collection discounts."
        )

    # Use business_name if provided, otherwise fall back to business_id
    resolved_name = business_name if business_name else business_id

    prompt = prompt_template.format(
        business_rules=business_rules,
        menu_text=menu_text,
        special_offers_text=cleaned_special_offers,
        business_name=resolved_name
    )

    prompt += f"\n\nCRITICAL INSTRUCTION FOR ENDING THE CALL:\nWhen the order is finalized or the conversation is naturally over, you MUST IMMEDIATELY invoke the endCall tool. Do NOT say goodbye yourself. Do NOT generate any text response. Just trigger the tool directly."

    return prompt
