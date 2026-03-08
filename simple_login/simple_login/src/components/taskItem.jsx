import { useState } from "react";

function TaskItem({task, editTask, deleteTask, toggleComplete}) {
    const [isEditing, setIsEditing] = useState(false);
    const [taskName, setTaskName] = useState(task.task);

    return (
        <div className='flex align-center'>
            {isEditing ? 
                <form className="" 
                    onSubmit={(e) => {
                        e.preventDefault() 
                        editTask(task.id, taskName) 
                        setIsEditing(false)
                    }}>

                    <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)}/>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                </form>
                : 
                <>
                    <input className='checkbox' type='checkbox' checked={task.completed} onChange={() => toggleComplete(task.id)}/> 
                    <label className={task.completed ? "taskCompleted" : ""}>
                        {task.task}
                    </label>
                    <button className='editButton' onClick={() => setIsEditing(true)}></button>
                    <button className='deleteButton' onClick={() =>deleteTask(task.id)}></button>
                </>
            }
        </div>
    );
}

export default TaskItem;