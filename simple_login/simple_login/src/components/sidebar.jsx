import "../app.css"

function Sidebar() {
    console.log("in user dashboard now");

    return (
        <aside className="sidebar flex flex-column align-center">
            <h1 className="sidebar__username">Username name</h1>
            <nav className="sidebar__nav flex flex-column">
                <a className="sidebar__link">Task list</a>
                <a className="sidebar__link">Task list 2</a>
                <a className="sidebar__link">Task list 3</a>
            </nav>
        </aside>
    )
}

export default Sidebar;