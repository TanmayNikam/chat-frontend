import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Profile from "./pages/profile";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import { useSelector } from "react-redux";
import Loader from "./components/Loader";
import { io } from "socket.io-client";
import AddEditGroup from "./pages/group";
// https://chattome-backend.onrender.com
// https://chattome-backend.onrender.com
const socket = io("https://chattome-backend.onrender.com");

function App() {
  const { loader } = useSelector((state) => state.loaderReducer);
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      {loader && <Loader />}
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute socket={socket}>
                <Home socket={socket} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute socket={socket}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-edit-group"
            element={
              <ProtectedRoute socket={socket}>
                <AddEditGroup socket={socket} />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
