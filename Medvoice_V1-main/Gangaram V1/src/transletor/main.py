import os
import time
import pygame
from flask import Flask, render_template, request, redirect, url_for, send_file
import speech_recognition as sr
from gtts import gTTS
from datetime import datetime
from googletrans import Translator

app = Flask(__name__)
pygame.mixer.init()

LANGUAGES = {
    "English": "en", "Hindi": "hi", "Kannada": "kn", "Marathi": "mr", "Tamil": "ta",
    "Telugu": "te", "Spanish": "es", "French": "fr", "Haryanvi": "bgc", "Arabic": "ar",
    "Bengali": "bn", "Chinese": "zh", "German": "de", "Japanese": "ja", "Portuguese": "pt",
    "Russian": "ru", "Urdu": "ur", "Punjabi": "pa", "Gujarati": "gu", "Malayalam": "ml",
    "Odia": "or", "Italian": "it", "Dutch": "nl", "Korean": "ko", "Turkish": "tr", "Vietnamese": "vi", "Thai": "th"
}

history_file = "translated_output.txt"

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

translator = Translator()

def translate_text(text, target_lang_code):
    try:
        translated = translator.translate(text, dest=target_lang_code)
        return translated.text
    except Exception as e:
        print(f"Error in translate_text: {e}")
        return "[Translation error]"

def speak_text(text, lang_code):
    tts = gTTS(text=text, lang=lang_code)
    tts.save("temp.mp3")
    sound = pygame.mixer.Sound("temp.mp3")
    sound.play()
    time.sleep(sound.get_length())
    os.remove("temp.mp3")

def translate_and_speak(speaker, target_lang_name):
    target_lang_code = get_language_code(target_lang_name)
    spoken_text = recognize_speech()
    if not spoken_text:
        return f"{speaker} said nothing or speech could not be recognized."

    print(f"{speaker} said: {spoken_text}")
    translated = translate_text(spoken_text, target_lang_code)
    print(f"Translated: {translated}")

    speak_text(translated, target_lang_code)

    timestamp = datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
    with open(history_file, "a", encoding="utf-8") as f:
        f.write(f"{timestamp} {speaker} said: {spoken_text}\n")
        f.write(f"{timestamp} Translated: {translated}\n")

    return f"{timestamp} {speaker} said: {spoken_text}\n{timestamp} Translated: {translated}"

@app.route("/", methods=["GET", "POST"])
def index():
    message = ""
    sender = ""
    doctor_lang = "English"
    patient_lang = "Hindi"

    if request.method == "POST":
        doctor_lang = request.form["doctor_lang"]
        patient_lang = request.form["patient_lang"]
        action = request.form["action"]

        if action == "doctor":
            sender = "doctor"
            message = translate_and_speak("Doctor", patient_lang)
        elif action == "patient":
            sender = "patient"
            message = translate_and_speak("Patient", doctor_lang)
        elif action == "clear":
            open(history_file, "w").close()
            return redirect(url_for("index"))

    # Read and parse conversation history
    conversation = []
    try:
        with open(history_file, "r", encoding="utf-8") as f:
            lines = f.readlines()
            for i in range(0, len(lines), 2):
                if i + 1 < len(lines):
                    line1 = lines[i].strip()
                    line2 = lines[i + 1].strip()

            
                    if "Doctor said" in line1:
                        speaker = "doctor"
                    elif "Patient said" in line1:
                        speaker = "patient"
                    else:
                        speaker = "unknown"
                    if "Translated: " in line2:
                        timestamp_part = line2.split("]")[0] + "]"  
                        text_part = line2.split("Translated: ")[1]  
                        cleaned_text = f"{timestamp_part} {text_part}"
                    else:
                        cleaned_text = line2  

                    conversation.append({"speaker": speaker, "text": cleaned_text})
    except FileNotFoundError:
        conversation = []

    return render_template("index.html",
                           message=message,
                           sender=sender,
                           doctor_lang=doctor_lang,
                           patient_lang=patient_lang,
                           languages=LANGUAGES,
                           conversation=conversation)

@app.route("/download")
def download():
    return send_file(history_file, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)
