import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <header>
                    <nav>
                        <ul className="nav-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/page1">Page 1</Link></li>
                            <li><Link to="/page2">Page 2</Link></li>
                        </ul>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/page1" element={<Page1 />} />
                        <Route path="/page2" element={<Page2 />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;