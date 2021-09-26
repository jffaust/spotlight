import * as React from "react";
import { Route, Router, Switch } from "react-router-dom";
import GraphExplorer from "./GraphExplorer";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { AppSettings, BackendAppSettings } from "../types/AppSettings";
import { isRgbString } from "../helpers/colors";

//type LayoutProps = DispatchProp<any>;

interface AppState {
  appSettings: AppSettings;
}

type PropsType = RouteComponentProps<any> & any;

class App extends React.Component<PropsType, AppState> {
  constructor(props: PropsType) {
    super(props);   

    this.state = {
      appSettings: {
        DefaultNodeColor: {r: 164, g: 143, b: 240},
        StorageEnabled: false
      },
    };
  }

  componentDidMount() {
    let __this = this;
    fetch('appSettings')
      .then(response => {
          if (!response.ok) {
              return Promise.reject({status: response.status, statusText: response.statusText})
          } else {
              return response.json() as Promise<BackendAppSettings>
          }
      })
      .then((data: BackendAppSettings) => {
          
        const defaultRgb = isRgbString(data.DefaultNodeColor);

          let mergedSettings: AppSettings = {
            StorageEnabled: data.StorageEnabled,
            DefaultNodeColor: defaultRgb ?? __this.state.appSettings.DefaultNodeColor
          };

          __this.setState({
            appSettings: mergedSettings 
          });
      })
      .catch(error => {
          console.log(error);
      });
  }

  public render() {
    return (
      <div>
        <div id="app-logo">
          <span id="app-logo-graph">Spot</span><span id="app-logo-it">light</span>          
        </div>
        <Switch>
          <Route path="/" render={(props) => (
              <GraphExplorer {...props} appSettings={this.state.appSettings}/>
            )}
          />
        </Switch>
      </div>
    );
  }
}

export default withRouter(App);
