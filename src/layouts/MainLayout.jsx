import React from 'react';
import Home from '../pages/dashboard/Home';
import { Outlet } from 'react-router';
import Footer from '../components/common/Footer';
import Header from '../components/common/Header';

const MainLayout = () => {
    return (
        <>
            <Header></Header>
            <Outlet></Outlet>
            <Footer></Footer>
        </>
    );
};

export default MainLayout;