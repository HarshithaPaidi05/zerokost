import os
import time
import pygame
import streamlit as st
import speech_recognition as sr
from gtts import gTTS
from googletrans import Translator

from datetime import datetime

# Language map
LANGUAGES = {
    "English": "en", "Hindi": "hi", "Kannada": "kn", "Marathi": "mr", "Tamil": "ta",
    "Telugu": "te", "Spanish": "es", "French": "fr", "Haryanvi": "bgc", "Arabic": "ar",
    "Bengali": "bn", "Chinese": "zh", "German": "de", "Japanese": "ja", "Portuguese": "pt",
    "Russian": "ru", "Urdu": "ur", "Punjabi": "pa", "Gujarati": "gu", "Malayalam": "ml",
    "Odia": "or", "Italian": "it", "Dutch": "nl", "Korean": "ko", "Turkis h": "tr", "Vietnamese": "vi", "Thai": "th"
}
language_mapping = {name.lower(): code for name, code in LANGUAGES.items()}

# Initialize translator and audio
translator = Translator()
pygame.mixer.init()

# Get language code
def get_language_code(language_name):
    return language_mapping.get(language_name.lower(), language_name)

# Translation logic
def translator_function(spoken_text, to_language):
    return translator.translate(spoken_text, src='auto', dest=to_language)

# Text-to-speech
def text_to_voice(text_data, to_language):
    myobj = gTTS(text=text_data, lang=to_language, slow=False)
    myobj.save("cache_file.mp3")
    audio = pygame.mixer.Sound("cache_file.mp3")
    audio.play()
    time.sleep(audio.get_length())  
    os.remove("cache_file.mp3")

# Save translation to txt
def save_to_txt(translated_text):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    speaker = st.session_state.current_speaker
    with open("translated_output.txt", "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {speaker}: {translated_text}\n")



# Main processing loop
def main_process(output_placeholder, doctor_language, patient_language):
    rec = sr.Recognizer()
    with sr.Microphone() as source:
        output_placeholder.text(f"Listening as {st.session_state.current_speaker}...")
        rec.pause_threshold = 1
        audio = rec.listen(source, phrase_time_limit=10)

    try:
        output_placeholder.text("Processing speech...")
        spoken_text = rec.recognize_google(audio)

        # Translate to opposite party's language
        if st.session_state.current_speaker == "Doctor":
            to_language = patient_language
        else:
            to_language = doctor_language

        output_placeholder.text("Translating...")
        translated = translator_function(spoken_text, to_language)
        output_text = translated.text

        output_placeholder.text(f"Translated: {output_text}")
        text_to_voice(output_text, to_language)
        save_to_txt(output_text)

    except Exception as e:
        output_placeholder.text("Error: " + str(e))
        print(e)

# ---------------------------
# Streamlit Interface
# ---------------------------

st.title("Doctor-Patient Multilingual Translator")

# Initialize session state
if "isTranslateOn" not in st.session_state:
    st.session_state.isTranslateOn = False
if "current_speaker" not in st.session_state:
    st.session_state.current_speaker = "Doctor"

# Language selections
doctor_language_name = st.selectbox("Select Doctor's Target Language:", list(LANGUAGES.keys()), key="doctor_lang")
doctor_language = get_language_code(doctor_language_name)

patient_language_name = st.selectbox("Select Patient's Target Language:", list(LANGUAGES.keys()), key="patient_lang")
patient_language = get_language_code(patient_language_name)

# Speaker controls
col1, col2, col3 = st.columns(3)
with col1:
    if st.button("Doctor Speaking"):
        st.session_state.current_speaker = "Doctor"
with col2:
    if st.button("Patient Speaking"):
        st.session_state.current_speaker = "Patient"
with col3:
    if st.button("Start Translation"):
        st.session_state.isTranslateOn = True


if st.button("Stop Translation"):
    st.session_state.isTranslateOn = False
    output_placeholder = st.empty()
    output_placeholder.text("Translation stopped.")



output_placeholder = st.empty()


while st.session_state.get("isTranslateOn", False):
    main_process(output_placeholder, doctor_language, patient_language)
