import './App.css';
import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import Homepage from "./components/Homepage.jsx";
import {Route, Routes} from "react-router-dom";
import Category from "./components/Category.jsx";
import EquipmentList from "./components/EquipmentList.jsx";
import Maintenance from "./components/Maintenance.jsx";
import AuthModal from "./components/AuthModal.jsx";
import Borrowing from "./components/Borrowing.jsx";

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
                    <Route path="/users" element={<AuthModal/>}/>
                </Routes>
            </div>
            <Footer/>
        </div>
    );
}

export default App;