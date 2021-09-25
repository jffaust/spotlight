export interface Dataset {
  Id: string;
  Scope: string;
  Path: string
  Size: number;
  LastModified: Date;
  //description
  //etc
}

export interface DatasetRef {
  Id: string;
  Scope: string;
  Path: string
  Size: number;
  LastModified: Date;
}

export interface DatasetData {
  Ref: DatasetRef;
  Data: string;
}