import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const product = await api.get(`/products/${productId}`);
      const productAmount = await api.get(`/stock/${productId}`);

      // Check if product has stock
      if (productAmount.data.amount <= 0) {
        toast.error("Quantidade solicitada fora de estoque");

        return;
      }

      // Copy of cart to modify
      const slicedCart = cart.slice();

      const productIndexIfExist = slicedCart.findIndex(
        (cartItem) => cartItem.id === productId
      );

      if (productIndexIfExist) {
        // Add 1 to product amount if it exists
        slicedCart[productIndexIfExist].amount += 1;

        // Check if product amout is higher than stock
        if (
          slicedCart[productIndexIfExist].amount > productAmount.data.amount
        ) {
          toast.error("Quantidade solicitada fora de estoque");

          return;
        }
      } else {
        // Add a new product if it does not exist
        slicedCart.push(product.data);
      }

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(slicedCart));

      setCart(slicedCart);
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const filteredCart = cart.filter((cartItem) => cartItem.id !== productId);

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(filteredCart));

      setCart(filteredCart);
    } catch {
      toast.error("Ocorreu um erro ao remover o produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
