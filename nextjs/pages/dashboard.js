import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Grid, Typography, Paper, Card, CardContent, Divider } from "@mui/material";

const API_URL = "http://localhost:8000"; // FastAPI Backend URL

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [incompleteTasks, setIncompleteTasks] = useState(0);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      fetchTasks(parseInt(storedUserId));
    }
  }, []);

  // Fetch tasks for the current user
  const fetchTasks = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks/fetch/${userId}`);
      setTasks(response.data);

      const completed = response.data.filter((task) => task.status === "Complete").length;
      const incomplete = response.data.filter((task) => task.status === "Incomplete").length;

      setCompletedTasks(completed);
      setIncompleteTasks(incomplete);

      // Render charts once tasks are fetched
      renderPieChart(completed, incomplete);
      renderBarChart(response.data);
      renderLineChart(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Pie chart for Completed vs Incomplete tasks
  const renderPieChart = (completed, incomplete) => {
    const canvas = document.getElementById("pieChart");
    const ctx = canvas.getContext("2d");
    const total = completed + incomplete;
    const completedAngle = (completed / total) * 2 * Math.PI;
    const incompleteAngle = (incomplete / total) * 2 * Math.PI;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw completed slice
    ctx.beginPath();
    ctx.moveTo(100, 75);
    ctx.arc(100, 75, 75, 0, completedAngle);
    ctx.closePath();
    ctx.fillStyle = "#4caf50"; // Green for completed tasks
    ctx.fill();

    // Draw incomplete slice
    ctx.beginPath();
    ctx.moveTo(100, 75);
    ctx.arc(100, 75, 75, completedAngle, completedAngle + incompleteAngle);
    ctx.closePath();
    ctx.fillStyle = "#f44336"; // Red for incomplete tasks
    ctx.fill();

    // Add text labels in the center of the pie chart
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Completed: ${Math.round((completed / total) * 100)}%`, 100, 70);
    ctx.fillText(`Incomplete: ${Math.round((incomplete / total) * 100)}%`, 100, 90);
  };

  // Bar chart for task priorities
  const renderBarChart = (tasks) => {
    const canvas = document.getElementById("barChart");
    const ctx = canvas.getContext("2d");
    const barWidth = 40;
    const padding = 10;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    tasks.forEach((task, index) => {
      const x = index * (barWidth + padding);
      let height;

      if (task.priority === "High") {
        height = 150;
        ctx.fillStyle = "#f44336"; // Red for high priority
      } else if (task.priority === "Medium") {
        height = 100;
        ctx.fillStyle = "#ff9800"; // Orange for medium priority
      } else {
        height = 50;
        ctx.fillStyle = "#4caf50"; // Green for low priority
      }

      ctx.fillRect(x, canvas.height - height, barWidth, height);

      // Add task title on top of the bar
      ctx.fillStyle = "#000";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(task.title, x + barWidth / 2, canvas.height - height - 10);
    });
  };

  // Line chart for task deadlines with horizontal scrolling
  const renderLineChart = (tasks) => {
    const canvas = document.getElementById("lineChart");
    const ctx = canvas.getContext("2d");

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    tasks.forEach((task, index) => {
      const x = index * (canvas.width / tasks.length) + 50; // Add spacing for each task
      const taskDate = new Date(task.due_date).getTime();
      const y = canvas.height - (taskDate / 100000000000);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Add task due date as label
      ctx.fillStyle = "#000";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(new Date(task.due_date).toLocaleDateString(), x, y - 10);
    });

    ctx.strokeStyle = "#42a5f5"; // Blue line
    ctx.stroke();
  };

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ marginBottom: "30px", fontWeight: "bold", color: "#3f51b5" }}>
        Task Dashboard
      </Typography>

      {/* Display Charts */}
      <Grid container spacing={3}>
        {/* Pie Chart Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: "10px", boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ marginBottom: "10px" }}>
                Completed vs Incomplete Tasks
              </Typography>
              <Divider sx={{ marginBottom: "10px" }} />
              <canvas id="pieChart" width="200" height="150"></canvas>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: "10px", boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ marginBottom: "10px" }}>
                Task Priorities
              </Typography>
              <Divider sx={{ marginBottom: "10px" }} />
              <canvas id="barChart" width="400" height="200"></canvas>
            </CardContent>
          </Card>
        </Grid>

        {/* Line Chart Card with horizontal scrolling */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: "10px", boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ marginBottom: "10px" }}>
                Task Deadlines
              </Typography>
              <Divider sx={{ marginBottom: "10px" }} />
              {/* Wrap canvas in a scrollable container */}
              <Box sx={{ overflowX: "auto" }}>
                <canvas id="lineChart" width="1000" height="200"></canvas>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
