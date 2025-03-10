import homepage from "../assets/homepage3.png";
import maintenance from "../assets/maintenance.png";
import category from "../assets/category2.png";
import borrowing from "../assets/borrowing2.png";
import equipment from "../assets/equipment.png";
import setting from "../assets/setting.png";
import NavItem from "./NavItem.jsx";

export default function NavBar() {
    return (
        <div className="fixed top-0 left-0 h-full min-w-64 bg-gray-100 border-r border-gray-300">
            <div className="flex justify-between flex-col h-screen" >
                <div>
                    <div className="flex items-center justify-center py-4 border-b border-gray-300">
                        <h1 className="text-xl font-bold tracking-wide">UEMS</h1>
                    </div>

                    <nav className="mt-4">
                            <NavItem to="/" icon={homepage} label="Home"/>
                            <NavItem to="/equipments" icon={equipment} label="Equipments"/>
                            <NavItem to="/category" icon={category} label="Category"/>
                            <NavItem to="/maintenance" icon={maintenance} label="Maintenance"/>
                            <NavItem to="/borrowing" icon={borrowing} label="Borrowing"/>
                    </nav>
                </div>
                 <div>
                     <div className="w-full">
                         <NavItem to="/settings" icon={setting} label="Settings" />
                     </div>
                     <div className="w-full text-center text-sm text-gray-700">
                         <div>Authentication</div>
                     </div>
                 </div>
            </div>
        </div>
    );
}
