import React from "react";
import { Route } from "react-router-dom";
import Home from "../Components/Home";
import Room from "../Components/Room";

const Routes = () => {
  return (
    <>
      <Route exact path="/" component={Home} />
      <Route exact path="/room/:id" component={Room} />
    </>
  );
};

export default Routes;
