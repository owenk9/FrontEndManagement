import './App.css';
import './i18n.js'
import NavBar from "./components/Nav/NavBar.jsx";
import Footer from "./components/Nav/Footer.jsx";
import Homepage from "./components/Home/Homepage.jsx";
import {Route, Routes} from "react-router-dom";
import Category from "./components/Category/Category.jsx";
import EquipmentList from "./components/Equipment/EquipmentList.jsx";
import Maintenance from "./components/Maintenance/Maintenance.jsx";
import AuthModal from "./components/User/AuthModal.jsx";
import Borrowing from "./components/Borrowing/Borrowing.jsx";
import Settings from "./components/Setting/Setting.jsx";
import Location from "./components/Location/Location.jsx";
function App() {

    return (
        <div className="">
            <NavBar/>
            <div className="flex ml-64 max-h-[100vh]">
                <Routes>
                    <Route path="/" element={<Homepage/>}/>
                    <Route path="/category" element={<Category/>}/>
                    <Route path="/equipments" element={<EquipmentList/>}/>
                    <Route path="/maintenance" element={<Maintenance/>}/>
                    <Route path="/borrowing" element={<Borrowing/>}/>
                    <Route path="/location" element={<Location/>}/>
                    <Route path="/settings" element={<Settings/>}/>
                    <Route path="/users" element={<AuthModal/>}/>
                </Routes>
            </div>
            <Footer/>
        </div>
    );
}

export default App;