import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import AltItem from "../components/Cart/AltItem";
import CartItem from "../components/Cart/CartItem";
import { Transition } from "@headlessui/react";
import { API_ENDPOINT } from "../config.js/global";

const CartSection = styled.div`
  padding: 10px;
  width: 100%;
`;

const ItemGHG = styled.div`
  color: #7492b6;
  font-weight: 550;
  font-size: 15px;
  margin-left: 10px;
`;

const OfCO2Expr = styled.div`
  font-weight: 550;
  font-size: 15px;
  margin-left: 5px;
`;

const ProducedExpr = styled.div`
  font-weight: 550;
  font-size: 12px;
  margin-left: 5px;
`;

const TotalContainer = styled.div`
  background: #ececec;
  padding: 10px;
  padding-bottom: 17px;
  margin: 10px 0;
`;

const ShowBreakdown = styled.a`
  color: #192642;
`;

function Cart() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rawCart, setRawCart] = useState([]);
  const [cartWithGHG, setCartWithGHG] = useState([]);
  const [totalGHG, setTotalGHG] = useState(0);

  // Check if user is logged in
  useEffect(() => {
    // Send message to background script to check cookies
    browser.runtime
      .sendMessage({ action: "background_checkLogin" })
      .then(({ response }) => {
        console.log(response);
        setIsLoggedIn(response);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  }, []);

  // Get cart details of the user if they are logged in
  useEffect(() => {
    if (isLoggedIn === true) {
      // Send message to background script to get cart details
      setLoading(true);
      browser.runtime
        .sendMessage({ action: "background_getCartDetails" })
        .then(({ response }) => {
          setRawCart(response);
          setLoading(false);
        })
        .catch((err) => console.log(err));
    }
  }, [isLoggedIn]);

  // Match each cart item with db to get GHG
  useEffect(() => {
    console.log("RawCart", rawCart);
    if (rawCart && rawCart.length > 0) {
      setLoading(true);
      setTotalGHG(0);
      setCartWithGHG([]);

      browser.runtime
        .sendMessage({ action: "background_getProductsWithCarbon", data: { rawCart } })
        .then(({ response }) => {
          console.log(response);
          setCartWithGHG(response.finalCart);
          console.log(cartWithGHG);
          setTotalGHG(response.totalGHG);
          setLoading(false);
        })
        .catch((err) => console.log(err));
    }
  }, [rawCart]);

  useEffect(() => {
    browser.runtime.onMessage.addListener((request) => {
      let action = request.action.split("components_")[1];

      switch (action) {
        case "updateCart":
          setLoading(true);
          setRawCart(request.response);
          break;
        default:
          break;
      }
    });
  }, []);

  // Four possible scenarios
  // 1. Loading
  // 2. User is not logged in
  // 3. User has nothing in the cart
  // 4. User is logged in & has items in the cart

  // 1. Loading
  if (loading === true) {
    return (
      <div className="flex justify-center flex-1 overflow-hidden">
        <img src="/images/loading.svg" className="w-8 animate-spin" alt="loading-animation" />
      </div>
    );
  }
  // 2. User is not logged in
  else if (isLoggedIn === false) {
    return (
      <div className="flex items-center justify-center flex-1">
        <h1 className="w-6/12 mx-auto text-center">
          Please make sure you are logged into instacart.com and is currently on instacart.com to activate the extension
        </h1>
      </div>
    );
  }
  // 3. User has nothing in the cart
  else if (!rawCart || (rawCart && rawCart.length === 0)) {
    return <h1 className="w-6/12 mx-auto text-center">Please make sure you have added something into your cart</h1>;
  }
  // 4. User is logged in & has items in the cart
  else if (cartWithGHG && cartWithGHG.length > 0) {
    return (
      <Transition
        show={true}
        enter="transition duration-300 ease-out"
        enterFrom="opacity-0 transform -translate-x-4"
        enterTo="opacity-100 transform translate-x-0"
        leave="transition duration-300 ease-out"
        leaveFrom="opacity-100 transform translate-x-0"
        leaveTo="opacity-0 transform -translate-x-4"
        className="flex flex-col flex-1 w-full overflow-x-hidden overflow-y-auto"
        as="div"
      >
        <CartSection>
          <h1 className="mb-2 text-xs font-semibold text-gray-500">BASED ON YOUR CART TODAY</h1>
          {cartWithGHG.map((cartItem) => (
            <CartItem
              imageURL="/images/beef.svg"
              title={cartItem.name}
              // description="Natural Choice"
              serving="1 kg"
              ghg={cartItem.carbon}
            />
          ))}
        </CartSection>

        <TotalContainer>
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-gray-500 text-2xs">TOTAL PURCHASE EMISSIONS</h1>
            {/* <ShowBreakdown href="#" className="ml-12 text-xs font-semibold underline text-3xs">
                      SHOW BREAKDOWN
                    </ShowBreakdown> */}
          </div>

          <div className="flex mt-4 ml-5 align-center">
            <img src="/images/c02.svg" alt="CO2 Logo" />
            <ItemGHG>{totalGHG}kg</ItemGHG>
            <OfCO2Expr>of CO2</OfCO2Expr>
            <ProducedExpr className="self-end">produced</ProducedExpr>
          </div>
        </TotalContainer>

        <CartSection>
          <h1 className="mb-1 font-semibold text-2xs text-n-green">SUGGESTED ALTERNATIVES</h1>
          <h1 className="mb-4 ml-1 text-xs font-semibold text-n-aquablue">
            <img src="/images/star.svg" alt="Star" className="inline-flex items-center mb-1 mr-1" />
            124 shoppers have shopped carbon conscious!
          </h1>
          <AltItem setLoading={setLoading} productId="1751568389" imageURL="/images/fish.svg" title="Salmon" description="Local" />
          <AltItem setLoading={setLoading} productId="1751571917" imageURL="/images/vegetable.svg" title="Beyond Meat" />
        </CartSection>
      </Transition>
    );
  } else {
    return <h1 className="flex items-center flex-1 w-6/12 mx-auto text-center">Product(s) has/have no GHG data at the moment.</h1>;
  }
}

export default Cart;
