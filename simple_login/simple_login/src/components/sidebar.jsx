import "../app.css"
import { useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();
    console.log("in user dashboard now");

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5000/api/logout", {
                method: "POST",
                credentials: "include"
            });

            navigate("/");
        } catch (error) {
            console.error("logout failed:", error);
        }
    }

    return (
        <aside className="sidebar flex flex-column align-center">
            <h1 className="sidebar__username">Username name</h1>
            <nav className="sidebar__nav flex flex-column">
                <a className="sidebar__link">Task list</a>
                <a className="sidebar__link">Task list 2</a>
                <a className="sidebar__link">Task list 3</a>
            </nav>
            <button className="sidebar__logout font-inter text-colour" onClick={handleLogout}>Log out</button>
        </aside>
    )
}

export default Sidebar;