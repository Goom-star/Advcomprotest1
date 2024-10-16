import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import styles from '../styles/Calendar.module.css';
import { useRouter } from 'next/router';

export default function Calendar() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Retrieve user ID from local storage or query params
    let storedUserId = localStorage.getItem('user_id');
    if (router.query.user_id) {
      storedUserId = router.query.user_id;
      localStorage.setItem('user_id', router.query.user_id);
    }
    setUserId(storedUserId);

    if (storedUserId) {
      fetchTasks(storedUserId);
    }
  }, [router.query.user_id]);

  // Fetch tasks for the user
  const fetchTasks = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/tasks/fetch/${userId}`);
      const fetchedTasks = response.data.map(task => ({
        task_id: task.task_id,
        title: task.title,
        due_date: task.due_date,
        description: task.description,
        status: task.status
      }));
      setTasks(fetchedTasks);

      // Create calendar entries for fetched tasks only if they don't already exist
      await Promise.all(fetchedTasks.map(task => checkAndCreateCalendarEntry(userId, task.task_id)));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Check if calendar entry exists, if not create it
  const checkAndCreateCalendarEntry = async (userId, taskId) => {
    try {
      // Check if the calendar entry already exists
      await axios.get(`http://localhost:8000/api/calendar/${userId}`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Entry not found, so create it
        await axios.post('http://localhost:8000/api/calendar', { user_id: userId, task_id: taskId });
        console.log(`Created calendar entry for task ID: ${taskId}`);
      } else {
        console.error('Error checking/creating calendar entry:', error);
      }
    }
  };

  // Render the days of the calendar with tasks
  const renderDays = () => {
    const days = [];
    const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // Adding blank days for previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className={styles.inactiveDay}></div>);
    }

    // Adding days of current month with tasks
    for (let i = 1; i <= lastDay; i++) {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        return (
          taskDate.getDate() === i &&
          taskDate.getMonth() === currentDate.getMonth() &&
          taskDate.getFullYear() === currentDate.getFullYear()
        );
      });

      days.push(
        <div key={i} className={styles.day}>
          <span className={styles.dayNumber}>{i}</span>
          <div className={styles.taskContainer}>
            {dayTasks.map((task, index) => (
              <div key={index} className={styles.taskBox}>
                {task.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <>
      <Head>
        <title>Calendar</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.navButtons}>
            <button onClick={handlePrevMonth}>Previous</button>
            <button onClick={handleToday}>Today</button>
            <button onClick={handleNextMonth}>Next</button>
          </div>
          <h2 className={styles.title}>
            {`${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`}
          </h2>
        </div>

        <div className={styles.calendar}>
          <div className={styles.weekdays}>
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          <div className={styles.days}>{renderDays()}</div>
        </div>
      </div>
    </>
  );
}
