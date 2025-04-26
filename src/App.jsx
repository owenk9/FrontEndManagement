import './App.css';
import './i18n.js';
import NavBar from './components/Nav/NavBar.jsx';
import Footer from './components/Nav/Footer.jsx';
import Homepage from './components/Home/Homepage.jsx';
import { Route, Routes, useLocation } from 'react-router-dom';
import Category from './components/Category/Category.jsx';
import EquipmentList from './components/Equipment/EquipmentList.jsx';
import Maintenance from './components/Maintenance/Maintenance.jsx';
import Borrowing from './components/Borrowing/Borrowing.jsx';
import Settings from './components/Setting/Setting.jsx';
import Location from './components/Location/Location.jsx';
import Login from './components/User/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';
    if (isLoginPage) {
        return <Login />;
    }
    return (
        <div>
            <NavBar/>
            <div className="flex ml-64 max-h-[100vh]">
                <Routes>
                    <Route path="/login" element={<Login />} />
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
           <Footer/>
        </div>
    );
}

export default App;