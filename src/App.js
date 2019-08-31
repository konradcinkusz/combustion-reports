import React from 'react';
import { Route } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Home';
import FetchData from './components/FetchData';
import Fuel from './components/Fuel';
import Car from './components/Car';
import CombustionReport from './components/CombustionReport'

export default () => (
    <Layout>
        <Route path='/home' component={Home} />
        <Route path='/fuel' component={Fuel} />
        <Route path='/car' component={Car} />
        <Route exact path='/' component={CombustionReport} />
        <Route path='/fetch-data/:startDateIndex?' component={FetchData} />
    </Layout>
);