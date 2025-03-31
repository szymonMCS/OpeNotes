import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import NoteEditorDialog from "./NoteEditorDialog";

function Note(props) {
  const [isEditing, setIsEditing] = useState(false);

  function handleDeleteClick() {
    props.onDelete(props.id);
  }

  function handleEdition() {
    setIsEditing(true);
  }

  const handleSave = (updatedNote) => {
    props.onEdit(updatedNote);
    setIsEditing(false);
  };

  return (
    <>
      <div className="note">
        <h1>{props.title}</h1>
        <p>{props.content}</p>
        <button onClick={handleDeleteClick}>
          <DeleteIcon />
        </button>
        <button onClick={handleEdition}>
          <ModeEditIcon />
        </button>
      </div>
      <NoteEditorDialog
      open={isEditing}
      onClose={() => setIsEditing(false)}
      note={{ id: props.id, title: props.title, content: props.content }}
      onSave={handleSave}
      />
    </>
  );
}

export default Note;