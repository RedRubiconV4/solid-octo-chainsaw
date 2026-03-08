import {useState, useEffect} from 'react';
import Sidebar from "./sidebar";
import TaskItem from './taskItem';
import CreateTaskBtn from './createTaskBtn';

function Dashboard() {
    // console.log("in user dashboard now");
    const [taskArray, setTaskArray] = useState([]);

    const getTaskList = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/getTaskList", {
                method: "GET",
                credentials: "include"
            })
            const tasklist = await res.json();
            setTaskArray(tasklist.tasks);
            
        } catch (err) {
            console.log("unable to get task list");
            console.error(err);
        }
    }

    useEffect(() => {
        getTaskList();
    }, [])

    const deleteTask = async (taskId) => {
        try {
            await fetch(`http://localhost:5000/api/deleteTask/${taskId}`, {
                method: "DELETE",
                credentials: "include"
            })
            getTaskList()
        } catch (err) {
            console.log("unable to delete task");
            console.error(err);
        }
    }

    const editTask = async (taskId, taskName) => {
        try {
            await fetch(`http://localhost:5000/api/editTask/${taskId}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({task: taskName})
            })

            getTaskList()
        } catch (err) {
            console.log("unable to delete task");
            console.error(err);
        }
    }

    const toggleComplete = async (taskId) => {
        try {
            await fetch(`http://localhost:5000/api/toggleComplete/${taskId}`, {
                method: "PATCH",
                credentials: "include"
            })
            getTaskList()
        } catch (err) {
            console.log("unable to delete task");
            console.error(err);
        }
    }

    const createTask = async (taskName) => {
        try {
            const res = await fetch('http://localhost:5000/api/createTask', {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({task: taskName})
            })

            if (!res.ok) {
                throw new Error('Failed to create task');
            }
            
            getTaskList()
        } catch (err) {
            console.log("unable to delete task");
            console.error(err);
        }
    }

    return (
        <div className="dashboard font-inter flex background-colour text-colour">
            <Sidebar />
            <div className="taskpage flex flex-column align-center">
                <h1 className="task__title">Task list</h1>
                <div className='task__list flex flex-column '>
                    {taskArray.map((task) => (
                        <TaskItem key={task.id} task={task} editTask={editTask} deleteTask={deleteTask} toggleComplete={toggleComplete}/>
                    ))}
                </div>
                <CreateTaskBtn createTaskFn={createTask}/>
            </div>
        </div>
    )
}

export default Dashboard;