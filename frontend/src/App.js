
import './App.css';
import Home from './components/Home';
import Footer from './components/layouts/Footer';
import Header from './components/layouts/Header';
import {Route, BrowserRouter as Router, Routes} from 'react-router-dom';
import{HelmetProvider} from 'react-helmet-async';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductDetail from './components/product/ProductDetail';
import ProductSearch from './components/product/ProductSearch';
import Login from './components/user/Login';
import Register from './components/user/Register';
import { useEffect, useState } from 'react';
import store from './store';
import { loadUser } from './actions/userActions';
import Profile from './components/user/Profile';
import UpdateProfile from './components/user/UpdateProfile';
import UpdatePassword from './components/user/UpdatePassword';
import ForgotPassword from './components/user/ForgotPassword';
import ResetPassword from './components/user/ResetPassword';
import Cart from './components/cart/Cart';
import Shipping from './components/cart/Shipping';
import ConfirmOrder from './components/cart/ConfirmOrder';
import Payment from './components/cart/Payment';
import axios from 'axios';
import {Elements} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import OrderSuccess from './components/cart/OrderSuccess';
import UserOrders from './components/order/UserOrders';
import OrderDetail from './components/order/OrderDetail';
import Dashboard from './components/admin/Dashboard';
import ProductList from './components/admin/ProductList';
import NewProduct from './components/admin/NewProduct';
import UpdateProduct from './components/admin/UpdateProduct';
import OrderList from './components/admin/OrderList';
import UpdateOrder from './components/admin/UpdateOrder';
import UserList from './components/admin/UserList';
import UpdateUser from './components/admin/UpdateUser';
import ReviewList from './components/admin/ReviewList';

function App() {
  const[stripeApiKey, setStripeApiKey] = useState("")

  useEffect(()=>{
    store.dispatch(loadUser)
    async function getStripeApiKey() {
      const {data} = await axios.get('/api/v1/stripeapi')      
      setStripeApiKey(data.stripeApiKey)
    }
    getStripeApiKey()
  },[])


  return (
    <Router>
      <div className="App">
        <HelmetProvider>
          <Header />
          <div className='container container-fluid'>
          <ToastContainer theme='dark' />
            <Routes>
              <Route path='/' element={<Home/>} />
              <Route path='/search/:keyword' element={<ProductSearch/>} />
              <Route path='/product/:id' element={<ProductDetail/>} />
              <Route path='/login' element={<Login/>} />
              <Route path='/register' element={<Register/>} />
              <Route path='/myprofile' element={ <protectedRoute> <Profile/> </protectedRoute> } />
              <Route path='/myprofile/update' element={ <protectedRoute> <UpdateProfile /> </protectedRoute> } />
              <Route path='/myprofile/update/password' element={ <protectedRoute> <UpdatePassword /> </protectedRoute> } />
              <Route path='/password/forgot' element={ <ForgotPassword /> } />
              <Route path='/password/reset/:token' element={ <ResetPassword /> } />
              <Route path='/cart' element={ <Cart/> } />
              <Route path='/shipping' element={ <protectedRoute> <Shipping /> </protectedRoute> } />
              <Route path='/order/confirm' element={ <protectedRoute> <ConfirmOrder /> </protectedRoute> } />
              <Route path='/order/success' element={ <protectedRoute> <OrderSuccess /> </protectedRoute> } />
              <Route path='/orders' element={ <protectedRoute> <UserOrders /> </protectedRoute> } />
              <Route path='/order/:id' element={ <protectedRoute> <OrderDetail /> </protectedRoute> } />
              {stripeApiKey && <Route path='/payment' element={ <protectedRoute> <Elements stripe={loadStripe(stripeApiKey)} > <Payment /> </Elements>  </protectedRoute> } /> }
            </Routes> 
          </div> 

          {/* Admin Routes */}
          <Routes>
            <Route path='/admin/dashboard' element={<protectedRoute isAdmin={true}> <Dashboard/> </protectedRoute>} />
            <Route path='/admin/products' element={<protectedRoute isAdmin={true}> <ProductList/> </protectedRoute>} />
            <Route path='/admin/products/create' element={<protectedRoute isAdmin={true}> <NewProduct/> </protectedRoute>} /> 
            <Route path='/admin/product/:id' element={<protectedRoute isAdmin={true}> <UpdateProduct/> </protectedRoute>} />  
            <Route path='/admin/orders' element={<protectedRoute isAdmin={true}> <OrderList/> </protectedRoute>} />  
            <Route path='/admin/order/:id' element={<protectedRoute isAdmin={true}> <UpdateOrder/> </protectedRoute>} /> 
            <Route path='/admin/users' element={<protectedRoute isAdmin={true}> <UserList/> </protectedRoute>} />  
            <Route path='/admin/user/:id' element={<protectedRoute isAdmin={true}> <UpdateUser/> </protectedRoute>} />     
            <Route path='/admin/reviews' element={<protectedRoute isAdmin={true}> <ReviewList/> </protectedRoute>} />     
            
          </Routes> 

          <Footer />
        </HelmetProvider>
      </div>
    </Router>
  );
}

export default App;
