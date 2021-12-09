import { useState } from 'react'
import { useQuery } from 'react-query'

//components
import Cart from './Cart/Cart';
import Item from './Item/Item';
import Drawer from '@material-ui/core/Drawer'
import LinearProgress from '@material-ui/core/LinearProgress'
import Grid from '@material-ui/core/Grid'
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart'
import Badge from '@material-ui/core/Badge'

//styles
import { Wrapper, StyledButton } from './App.styles'

//types
export type CartItemType = {
  id: number;
  category: string;
  description: string;
  image: string;
  price: number;
  title: string;
  amount: number;
}

const getProducts = async() : Promise<CartItemType[]> =>
  await (await fetch('https://fakestoreapi.com/products')).json();

const App = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([] as CartItemType[])

  const { data, isLoading, error } = useQuery<CartItemType[]>('product', getProducts);

  console.log(data);

  const getTotalItems = ( items:CartItemType[]) => 
    items.reduce((acc: number, item) => acc + item.amount, 0);

  const handleAddToCart = ( itemClicked: CartItemType ) => {
    setCartItems(prev => {

      //1. Is the item already added in the cart
      const isItemInCart = prev.find(item => item.id === itemClicked.id);

      if(isItemInCart){
        return prev.map(item =>
          item.id === itemClicked.id
          ? { ...item, amount: item.amount + 1 }
          : item
          );
      }
      //First time the item is added
      return [...prev, {...itemClicked, amount: 1}];

    })
  }

  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev =>
      prev.reduce((acc, item) =>{

        if(item.id === id) {
          if(item.amount === 1) return acc;

          return [...acc, {...item, amount: item.amount - 1}];
        }else{
          return [...acc, item]
        }

      }, [] as CartItemType[])
    )
  };

  if(isLoading) return <LinearProgress />

  if(error) return <div>Something went wrong...</div>

  return (
    <Wrapper>
      <Drawer anchor='right' open={isOpen} onClose={() => setIsOpen(false)}>
        <Cart 
          cartItems={cartItems} 
          addToCart={handleAddToCart}  
          removeFromCart={handleRemoveFromCart} 
        />
      </Drawer>

      <StyledButton onClick={() => setIsOpen(true)}>
        <Badge 
          badgeContent={getTotalItems(cartItems)} 
          color='error'
        >
          <AddShoppingCartIcon />
        </Badge>
      </StyledButton>

      <Grid 
        container 
        spacing={3}
      >
        {
          data?.map(item => (
            <Grid item key={item.id} xs={12} sm={4}>
              <Item item={item} handleAddToCart={handleAddToCart} />
            </Grid>
          ))
        }
      </Grid>
    </Wrapper>
  );
}

export default App;
