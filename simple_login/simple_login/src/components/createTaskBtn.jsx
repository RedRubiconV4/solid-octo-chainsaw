import { useState } from "react";

function CreateTaskBtn({createTaskFn}) {
    const [isEditing, setIsEditing] = useState(false);
    const [taskName, setTaskName] = useState("");

    return (
        <div className='flex align-center'>
            {isEditing ? 
                <form className="" 
                    onSubmit={(e) => {
                        e.preventDefault() 
                        createTaskFn(taskName) 
                        setIsEditing(false)
                    }}>

                    <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)}/>
                    <button type="submit">Create</button>
                    <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                </form>
                : 
                <>
                    <button className='addBtn' onClick={() => setIsEditing(true)}></button>
                </>
            }
        </div>
    );
}

export default CreateTaskBtn;