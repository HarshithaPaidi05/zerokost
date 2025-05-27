from flask import Flask, render_template, request, redirect, url_for, send_file, jsonify
import os
from transformers import AutoTokenizer, AutoModelForCausalLM
import time
import pygame
import speech_recognition as sr
from gtts import gTTS
from datetime import datetime
from googletrans import Translator
import torch
import tempfile
import google.generativeai as genai
import pymupdf  # Changed from fitz to pymupdf
from dotenv import load_dotenv
from fpdf import FPDF
import traceback

app = Flask(__name__)
pygame.mixer.init()

# ========== Configuration ==========
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in .env file")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

# ========== Translator Configuration ==========
LANGUAGES = {
    "English": "en", "Hindi": "hi", "Kannada": "kn", "Marathi": "mr", "Tamil": "ta",
    "Telugu": "te", "Spanish": "es", "French": "fr", "Haryanvi": "bgc", "Arabic": "ar",
    "Bengali": "bn", "Chinese": "zh", "German": "de", "Japanese": "ja", "Portuguese": "pt",
    "Russian": "ru", "Urdu": "ur", "Punjabi": "pa", "Gujarati": "gu", "Malayalam": "ml",
    "Odia": "or", "Italian": "it", "Dutch": "nl", "Korean": "ko", "Turkish": "tr", 
    "Vietnamese": "vi", "Thai": "th"
}

history_file = "translated_output.txt"

# ========== Utility Functions ==========

# ========== GPT-2 Summarizer ==========
class ConversationAnalyzer:
    def __init__(self, model_name="gpt2"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name).to(self.device)

        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

    def analyze_conversation(self, conversation_text, max_length=200, temperature=0.7):
        prompt = f"""Analyze the following doctor-patient conversation and provide a structured summary:
        1. Identify the patient's main concerns or symptoms
        2. Note any diagnoses or assessments made by the doctor
        3. List any recommended treatments or next steps
        4. Highlight important follow-up information
        
        Conversation:
        {conversation_text.strip()}
        
        Analysis Summary:
        """
        input_ids = self.tokenizer.encode(prompt, return_tensors="pt").to(self.device)

        with torch.no_grad():
            output = self.model.generate(
                input_ids,
                max_length=len(input_ids[0]) + max_length,
                temperature=temperature,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id,
                no_repeat_ngram_size=2
            )

        full_output = self.tokenizer.decode(output[0], skip_special_tokens=True)
        summary_start = full_output.find("Analysis Summary:") + len("Analysis Summary:")
        summary = full_output[summary_start:].strip()

        if "Conversation:" in summary:
            summary = summary.split("Conversation:")[0].strip()

        return summary

# Globals
model_processor = None
current_model_name = None
translator_engine = Translator()

# ========== Utility Functions ==========
def get_language_code(language_name):
    return LANGUAGES.get(language_name, "en")

def recognize_speech():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        recognizer.pause_threshold = 1
        audio = recognizer.listen(source, phrase_time_limit=10)
    try:
        print("Recognizing...")
        return recognizer.recognize_google(audio)
    except sr.UnknownValueError:
        return ""
    except sr.RequestError as e:
        return f"Speech Recognition Error: {e}"

def translate_text(text, target_lang_code):
    try:
        translated = translator_engine.translate(text, dest=target_lang_code)
        return translated.text
    except Exception as e:
        print(f"Error in translate_text: {e}")
        return "[Translation error]"

def speak_text(text, lang_code):
    """Wrapper function that uses text_to_voice"""
    text_to_voice(text, lang_code)

def translate_and_speak(speaker, target_lang_name):
    target_lang_code = get_language_code(target_lang_name)
    spoken_text = recognize_speech()
    if not spoken_text:
        return f"{speaker} said nothing or speech could not be recognized."

    translated = translate_text(spoken_text, target_lang_code)
    speak_text(translated, target_lang_code)

    timestamp = datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
    with open(history_file, "a", encoding="utf-8") as f:
        f.write(f"{timestamp} {speaker} said: {spoken_text}\n")
        f.write(f"{timestamp} Translated: {translated}\n")

    return f"{timestamp} {speaker} said: {spoken_text}\n{timestamp} Translated: {translated}"
def text_to_voice(text_data, to_language):
    """Convert text to speech and play it"""
    try:
        # Create a temporary file with a unique name
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_audio:
            temp_path = temp_audio.name
        
        # Generate speech and save to temp file
        myobj = gTTS(text=text_data, lang=to_language, slow=False)
        myobj.save(temp_path)
        
        # Play the audio
        audio = pygame.mixer.Sound(temp_path)
        audio.play()
        
        # Wait for playback to finish
        time.sleep(audio.get_length())
        
        # Clean up
        pygame.mixer.stop()
        os.remove(temp_path)
        
    except Exception as e:
        print(f"Error in text_to_voice: {e}")
        if os.path.exists(temp_path):
            os.remove(temp_path)

def read_conversation_history():
    conversation = []
    try:
        with open(history_file, "r", encoding="utf-8") as f:
            lines = f.readlines()
            for i in range(0, len(lines), 2):
                if i + 1 < len(lines):
                    line1 = lines[i].strip()
                    line2 = lines[i + 1].strip()
                    speaker = "doctor" if "Doctor said" in line1 else "patient" if "Patient said" in line1 else "unknown"
                    text_part = line2.split("Translated: ")[1] if "Translated: " in line2 else line2
                    timestamp = line2.split("]")[0] + "]" if "]" in line2 else ""
                    conversation.append({"speaker": speaker, "text": f"{timestamp} {text_part}"})
    except FileNotFoundError:
        conversation = []
    return conversation

def extract_text(file):
    """Extract text from uploaded PDF or text file"""
    try:
        if file.filename.endswith(".pdf"):
            # Open PDF document from file stream
            doc = pymupdf.open(stream=file.read(), filetype="pdf")
            text = []
            for page in doc:
                text.append(page.get_text())
            return "\n".join(text)
        
        elif file.filename.endswith(".txt"):
            return file.read().decode("utf-8")
        
        else:
            return f"Unsupported file type: {file.filename.split('.')[-1]}"
            
    except Exception as e:
        print(f"Error extracting text: {e}")
        return f"Error reading file: {str(e)}"

# ========== Routes ==========
@app.route("/")
def home():
    return redirect(url_for("translator"))

@app.route("/translator", methods=["GET", "POST"])
def translator():
    message, sender = "", ""
    doctor_lang = "English"
    patient_lang = "Hindi"

    if request.method == "POST":
        doctor_lang = request.form.get("doctor_lang", "English")
        patient_lang = request.form.get("patient_lang", "Hindi")
        action = request.form.get("action")

        if action == "doctor":
            sender = "doctor"
            message = translate_and_speak("Doctor", patient_lang)
        elif action == "patient":
            sender = "patient"
            message = translate_and_speak("Patient", doctor_lang)
        elif action == "clear":
            open(history_file, "w").close()
            return redirect(url_for("translator"))

    conversation = read_conversation_history()
    return render_template("translator.html",
                         message=message,
                         sender=sender,
                         doctor_lang=doctor_lang,
                         patient_lang=patient_lang,
                         languages=LANGUAGES,
                         conversation=conversation)

@app.route("/download_file")
def download_file():
    return send_file(history_file, as_attachment=True)

@app.route("/llm", methods=["GET", "POST"])
def llm():
    global model_processor, current_model_name

    if request.method == "POST":
        text = request.form.get("text", "")
        model_name = request.form.get("model", "gpt2")
        max_length = int(request.form.get("max_length", 150))
        temperature = float(request.form.get("temperature", 0.7))

        if not text.strip():
            return render_template("llm.html", available_models=["gpt2"], default_model=model_name, default_length=max_length, default_temp=temperature, error="Input text is empty")

        if model_processor is None or current_model_name != model_name:
            try:
                model_processor = ConversationAnalyzer(model_name)
                current_model_name = model_name
            except Exception as e:
                return render_template("llm.html", available_models=["gpt2"], default_model=model_name, default_length=max_length, default_temp=temperature, error=str(e))

        try:
            summary = model_processor.analyze_conversation(text, max_length=max_length, temperature=temperature)
            timestamp = datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
            formatted_output = f"""=== Conversation Analysis Report ===
Timestamp: {timestamp}
Model: {model_name}
Temperature: {temperature}

--- Summary ---
{summary}
"""
            return render_template("llm.html", available_models=["gpt2"], default_model=model_name, default_length=max_length, default_temp=temperature, result=formatted_output)
        except Exception as e:
            return render_template("llm.html", available_models=["gpt2"], default_model=model_name, default_length=max_length, default_temp=temperature, error=str(e))

    return render_template("llm.html", available_models=["gpt2"], default_model="gpt2", default_length=150, default_temp=0.7)

@app.route("/chatbot", methods=["GET", "POST"])
def chatbot():
    return render_template("chatbot.html")
    

@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
            
        uploaded_file = request.files['file']
        
        if uploaded_file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Validate file extension
        if not (uploaded_file.filename.endswith('.pdf') or uploaded_file.filename.endswith('.txt')):
            return jsonify({"error": "Invalid file type. Only PDF and TXT allowed"}), 400

        # Read file content safely
        file_content = ""
        try:
            if uploaded_file.filename.endswith('.pdf'):
                doc = pymupdf.open(stream=uploaded_file.read(), filetype="pdf")
                file_content = "\n".join([page.get_text() for page in doc])
            else:
                file_content = uploaded_file.read().decode('utf-8')
        except Exception as e:
            return jsonify({"error": f"Error reading file: {str(e)}"}), 400

        if not file_content.strip():
            return jsonify({"error": "Empty file content"}), 400

        prompt = """Analyze this doctor-patient conversation and extract the following information:
        - Patient Name: [extract full name]
        - Age: [extract age]
        - Symptoms: [list all symptoms]
        - Diagnosis: [medical condition]
        - Prescribed Medication: [list medications]
        - Follow-up Date: [extract date if mentioned]

        Return the information in this exact format:
        Patient Name: [value]
        Age: [value]
        Symptoms: [value]
        Diagnosis: [value]
        Prescribed Medication: [value]
        Follow-up Date: [value]

        Conversation:
        """ + file_content[:2000]  # Limit to first 2000 characters

        try:
            response = model.generate_content(prompt)
            if not response.text:
                raise ValueError("Empty response from AI model")
                
            extracted = response.text

            # Generate PDF
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", size=12)
            
            # Add title
            pdf.cell(200, 10, txt="Medical Consultation Summary", ln=1, align='C')
            pdf.ln(10)
            
            # Add extracted content
            for line in extracted.splitlines():
                if ':' in line:  # Only process lines with field: value format
                    field, value = line.split(':', 1)
                    pdf.set_font("Arial", 'B', 12)
                    pdf.cell(50, 10, txt=f"{field}:", ln=0)
                    pdf.set_font("Arial", '', 12)
                    pdf.multi_cell(0, 10, txt=value.strip())
                    pdf.ln(5)

            # Save to temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
                pdf.output(temp_pdf.name)
                temp_path = temp_pdf.name

            return jsonify({
                "success": True,
                "form_data": extracted,
                "download_link": f"/download_report?file={os.path.basename(temp_path)}"
            })

        except Exception as e:
            traceback.print_exc()
            return jsonify({"error": str(e)}), 500

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# @app.route('/chatbots')
# def chatbots():
#     return render_template("chatbots.html")

@app.route("/download_report")
def download_report():
    try:
        file_name = request.args.get("file")
        if not file_name:
            return "Missing file name", 400

        # Security: Only allow files from temp directory with .pdf extension
        if not file_name.endswith('.pdf'):
            return "Invalid file type", 400

        temp_dir = tempfile.gettempdir()
        file_path = os.path.join(temp_dir, file_name)
        
        if not os.path.exists(file_path):
            print(f"File not found at: {file_path}")  # Debug
            print(f"Temp directory contents: {os.listdir(temp_dir)}")  # Debug
            return "File not found", 404

        print(f"Serving file from: {file_path}")  # Debug
        return send_file(
            file_path,
            as_attachment=True,
            download_name="medical_report.pdf",
            mimetype='application/pdf'
        )
        
    except Exception as e:
        print(f"Download error: {e}")
        traceback.print_exc()
        return f"Download error: {str(e)}", 500

# ========== Run Flask App ==========
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
    