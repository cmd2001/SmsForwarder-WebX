import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  TextField,
  Button,
  CssBaseline,
  AppBar,
  Toolbar,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ListItemText,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  fetchLine,
  deleteLine,
  editLine,
} from '../services/api';
import { Line } from '../interfaces/Line';

const LineComponent: React.FC = () => {
  const { lineId } = useParams<{ lineId: string }>();
  const [line, setLine] = useState<Line>();
  const [error, setError] = useState<string | null>(null);
  const [currentEdit, setCurrentEdit] = useState<string | null>(null);
  const [currentEditAttr, setCurrentEditAttr] = useState<string | null>(null);
  const [currentEditAttrDisplay, setCurrentEditAttrDisplay] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const loadLine = async () => {
    try {
      const response = await fetchLine(lineId as string);
      setLine(response);
    } catch (err) {
      setError('Failed to load line.');
    }
  };

  useEffect(() => {
    setOpen(false);
    loadLine();
  }, [lineId]);

  const handleEditSave = () => {
    if (currentEditAttr === 'line_id') {
      deleteLine(lineId as string);
      window.location.href = '/line';
    }
    setOpen(false);
    let newLine = { ...line };
    (newLine as any)[currentEditAttr as string] = currentEdit;
    setLine(newLine as Line);
    setCurrentEdit('');
    setCurrentEditAttr(null);
    setCurrentEditAttrDisplay(null);
    editLine(lineId as string, currentEditAttr as string, currentEdit as string);
  }


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar>
        <Toolbar>
          <Typography variant="h6" component="div"
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}>
            {line?.number}
          </Typography>
          <IconButton
            size="large"
            aria-label="delete"
            color="inherit"
            onClick={() => {
              setCurrentEditAttr('line_id');
              setCurrentEditAttrDisplay('Line ID');
              setCurrentEdit(line?.id as any as string);
              setOpen(true);
            }}
            sx={{ marginLeft: 'auto' }}
          >
            <DeleteIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 3 }} className="box-main">
        <Toolbar />
        {error && (
          <Typography color="error" variant="body2" align="center">
            {error}
          </Typography>
        )}
        <List>
          <ListItem>
            <ListItemText
              primary={line?.id}
              className='listItem-padding'
              secondary='Line ID'
            />
          </ListItem>
          <Divider />
          <ListItem
            secondaryAction={
              <IconButton edge="end" aria-label="edit-number"
                onClick={() => {
                  setCurrentEditAttr('number');
                  setCurrentEditAttrDisplay('Number');
                  setCurrentEdit(line?.number as string);
                  setOpen(true);
                }}
              >
                <EditIcon />
              </IconButton>
            }>
            <ListItemText
              primary={line?.number}
              className='listItem-padding'
              secondary='Number'
            />
          </ListItem>
          <ListItem
            secondaryAction={
              <IconButton edge="end" aria-label="edit-device-mark"
                onClick={() => {
                  setCurrentEditAttr('device_mark');
                  setCurrentEditAttrDisplay('Device Mark');
                  setCurrentEdit(line?.device_mark as string);
                  setOpen(true);
                }}
              >
                <EditIcon />
              </IconButton>
            }>
            <ListItemText
              primary={line?.device_mark}
              className='listItem-padding'
              secondary='Device Mark'
            />
          </ListItem>
          <Divider />
          <ListItem
            secondaryAction={
              <IconButton edge="end" aria-label="edit-sim-slot"
                onClick={() => {
                  setCurrentEditAttr('sim_slot');
                  setCurrentEditAttrDisplay('Sim Slot');
                  setCurrentEdit(line?.sim_slot as any as string);
                  setOpen(true);
                }}
              >
                <EditIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={line?.sim_slot}
              className='listItem-padding'
              secondary='Sim Slot'
            />
          </ListItem>
          <ListItem
            secondaryAction={
              <IconButton edge="end" aria-label="edit-addr"
                onClick={() => {
                  setCurrentEditAttr('addr');
                  setCurrentEditAttrDisplay('Host');
                  setCurrentEdit(line?.addr as string);
                  setOpen(true);
                }}
              >
                <EditIcon />
              </IconButton>
            }>
            <ListItemText
              primary={line?.addr}
              className='listItem-padding'
              secondary='Host'
            />
          </ListItem>
        </List>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Edit {currentEditAttrDisplay}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {(currentEditAttr === 'sim_slot' || currentEditAttr === 'addr') && (
                <Typography color="error">EDITING {currentEditAttrDisplay} IS DANGEROUS AND MAY DAMAGE SENDING</Typography>
              )}
              {(currentEditAttr === 'line_id') && (
                <Typography color="error">ARE YOUR SURE TO DELETE LINE {currentEdit}ALL CONVERSATIONS AND MESSAGES ON THIS LINE WILL BE DELETED</Typography>
              )}
            </DialogContentText>
            {(currentEditAttr !== 'line_id') && (
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label={currentEditAttrDisplay}
                type="text"
                fullWidth
                value={currentEdit}
                onChange={(e) => setCurrentEdit(e.target.value)}
              />)}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={() => setOpen(false)}>
              CANCEL
            </Button>
            <Button
              variant="contained"
              onClick={handleEditSave}
              autoFocus
            >
              {(currentEditAttr !== 'line_id') && ('SAVE')}
              {(currentEditAttr === 'line_id') && ('DELETE')}
            </Button>
          </DialogActions>
        </Dialog>

      </Box >
    </Box >
  );
};

export default LineComponent;
