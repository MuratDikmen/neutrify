import styled from "styled-components";
import { useState } from "react";

import Nav from "../components/Nav";
import { Header } from "../components/Header";

import Cart from "../pages/Cart";
import Home from "../pages/Home";
import Settings from "../pages/Settings";
import Product from "../pages/Product";
//import ProductDetails from "../pages/ProductDetails";

// width: 315px;
// min-height: 558px;

// width: 100%;
// min-width: 315px;
// height: 558px;

//  width: 247px;

const ExtensionContainer = styled.div`
  height: 100%;
  width: 100%;
  width: 315px;
  min-height: 558px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  background: white;
`;

function Extension({ mode = "" }) {
  const [currentPage, setCurrentPage] = useState("Cart");

  function closeExtension() {
    window.close();
    browser.runtime.sendMessage({ action: "background_closeExtension" });
  }

  if (mode === "product") {
    return (
      <ExtensionContainer className="relative flex flex-col justify-between h-full">
        <Header closeExtension={closeExtension} />
        <Product />
      </ExtensionContainer>
    );
  } else {
    return (
      <ExtensionContainer className="relative flex flex-col justify-between h-full">
        <Header closeExtension={closeExtension} />
        {/* {currentPage === "Home" ? <Home /> : null}
        {currentPage === "Settings" ? <Settings /> : null}
        {currentPage === "Cart" ? <Cart /> : null} */}
        {/* <Nav setCurrentPage={setCurrentPage} currentPage={currentPage} /> */}
        <Cart />
      </ExtensionContainer>
    );
  }
}

export default Extension;
