import {Link} from "react-router-dom";

export default function NavItem({ to, icon, label }) {
    return (
            <Link
                to={to}
                className="flex items-center space-x-3 p-3 pl-6 rounded-lg hover:bg-gray-300 transition"
            >
                <img src={icon} alt={label} className="w-5 h-5"/>
                <span className="text-black">{label}</span>
            </Link>
    );
}