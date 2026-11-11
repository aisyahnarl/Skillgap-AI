import sys
import os
import json

def extract_pdf_text(file_path):
    try:
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        text = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text.append(t)
        return "\n".join(text)
    except Exception as e:
        return f"[PDF Extraction Error: {str(e)}]"

def extract_docx_text(file_path):
    try:
        import docx
        doc = docx.Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs if p.text])
    except Exception:
        # Fallback manual unzip
        try:
            import zipfile
            import xml.etree.ElementTree as ET
            with zipfile.ZipFile(file_path) as z:
                xml_content = z.read('word/document.xml')
                tree = ET.fromstring(xml_content)
                text = []
                for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                    t = ''.join([n.text for n in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if n.text])
                    if t:
                        text.append(t)
                return "\n".join(text)
        except Exception as e:
            return f"[DOCX Extraction Error: {str(e)}]"

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}"}))
        sys.exit(1)

    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    if ext == ".pdf":
        text = extract_pdf_text(file_path)
    elif ext in [".docx", ".doc"]:
        text = extract_docx_text(file_path)
    elif ext in [".txt", ".md"]:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception as e:
            text = str(e)
    else:
        text = f"Unsupported file type: {ext}"

    result = {
        "filePath": file_path,
        "extension": ext,
        "textLength": len(text),
        "text": text
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()
