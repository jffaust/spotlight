import { rgb } from "../helpers/colors";

export interface AppSettings {
    DefaultNodeColor: rgb;
    StorageEnabled: boolean;
  }

export interface BackendAppSettings {
    DefaultNodeColor: string;
    StorageEnabled: boolean;
  }