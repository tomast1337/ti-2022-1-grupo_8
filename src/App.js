import './App.css';
import { Route, Routes} from 'react-router-dom';
import React from 'react';
import Login from './login';
import MenuCliente from './components/Client/menu.js';
import Carrinho from './components/Client/carrinho';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="/criar-pizza" element={<Login />} />
            <Route path="/menu" element={<MenuCliente />} />
        </Routes >
    );
}

export default App;
