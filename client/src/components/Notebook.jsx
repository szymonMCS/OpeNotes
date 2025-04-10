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
      if (response.status === 201) {
        setUserNotes(prevNotes => {
          return [...prevNotes, newNote];
        });
      }
    } catch (error) {
      console.error("Error during add process:", error);
    }
  }

  const deleteNote = async (id) => {
    try {
      const response = await axios.delete(`${baseApiURL}/api/delete`, {
        data: { id }
      });
      if (response.status === 200){
        setUserNotes((prevNotes) => {
          return prevNotes.filter((noteItem) => noteItem.noteid !== id);
        });
      }
    } catch (error) {
      console.error("Error during data deletion:", error);
    }
  }

  const editNote = async (data) => {
    try {
      const response = await axios.patch(`${baseApiURL}/api/edit`, {
        data: {
          id: data.id, 
          title: data.title, 
          content: data.content
        }
      });
      if (response.status === 201){
        window.location.reload();
      }
    } catch (error) {
      console.error("Error during data edition:", error);
    }
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
            onEdit={editNote}
          />
        );
      })}
    </div>
  );

}

export default Notebook;