import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseApiURL } from "./App";
import CreateArea from "./CreateArea";
import Note from "./Note";

function Notebook({user}){
  const [userNotes, setUserNotes] = useState([]);

  useEffect(() => {
    const fetchUserNotes = async () => {
      try {
        const { data } = await axios.get(
          `${baseApiURL}/api/shownotes`, 
          {withCredentials: true}
        );
        console.log("downloaded data:", data);
        if (data && data.data) {
          setUserNotes(data.data);
        }
      } catch (err) {
        console.error("fetching error", err);
      }
    };
    fetchUserNotes();
  }, []);

  const addNote = async (newNote) => {
    try {
      const response = await axios.post(`${baseApiURL}/api/postnote`, 
        {
          title: newNote.title,
          content: newNote.content,
          userid: user.id,
        },
        { withCredentials: true }
      );
      console.log(response.data);
      if (response.status === 200) {
        setUserNotes(prevNotes => {
          return [...prevNotes, newNote];
        });
      }
    } catch (error) {
      console.error("Error during add process:", error);
    }
  }

  function deleteNote(id) {
    setUserNotes((prevNotes) => {
      return prevNotes.filter((noteItem) => noteItem.noteid !== id);
    });
  }

  return (
    <div>
      <CreateArea onAdd={addNote} />
      {userNotes.map((noteItem) => {
        return (
          <Note
            key={noteItem.noteid}
            id={noteItem.noteid}
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