import {useState, useEffect} from 'react';
import Sidebar from "./sidebar";

function Dashboard() {
    // console.log("in user dashboard now");
    const [taskArray, setTaskArray] = useState([]);

    const getTaskList = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/getTaskList", {
                method: "GET"
            })
            const tasklist = await res.json();
            setTaskArray(tasklist);
            
        } catch (err) {
            console.log("unable to get task list");
            console.error(err);
        }
    }

    useEffect(() => {
        getTaskList();
    }, [])

    return (
        <div className="dashboard font-inter flex background-colour text-colour">
            <Sidebar />
            <div className="taskpage flex flex-column align-center">
                <h1 className="task__title">Task list</h1>
                <div className='task__list flex flex-column '>
                    {taskArray.map((task) => (
                        // <li key={task.id}>{task.task}</li>
                        <div className='flex align-center'>
                            <input className='checkbox' type='checkbox' id={task.id}/>
                            <label>{task.task}</label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard;