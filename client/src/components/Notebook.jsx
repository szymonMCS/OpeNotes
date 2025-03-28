import React, { useState } from "react";
import CreateArea from "./CreateArea";
import axios from "axios";
import { baseApiURL } from "./App";

function Notebook({ user }){
  const [notes, setNotes] = useState([]);


  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await axios.get(`${baseApiURL}/api/check-session`);
        if (data.loggedIn) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("session error", err);
      }
    };
    fetchSession();
  }, []);

  function addNote(newNote) {
    setNotes(prevNotes => {
      return [...prevNotes, newNote];
    });
  }

  function deleteNote(id) {
    setNotes(prevNotes => {
      return prevNotes.filter((noteItem, index) => {
        return index !== id;
      });
    });
  }

  return (
    <div>
      <CreateArea onAdd={addNote} />
      {notes.map((noteItem, index) => {
        return (
          <Note
            key={index}
            id={index}
            title={noteItem.title}
            content={noteItem.content}
            onDelete={deleteNote}
          />
        );
      })}
    </div>
  );

}

export default Notebook;