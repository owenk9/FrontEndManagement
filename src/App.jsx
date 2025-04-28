import './App.css';
import './i18n.js';
import NavBar from './components/UTCManagement/Nav/NavBar.jsx';
import Footer from './components/UTCManagement/Nav/Footer.jsx';
import Homepage from './components/UTCManagement/Home/Homepage.jsx';
import { Route, Routes, useLocation } from 'react-router-dom';
import Category from './components/UTCManagement/Category/Category.jsx';
import EquipmentList from './components/UTCManagement/Equipment/EquipmentList.jsx';
import Maintenance from './components/UTCManagement/Maintenance/Maintenance.jsx';
import Borrowing from './components/UTCManagement/Borrowing/Borrowing.jsx';
import Settings from './components/UTCManagement/Setting/Setting.jsx';
import Location from './components/UTCManagement/Location/Location.jsx';
import Login from './components/UTCManagement/User/Login.jsx';
import ProtectedRoute from './components/UTCManagement/ProtectedRoute.jsx';
import Borrow from "./components/Borrow/Borrow.jsx";

function App() {
    const location = useLocation();
    const isSpecialPage = ['/login', '/borrow'].includes(location.pathname);
    if (isSpecialPage) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/borrow" element={<Borrow />} />
            </Routes>
        );
    }
    return (
        <div>
            <NavBar />
            <div className="flex ml-64 max-h-[100vh]">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Homepage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/category"
                        element={
                            <ProtectedRoute>
                                <Category />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/equipments"
                        element={
                            <ProtectedRoute>
                                <EquipmentList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/maintenance"
                        element={
                            <ProtectedRoute>
                                <Maintenance />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/borrowing"
                        element={
                            <ProtectedRoute>
                                <Borrowing />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/location"
                        element={
                            <ProtectedRoute>
                                <Location />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
            <Footer />
        </div>
    );
}

export default App;