import { ADD_TO_CART,REMOVE_FROM_CART,UPDATE_CART_QUANTITY,CLEAR_CART } from "../ActionType";

export const AddToCart = (item) => ({
    type: ADD_TO_CART,
    payload: item
  });
  
  export const RemoveFromCart = (itemId) => ({
    type: REMOVE_FROM_CART,
    payload: itemId
  });
  
  export const UpdateCartQuantity = (itemId, quantity) => ({
    type: UPDATE_CART_QUANTITY,
    payload: { itemId, quantity }
  });
  
  export const ClearCart = () => ({
    type: CLEAR_CART
  });
  