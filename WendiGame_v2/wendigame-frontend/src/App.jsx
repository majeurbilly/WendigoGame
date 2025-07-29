import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import CreateProfilPage from './components/CreateProfilPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/create-profile" element={<CreateProfilPage />} />
            </Routes>
        </Router>
    );
}

export default App;
