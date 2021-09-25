import './css/site.less';
import 'bootstrap';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import { AppContainer } from 'react-hot-loader';
import App from './components/App';
import { ChonkyActions, setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';

setChonkyDefaults({ 
    darkMode: true,
    iconComponent: ChonkyIconFA,
    defaultFileViewActionId: ChonkyActions.EnableListView.id
});

let app = <App/>

function renderApp() {
    // This code starts up the React app when it runs in a browser. It sets up the routing configuration
    // and injects the app into a DOM element.
    ReactDOM.render(
        <AppContainer>
            <BrowserRouter>
                {app}   
            </BrowserRouter>
        </AppContainer>,
        document.getElementById('react-app')
    );
}

renderApp();

// Allow Hot Module Replacement
if (module.hot) {
    module.hot.accept('./components/App', () => {
        require<typeof App>('./components/App');
        app = <App/>
        renderApp();
    });
}
