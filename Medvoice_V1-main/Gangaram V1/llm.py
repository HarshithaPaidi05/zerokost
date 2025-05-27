import tkinter as tk
from tkinter import ttk, filedialog, scrolledtext
import os
import threading
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from datetime import datetime
import customtkinter as ctk  


ctk.set_appearance_mode("dark")  
ctk.set_default_color_theme("blue")  

class MedVoiceLLMApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        
        self.title("MedVoice LLM Interface")
        self.geometry("1000x700")
        self.minsize(800, 600)
        
       
        self.file_path = tk.StringVar()
        self.model_name = tk.StringVar(value="gpt2")
        self.temperature = tk.DoubleVar(value=0.7)
        self.max_length = tk.IntVar(value=300)
        self.processor = None
        self.is_processing = False
        
    
        self.create_widgets()
        
        
        self.status_var = tk.StringVar(value="Ready")
        
        
        self.available_models = ["gpt2"]
        
    def create_widgets(self):
       
        main_frame = ctk.CTkFrame(self)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
  
        top_frame = ctk.CTkFrame(main_frame)
        top_frame.pack(fill=tk.X, pady=(0, 20))
        
        
        logo_label = ctk.CTkLabel(top_frame, text="MedVoice", 
                                font=ctk.CTkFont(size=32, weight="bold"))
        logo_label.pack(side=tk.LEFT, padx=10)
        
        subtitle = ctk.CTkLabel(top_frame, text="Doctor-Patient Conversation Analyzer",
                              font=ctk.CTkFont(size=14))
        subtitle.pack(side=tk.LEFT, padx=5)
        
      
        content_frame = ctk.CTkFrame(main_frame)
        content_frame.pack(fill=tk.BOTH, expand=True)
        
  
        left_panel = ctk.CTkFrame(content_frame, width=300)
        left_panel.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10), pady=10)
        left_panel.pack_propagate(False)  
        
       
        model_frame = ctk.CTkFrame(left_panel)
        model_frame.pack(fill=tk.X, padx=10, pady=10)
        
        model_label = ctk.CTkLabel(model_frame, text="LLM Model:", 
                                 font=ctk.CTkFont(weight="bold"))
        model_label.pack(anchor=tk.W, pady=(10, 5))
        self.available_models = ["gpt2"]
        
        model_dropdown = ctk.CTkComboBox(model_frame, values=self.available_models,
                                       variable=self.model_name)
        model_dropdown.pack(fill=tk.X, pady=5)
        

        params_frame = ctk.CTkFrame(left_panel)
        params_frame.pack(fill=tk.X, padx=10, pady=10)
        
        params_label = ctk.CTkLabel(params_frame, text="Generation Parameters:", 
                                  font=ctk.CTkFont(weight="bold"))
        params_label.pack(anchor=tk.W, pady=(10, 5))
        
       
        temp_label = ctk.CTkLabel(params_frame, text="Temperature:")
        temp_label.pack(anchor=tk.W, pady=(10, 0))
        
        temp_frame = ctk.CTkFrame(params_frame, fg_color="transparent")
        temp_frame.pack(fill=tk.X, pady=5)
        
        temp_slider = ctk.CTkSlider(temp_frame, from_=0.1, to=1.5, variable=self.temperature)
        temp_slider.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))
        
        temp_value = ctk.CTkLabel(temp_frame, textvariable=tk.StringVar(value=lambda: f"{self.temperature.get():.1f}"))
        temp_value.pack(side=tk.RIGHT, padx=5)
        
       
        def update_temp_label(*args):
            temp_value.configure(text=f"{self.temperature.get():.1f}")
        
        self.temperature.trace_add("write", update_temp_label)
        update_temp_label()  
        
  
        length_label = ctk.CTkLabel(params_frame, text="Max Output Length:")
        length_label.pack(anchor=tk.W, pady=(10, 0))
        
        length_frame = ctk.CTkFrame(params_frame, fg_color="transparent")
        length_frame.pack(fill=tk.X, pady=5)
        
        length_slider = ctk.CTkSlider(length_frame, from_=50, to=1000, variable=self.max_length)
        length_slider.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))
        
        length_value = ctk.CTkLabel(length_frame, textvariable=tk.StringVar(value=lambda: f"{self.max_length.get()}"))
        length_value.pack(side=tk.RIGHT, padx=5)
        
        def update_length_label(*args):
            length_value.configure(text=f"{self.max_length.get()}")
        
        self.max_length.trace_add("write", update_length_label)
        update_length_label() 
        
      
        file_frame = ctk.CTkFrame(left_panel)
        file_frame.pack(fill=tk.X, padx=10, pady=10)
        
        file_label = ctk.CTkLabel(file_frame, text="Input File:", 
                                font=ctk.CTkFont(weight="bold"))
        file_label.pack(anchor=tk.W, pady=(10, 5))
        
        file_entry = ctk.CTkEntry(file_frame, textvariable=self.file_path)
        file_entry.pack(fill=tk.X, pady=5)
        
        browse_button = ctk.CTkButton(file_frame, text="Browse", command=self.browse_file)
        browse_button.pack(fill=tk.X, pady=5)
        
      
        process_button = ctk.CTkButton(left_panel, text="Analyze Conversation", 
                                     command=self.process_file,
                                     fg_color="#2986cc", hover_color="#1f5e8c")
        process_button.pack(fill=tk.X, padx=10, pady=20)
        
        status_frame = ctk.CTkFrame(left_panel)
        status_frame.pack(fill=tk.X, padx=10, pady=(0, 10))
        self.status_var = tk.StringVar(value="Ready")
        
        status_label = ctk.CTkLabel(status_frame, textvariable=self.status_var)
        status_label.pack(fill=tk.X, padx=5, pady=5)
        
        right_panel = ctk.CTkFrame(content_frame)
        right_panel.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(10, 0), pady=10)
        
        result_label = ctk.CTkLabel(right_panel, text="Analysis Results", 
                                  font=ctk.CTkFont(size=16, weight="bold"))
        result_label.pack(anchor=tk.W, padx=10, pady=10)
        
       
        tab_view = ctk.CTkTabview(right_panel)
        tab_view.pack(fill=tk.BOTH, expand=True, padx=10, pady=(0, 10))
        
        input_tab = tab_view.add("Input Conversation")
        output_tab = tab_view.add("Analysis Summary")
        
    
        self.input_text = ctk.CTkTextbox(input_tab, height=200, wrap="word")
        self.input_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
   
        self.output_text = ctk.CTkTextbox(output_tab, height=200, wrap="word")
        self.output_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        footer_frame = ctk.CTkFrame(main_frame, height=30)
        footer_frame.pack(fill=tk.X, pady=(20, 0))
        
        footer_label = ctk.CTkLabel(footer_frame, text="© 2025 MedVoice | Powered by HuggingFace Transformers")
        footer_label.pack(side=tk.RIGHT, padx=10)
        
    def browse_file(self):
        """Open file dialog to select input text file"""
        filetypes = [("Text files", "*.txt"), ("All files", "*.*")]
        file_path = filedialog.askopenfilename(title="Select Input File", filetypes=filetypes)
        
        if file_path:
            self.file_path.set(file_path)
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    self.input_text.delete("1.0", tk.END)
                    self.input_text.insert("1.0", content)
            except UnicodeDecodeError:
                try:
                    with open(file_path, 'r', encoding='latin-1') as file:
                        content = file.read()
                        self.input_text.delete("1.0", tk.END)
                        self.input_text.insert("1.0", content)
                except Exception as e:
                    self.status_var.set(f"Error reading file: {str(e)}")
            except Exception as e:
                self.status_var.set(f"Error reading file: {str(e)}")
    
    def process_file(self):
        """Process the selected file with the LLM"""
        if self.is_processing:
            return
        
       
        file_path = self.file_path.get()
        if not file_path or not os.path.exists(file_path):
            self.status_var.set("Please select a valid file")
            return
        

        input_text = self.input_text.get("1.0", tk.END)
        
 
        if not input_text.strip():
            self.status_var.set("Input text is empty")
            return
        
        
        self.is_processing = True
        self.status_var.set("Initializing model...")
        
 
        threading.Thread(target=self._process_in_thread, args=(input_text,), daemon=True).start()
    
    def _process_in_thread(self, input_text):
        """Process text in a separate thread"""
        try:
     
            if self.processor is None:
                self.status_var.set(f"Loading model: {self.model_name.get()}")
                self.processor = ConversationAnalyzer(model_name=self.model_name.get())
            
      
            self.status_var.set("Analyzing conversation...")
            generated_text = self.processor.analyze_conversation(
                input_text, 
                max_length=self.max_length.get(), 
                temperature=self.temperature.get()
            )
      
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            formatted_output = f"""=== Conversation Analysis Report ===
Timestamp: {timestamp}
Model: {self.model_name.get()}

--- Summary ---
{generated_text}
"""
            
     
            self.after(0, lambda: self._update_output(formatted_output))
            
        except Exception as e:
            self.after(0, lambda e=e: self.status_var.set(f"Error: {str(e)}"))

        finally:
            self.after(0, lambda: setattr(self, 'is_processing', False))
    
    def _update_output(self, output_text):
        """Update output text area with generated text"""
        self.output_text.delete("1.0", tk.END)
        self.output_text.insert("1.0", output_text)
        self.status_var.set("Analysis complete")

class ConversationAnalyzer:
    def __init__(self, model_name: str = "gpt2"):
        """
        Initialize the conversation analyzer with a pre-trained model.
        
        Args:
            model_name: Name of the pre-trained model (default: "gpt2")
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
  
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name).to(self.device)
        

        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
    
    def analyze_conversation(self, conversation_text: str, max_length: int = 200, temperature: float = 0.7) -> str:
        """
        Analyze a doctor-patient conversation and generate a structured summary.
        
        Args:
            conversation_text: The conversation text to analyze
            max_length: Maximum length of the generated response
            temperature: Controls randomness (lower = more deterministic)
            
        Returns:
            Structured summary of the conversation
        """
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

def main():
    """Main function to run the app"""

    try:
        import customtkinter as ctk
    except ImportError:
        import sys
        import subprocess
        print("Installing CustomTkinter...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "customtkinter"])
        import customtkinter as ctk
    
    app = MedVoiceLLMApp()
    app.mainloop()

if __name__ == "__main__":
    main()