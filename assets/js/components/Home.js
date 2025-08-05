// ./assets/js/components/Home.js

import React, {Component} from 'react';
import {Route, Switch, Link} from 'react-router-dom';
import SetupCheck from "./SetupCheck";
import ExchangePage from "./ExchangePage";

class Home extends Component {

    render() {
        return (
            <div>
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                    <Link className={"navbar-brand"} to={"#"}> System kantoru $$ </Link>
                    <div id="navbarText">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item">
                                <Link className={"nav-link"} to={"/"}> Kursy walut </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={"nav-link"} to={"/setup-check"}> React Setup Check </Link>
                            </li>
                        </ul>
                    </div>
                </nav>
                <Switch>
                    <Route exact path="/" component={ExchangePage} />
                    <Route path="/setup-check" component={SetupCheck} />
                </Switch>
            </div>
        )
    }
}

export default Home;
