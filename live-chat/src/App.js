import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import { ApolloProvider as ApolloHooksProvider } from "react-apollo-hooks";
import client from "./apolloClient";
import Routes from "./Routes";

const App = () => {
  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <ApolloHooksProvider client={client}>
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
        </ApolloHooksProvider>
      </ApolloProvider>
    </BrowserRouter>
  );
};

export default App;
