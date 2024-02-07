import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, MouseEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void;
}

let SpeechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] =
    useState<boolean>(true);
  const [content, setContent] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!isSpeechRecognitionAPIAvailable) {
      toast.error("Infelizmente, seu navegador não suporta!");
      return;
    }
    setIsRecording(true);
    setShouldShowOnboarding(false);

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    SpeechRecognition = new SpeechRecognitionAPI();

    SpeechRecognition.lang = "pt-BR";
    SpeechRecognition.continuous = true;
    SpeechRecognition.maxAlternatives = 1;
    SpeechRecognition.interimResults = true;

    SpeechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");

      setContent(transcription);
    };

    SpeechRecognition.onerror = (error) => {
      console.log(error);
    };

    SpeechRecognition.start();
  }

  function handleStopRecording() {
    SpeechRecognition?.stop();
    setIsRecording(false);
  }

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);
    if (event.target.value === "") {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    onNoteCreated(content);
    setContent("");
    setShouldShowOnboarding(true);
    toast.success("Nota criada com sucesso!");
  }
  
  return (
    <Dialog.Root>
      <Dialog.Trigger className="bg-slate-700 text-left overflow-hidden rounded-md outline-none flex flex-col p-5 space-y-3 relative  hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <span className="text-sm text-slate-200 font-medium">
          Adicionar nota
        </span>
        <p className="text-slate-400 text-sm leading-6">
          Grave uma nota em áudio que será convertida para texto
          automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50" />
        <Dialog.Content className="overflow-hidden z-10  bg-slate-700 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:max-w-[640px] md:w-full w-screen  md:h-[60vh] h-screen md:rounded-md flex flex-col outline-none">
          <Dialog.Close
            className="absolute top-0 right-0 bg-slate-800 p-1.5 text-slate-400"
            onClick={() => {
              setContent("");
              setShouldShowOnboarding(true);
            }}
          >
            <X className="size-5" />
          </Dialog.Close>
          <form className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className="text-sm text-slate-200 font-medium">
                Adicionar nota
              </span>
              {shouldShowOnboarding ? (
                <p className="text-slate-400 text-sm leading-6">
                  Comece{" "}
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="font-medium text-lime-400 hover:underline"
                  >
                    gravando uma nota
                  </button>{" "}
                  em áudio ou se preferir{" "}
                  <button
                    type="button"
                    onClick={handleStartEditor}
                    className="font-medium text-lime-400 hover:underline"
                  >
                    utilize apenas texto
                  </button>
                  .
                </p>
              ) : (
                <textarea
                  className="text-sm bg-transparent flex-1 resize-none outline-none text-slate-400 leading-6"
                  autoFocus
                  onChange={handleContentChanged}
                  value={content}
                ></textarea>
              )}
            </div>
            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className=" w-full bg-slate-900 py-4 flex items-center justify-center gap-3 text-center text-sm text-slate-300 outline-none font-medium hover:bg-slate-950"
              >
                <div className="size-2 bg-red-500 rounded-full animate-pulse" />
                Gravando! ( clique p/ interromper )
              </button>
            ) : (
              <button
                type="button"
                disabled={content ? false : true}
                onClick={handleSaveNote}
                className=" w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500 disabled:bg-lime-800"
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
