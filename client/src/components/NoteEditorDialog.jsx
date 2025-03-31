import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";


function NoteEditorDialog({ open, onClose, note, onSave }) {
  const [content, setContent] = useState(note?.content || "");
  const [title, setTitle] = useState(note?.title || "");

  useEffect(() => {
    if (open && note) {
      setContent(note.content);
      setTitle(note.title);
    }
  }, [open, note]);

  const handleSave = () => {
    onSave({ ...note, title, content });
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>Eit note</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="outlined"
        />
        <TextField
          margin="dense"
          label="Content"
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NoteEditorDialog;