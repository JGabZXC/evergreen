import {Menu} from "lucide-react";
import {Link} from "react-router";

export default function StudentNavbar() {
    return (
        <nav className="p-4">
            <div className="dropdown dropdown-button">
                <div tabIndex={0} role="button" className="btn btn-ghost rounded-field"><Menu/></div>
                <ul
                    tabIndex={-1}
                    className="menu dropdown-content bg-base-100 rounded-box z-1 mt-2 w-52 p-2 shadow-sm">
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/dashboard/my-grades">My Grades</Link></li>
                    <li><Link to="/dashboard/my-curriculum">My Curriculum Checklist</Link></li>
                    <li><Link to="/dashboard/my-profile">My Profile</Link></li>
                </ul>
            </div>
        </nav>
    )
}