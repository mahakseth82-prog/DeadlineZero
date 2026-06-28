export class SpeechService {
 private recognition: any = null;
  constructor() {
   const SpeechRecognitionAPI =
  (window as any).SpeechRecognition ||
  (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    this.recognition = new SpeechRecognitionAPI();

    this.recognition.lang = "en-IN";
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
  }

  startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject("Speech Recognition not supported");
        return;
      }

      this.recognition.onresult = (event:any) => {
        resolve(event.results[0][0].transcript);
      };

      this.recognition.onerror = (event:any) => {
        reject(event.error);
      };

      this.recognition.start();
    });
  }
}

export const speechService = new SpeechService();

