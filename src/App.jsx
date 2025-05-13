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
import User from "./components/UTCManagement/User/User.jsx";

function App() {
    const location = useLocation();
    const isSpecialPage = ['/login', '/borrow'].includes(location.pathname);
    if (isSpecialPage) {
        return (
            <Routes>
                <Route
                    path="/login"
                    element={<Login />} />

                <Route
                    path="/borrow"
                    element={
                        <ProtectedRoute requiredAuthorities={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', "ROLE_USER"]}>
                            <Borrow />
                        </ProtectedRoute>
                    }
                    />
            </Routes>
        );
    }
    return (
        <div>
            <NavBar />
            <div className="flex ml-64 max-h-[100vh]">
                <Routes>
                    <Route
                        path="/homepage"
                        element={
                            <ProtectedRoute requiredAuthorities={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
                                <Homepage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/category"
                        element={
                            <ProtectedRoute requiredAuthorities={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
                                <Category />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/equipments"
                        element={
                            <ProtectedRoute requiredAuthorities={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
                                <EquipmentList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/maintenance"
                        element={
                            <ProtectedRoute requiredAuthorities={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
                                <Maintenance />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/borrowing"
                        element={
                            <ProtectedRoute requiredAuthorities={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
                                <Borrowing />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/location"
                        element={
                            <ProtectedRoute requiredAuthorities={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
                                <Location />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/user"
                        element={
                            <ProtectedRoute requiredAuthorities={['ROLE_SUPER_ADMIN']}>
                                <User />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute requiredAuthorities={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
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