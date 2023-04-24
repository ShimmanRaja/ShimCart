
import axios from 'axios';
import { productSuccess, productFail, productRequest, createReviewRequest, createReviewSuccess, createReviewFail, newProductRequest, newProductSuccess, newProductFail, deleteProductRequest, deleteProductSuccess, deleteProductFail, updateProductRequest, updateProductSuccess, updateProductFail, reviewsRequest, reviewsSuccess, reviewsFail, deleteReviewRequest, deleteReviewSuccess, deleteReviewFail } from '../slices/productSlice';
import { productsSuccess, productsFail, productsRequest, adminProductsRequest, adminProductsSuccess, adminProductsFail } from '../slices/productsSlice';


export const getProducts = (keyword, price, category, rating, currentPage) => async (dispatch) => {
    try{
        dispatch(productsRequest())  
        
        let link = `/api/v1/products?page=${currentPage}`;

        if(keyword){
            link += `&keyword=${keyword}`
        }

        if(price){
            link += `&price[gte]=${price[0]}&price[lte]=${price[1]}`
        }

        if(category){
            link += `&category=${category}`
        }

        if(rating){
            link += `&ratings=${rating}`
        }


        const { data } = await axios.get(link);
        dispatch(productsSuccess(data))
        // console.log(data) 

    } 
    catch(error) {
        //Handle Error
        dispatch(productsFail(error.response.data.message))
    }    
} 




export const getProduct = id => async (dispatch) => {
    try{
        dispatch(productRequest())                
        const { data } = await axios.get(`/api/v1/product/${id}`);
        dispatch(productSuccess(data))
    } 
    catch(error) {
        //Handle Error
        dispatch(productFail(error.response.data.message))
    }    
}


export const createReview = reviewData => async (dispatch) => {
    try{
        dispatch(createReviewRequest())    
        const config = {
            headers:{
                'content-type' : 'application/json'
            }
        }            
        const { data } = await axios.put(`/api/v1/review`, reviewData, config);
        dispatch(createReviewSuccess(data))
    } 
    catch(error) {
        //Handle Error
        dispatch(createReviewFail(error.response.data.message))
    }    
}


export const getAdminProducts = async (dispatch) => {
    try {
        dispatch(adminProductsRequest())
        const {data} = await axios.get('/api/v1/admin/products');
        dispatch(adminProductsSuccess(data))
    } catch (error) {
        dispatch(adminProductsFail(error.response.data.message))
    }
}


export const createNewProduct = productData => async (dispatch) => {
    try {
        dispatch(newProductRequest())
        const {data} = await axios.post('/api/v1/admin/product/new', productData);
        dispatch(newProductSuccess(data))
    } catch (error) {
        dispatch(newProductFail(error.response.data.message))
    }
}


export const deleteProduct = id => async (dispatch) => {
    try {
        dispatch(deleteProductRequest())
        await axios.delete(`/api/v1/admin/product/${id}`);
        dispatch(deleteProductSuccess())
    } catch (error) {
        dispatch(deleteProductFail(error.response.data.message))
    }
}


export const updateProduct = (id, productData) => async (dispatch) => {
    try {
        dispatch(updateProductRequest())
        const {data} = await axios.put(`/api/v1/admin/product/${id}`, productData);
        dispatch(updateProductSuccess(data))
    } catch (error) {
        dispatch(updateProductFail(error.response.data.message))
    }
}


export const getReviews = id =>  async (dispatch) => {
    try{
        dispatch(reviewsRequest()) 
        const { data } = await axios.get(`/api/v1/admin/reviews`, {params: {id}});
        dispatch(reviewsSuccess(data))       
    } 
    catch(error) {        
        dispatch(reviewsFail(error.response.data.message))
    }    
} 


export const deleteReview = (productId, id) =>  async (dispatch) => {
    try{
        dispatch(deleteReviewRequest()) 
        await axios.delete(`/api/v1/admin/review`, {params: {productId, id}});
        dispatch(deleteReviewSuccess())       
    } 
    catch(error) {        
        dispatch(deleteReviewFail(error.response.data.message))
    }    
} 
