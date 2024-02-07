import { ChangeEvent, useState } from "react";
import logo from "./assets/logo.svg";
import { NewNoteCard } from "./components/new-note-card";
import { NoteCard } from "./components/note-card";

interface Note {
  id: string;
  date: Date;
  content: string;
}

export function App() {
  const [search, setSearch] = useState<string>("");
  const [data, setData] = useState<Note[]>(() => {
    const notesOnStorage = localStorage.getItem("notes");
    if (notesOnStorage) {
      return JSON.parse(notesOnStorage);
    } else {
      return [];
    }
  });

  function onNoteCreated(content: string) {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
      date: new Date(),
    };

    const notesArray = [newNote, ...data];

    localStorage.setItem("notes", JSON.stringify(notesArray));
    setData(notesArray);
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;
    setSearch(query);
  }

  function onNoteDeleted(id: string) {
    const notesArray = data.filter((note) => note.id !== id);

    localStorage.setItem("notes", JSON.stringify(notesArray));
    setData(notesArray);
  }

  const filteredNotes =
    search !== ""
      ? data.filter((note) =>
          note.content.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        )
      : data;

  return (
    <div className="mx-auto max-w-6xl xl:px-0 px-5 my-12 space-y-6">
      <img src={logo} alt="NLW expert notes" />
      <form className="w-full">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Busque em suas notas ..."
          className="w-full bg-transparent text-3xl font-semibold tracking-tight placeholder:text-slate-500 outline-none"
        />
      </form>
      <div className="h-px bg-slate-700" />

      <div className="grid lg:grid-cols-3 md:grid-cols-2 auto-rows-[250px] gap-6">
        <NewNoteCard onNoteCreated={onNoteCreated} />
        {filteredNotes.map((note) => (
          <NoteCard onNoteDeleted={onNoteDeleted} key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
