import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Drawer,
  Typography,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const API_URL = "http://localhost:8000"; // FastAPI Backend URL

export default function Test() {
  const [tasks, setTasks] = useState([]); // State to store tasks
  const [open, setOpen] = useState(false); // State to manage the Dialog open/close
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "", // Ensure due_date consistency
    priority: "Low",  // Default value
    status: "Incomplete",
  });
  const [filter, setFilter] = useState("All Tasks"); // Task filter (All, Completed, etc.)
  const [user_id, setUser_id] = useState(null); // Store user_id

  // Fetch user_id from localStorage when component mounts
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      setUser_id(parseInt(storedUserId));
    } else {
      console.error("No user_id found in localStorage.");
    }
  }, []);

  // Fetch tasks when user_id is set
  useEffect(() => {
    if (user_id) {
      fetchTasks(); // Fetch tasks if user_id is available
    }
  }, [user_id]);

  // Fetch tasks from the FastAPI backend for the current user
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks/fetch/${user_id}`);
      setTasks(response.data); // Set fetched tasks
      console.log("Fetched tasks:", response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error.response ? error.response.data : error.message);
    }
  };

  // Open modal to add a new task
  const handleOpen = () => {
    setOpen(true);
  };

  // Close modal and reset the form
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // Handle input changes in the form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value,
    });
  };

  // Submit task creation
  const handleSubmit = async () => {
    if (newTask.title && newTask.description && newTask.due_date) {
      const taskData = {
        ...newTask,
        user_id: user_id, // Ensure user_id is included
      };

      try {
        console.log("Submitting task data:", taskData);
        const response = await axios.post(`${API_URL}/api/tasks/create`, taskData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const addedTask = response.data;
        setTasks([...tasks, addedTask]); // Update state with the new task
        console.log("Task added successfully");
        handleClose(); // Close the modal
      } catch (error) {
        console.error("Error adding task:", error.response ? error.response.data : error.message);
      }
    } else {
      console.error("Please fill out all fields before submitting.");
    }
  };

  // Delete task
  const handleDeleteTask = async (task_id) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/delete/${task_id}`);
      setTasks(tasks.filter(task => task.task_id !== task_id)); // Remove task from state
    } catch (error) {
      console.error("Error deleting task:", error.response ? error.response.data : error.message);
    }
  };

  // Update task status
  const handleStatusChange = async (task_id, newStatus) => {
    try {
      const updatedTask = tasks.find(task => task.task_id === task_id);
      updatedTask.status = newStatus;

      console.log(`Updating task ${task_id} for user ${user_id} with status ${newStatus}`);

      await axios.put(`${API_URL}/api/tasks/update/${task_id}`, {
        ...updatedTask,
        user_id: user_id, // Ensure user_id is passed correctly
      });

      setTasks(tasks.map(task => task.task_id === task_id ? updatedTask : task)); // Update state with updated task
    } catch (error) {
      console.error("Error updating task status:", error.response ? error.response.data : error.message);
    }
  };

  // Parse date string for display
  const parseDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const parsedDate = new Date(dateString);
    return !isNaN(parsedDate) ? parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) : 'Invalid Date';
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === "Completed Tasks") return task.status === "Complete";
    if (filter === "Pending Tasks") return task.status === "Incomplete";
    return true; // All Tasks
  });

  // Reset the form
  const resetForm = () => {
    setNewTask({
      title: "",
      description: "",
      priority: "Low",
      due_date: "", // Reset due_date
      status: "Incomplete",
    });
  };

  return (
    <div>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {/* Add New Task Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px", padding: "20px" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{ backgroundColor: "#00b33c", color: "#fff" }}
          >
            Add New Task
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexGrow: 1 }}>
          {/* Sidebar */}
          <Drawer
            variant="permanent"
            sx={{
              width: 240,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: 240,
                boxSizing: "border-box",
                backgroundColor: "#f5f5f5",
                marginTop: "64px",
              },
            }}
          >
            <List>
              <ListItem button selected={filter === "All Tasks"} onClick={() => setFilter("All Tasks")}>
                <ListItemText primary="All Tasks" />
              </ListItem>
              <ListItem button selected={filter === "Completed Tasks"} onClick={() => setFilter("Completed Tasks")}>
                <ListItemText primary="Completed Tasks" />
              </ListItem>
              <ListItem button selected={filter === "Pending Tasks"} onClick={() => setFilter("Pending Tasks")}>
                <ListItemText primary="Pending Tasks" />
              </ListItem>
              <ListItem button selected={filter === "Overdue Tasks"} onClick={() => setFilter("Overdue Tasks")}>
                <ListItemText primary="Overdue Tasks" />
              </ListItem>
            </List>
          </Drawer>

          {/* Task Content */}
          <Box sx={{ flexGrow: 1, padding: "20px", backgroundColor: "#ffffff", minHeight: "100vh" }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "20px" }}>
              {filter}: You have {filteredTasks.length} tasks
            </Typography>

            {/* Task Grid */}
            <Grid container spacing={3}>
              {filteredTasks.map((task) => (
                <Grid item xs={12} sm={6} md={4} key={task.task_id}>
                  <Card
                    variant="outlined"
                    sx={{
                      padding: "20px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                      borderRadius: "8px",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: task.priority === "High" ? "#d9534f" : "#5bc0de" }}>
                        {task.title}
                      </Typography>
                      <Typography variant="body2" sx={{ marginTop: "10px" }}>
                        {task.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ marginTop: "10px" }}>
                        Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ marginTop: "10px" }}>
                        Due Date: {parseDate(task.due_date)} {/* Ensure due_date is used */}
                      </Typography>

                      {/* Task Status Dropdown */}
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.task_id, e.target.value)}
                        >
                          <MenuItem value="Incomplete">Incomplete</MenuItem>
                          <MenuItem value="Complete">Complete</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Delete Task */}
                      <Button variant="outlined" color="error" onClick={() => handleDeleteTask(task.task_id)}>
                        Delete Task
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Add New Task Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="dense"
            name="title"
            value={newTask.title}
            onChange={handleChange}
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            multiline
            rows={3}
            name="description"
            value={newTask.description}
            onChange={handleChange}
          />
          <TextField
            label="Select Priority"
            select
            fullWidth
            margin="dense"
            name="priority"
            value={newTask.priority || "Low"}
            onChange={handleChange}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </TextField>
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            margin="dense"
            name="due_date"
            value={newTask.due_date}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Task Completed"
            select
            fullWidth
            margin="dense"
            name="status"
            value={newTask.status}
            onChange={handleChange}
          >
            <MenuItem value="Incomplete">Incomplete</MenuItem>
            <MenuItem value="Complete">Complete</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
