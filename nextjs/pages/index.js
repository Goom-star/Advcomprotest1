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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/router";

const API_URL = "http://localhost:8000"; // FastAPI Backend URL

function Home() {
  const [tasks, setTasks] = useState([]); // State to store tasks
  const [open, setOpen] = useState(false); // State to manage the Dialog open/close
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Low",  // Initialize with a default value
    completed: "Incomplete",
  });
  //const [newTaskTitle, setNewTaskTitle] = useState("");
  //const [newTaskDescription, setNewTaskDescription] = useState("");
  const [filter, setFilter] = useState("All Tasks"); // Task filter (All, Completed, etc.)
  const router = useRouter();
  const [user_id, setUser_id] = useState(null); // Initialize user_id as null

  // Fetch user_id from localStorage after component mounts
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      setUser_id(storedUserId); // Update user_id
    } else {
      console.error("No user_id found in localStorage.");
    }
  }, []);

  // Fetch tasks from the backend when the component mounts
  useEffect(() => {
    if (user_id) {
      fetchTasks(); // Fetch tasks if user_id is available
    }
  }, [user_id]);

  // Fetch tasks from the FastAPI backend for the current user
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks/fetch/${user_id}`);
      setTasks(response.data); // Set the fetched tasks in state
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Handle opening the modal for adding new tasks
  const handleOpen = () => {
    setOpen(true);
  };

  // Handle closing the modal
  const handleClose = () => {
    setOpen(false);
    resetForm(); // Reset the form when closing the modal
  };

  // Handle input changes in the form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value,
    });
  };

  // Create or Update a Task
  const handleSubmit = async () => {
    if (newTask.title && newTask.description && newTask.dueDate) {
      const taskData = {
        ...newTask,
        user_id: parseInt(user_id),  // Ensure user_id is an integer
        dueDate: newTask.dueDate,    // Ensure this is a date string
        status: newTask.completed === "completed" ? "Complete" : "Incomplete", // Correct status
        priority: newTask.priority,  // Send priority as string
      };
  
      try {
        console.log("Submitting task data:", taskData);
        await axios.post(`${API_URL}/api/tasks/create`, taskData);
        console.log("Task added successfully");
        fetchTasks();  // Refresh tasks
        handleClose(); // Close modal
      } catch (error) {
        if (error.response) {
            // Handle errors returned from the backend
            console.error("Error adding task:", error.response.data);
        } else if (error.request) {
            // Handle network errors (like CORS issues)
            console.error("Network Error", error.request);
        } else {
            console.error("Error", error.message);
        }
      }
    }
  };
  

  // Delete a task
  const handleDeleteTask = async (task_id) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/delete/${task_id}`);
      fetchTasks(); // Refresh tasks after deletion
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Filter tasks based on the selected filter (e.g., Completed, Pending)
  const filteredTasks = tasks.filter((task) => {
    if (filter === "Completed Tasks") return task.status === "Completed";
    if (filter === "Pending Tasks") return task.status === "Incomplete";
    return true; // All Tasks
  });

  // Reset the form
  const resetForm = () => {
    setNewTask({
      title: "",
      description: "",
      priority: "Low",
      dueDate: "",
      completed: false,
    });
  };

  return (
    <>
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
              {/* Add New Task Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  variant="outlined"
                  sx={{
                    padding: "20px",
                    backgroundColor: "#f9f9f9",
                    boxShadow: "none",
                    border: "2px dashed #ccc",
                    borderRadius: "8px",
                    height: "150px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={handleOpen} // Open dialog on clicking this card
                >
                  <Typography variant="h6" sx={{ color: "#aaa" }}>
                    Add New Task
                  </Typography>
                </Card>
              </Grid>

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
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: task.priority === "high" ? "#d9534f" : "#5bc0de" }}>
                        {task.title}
                      </Typography>
                      <Typography variant="body2" sx={{ marginTop: "10px" }}>
                        {task.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ marginTop: "10px" }}>
                        Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ marginTop: "10px" }}>
                        Due Date: {new Date(task.due_date).toLocaleDateString()}
                      </Typography>

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
            value={newTask.priority || "Low"}  // Ensure there is a fallback value
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
            name="dueDate"
            value={newTask.dueDate}
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
            name="completed"
            value={newTask.completed} // Map boolean to string in form
            onChange={(e) => setNewTask({ ...newTask, completed: e.target.value })} // Map selection to boolean
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
    </>
  );
}

export default Home;
