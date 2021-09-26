import * as React from 'react';
import { withRouter } from "react-router";
import { RouteComponentProps } from 'react-router-dom';
import * as DemoGraphs from "../helpers/DemoGraphs";
import { Graph } from '../types/Graph';
import * as Force from '../types/Force';
import { SettingsGroup } from './SettingsGroup';
import { SettingsMenu } from './SettingsMenu';
import SettingsSection from './SettingsSection';
import Dropdown from './Dropdown';
import Toggle from './Toggle';
import Slider from './Slider';
import D3Graph from './D3Graph';
import AdvancedSearch from './AdvancedSearch';
import { NodeSettings, LinkSettings, ForceSettings, SearchSettings } from '../types/GraphSettings';
import IconButton from './IconButton';
import Modal from './Modal';
import { AppSettings } from '../types/AppSettings';
import { ChonkyActions, ChonkyFileActionData, ChonkyIconName, defineFileAction, FileArray, FileBrowser, FileContextMenu, FileData, FileHelper, FileList, FileNavbar, FileToolbar, FullFileBrowser } from 'chonky';
import { Dataset, DatasetData, DatasetRef } from '../types/Datasets';
import { useEffect, useState } from 'react';
import { usePrevious } from '../helpers/customHooks';

type GraphExplorerProps =
    {appSettings: AppSettings}
    & RouteComponentProps<{}>;

interface StorageContext {
    // actually an array of dirs to indicate current location: /Home/Overview
    folderChain: FileArray;
    files: FileArray; // all files and folders in the current location
}

interface State {
    graphData: Graph;
    graphDataInput: string;
    nodeSettings: NodeSettings;
    linkSettings: LinkSettings;
    searchSettings: SearchSettings;
    forceCenter: Force.Center;
    forceCharge: Force.Charge;
    forceCollide: Force.Collide;
    forceX: Force.Position;
    forceY: Force.Position;
    forceRadial: Force.Radial;
    showSettingsMenu: boolean;
    showAdvancedMenu: boolean;
    showUploadGraphDataModal: boolean;
    showSaveGraphModal: boolean;
    showOpenGraphModal: boolean;
    storageContext: StorageContext;
    currentDatasetRef?: DatasetRef;
    saveDatasetAsPath: string;
    saveDatasetAsPathIsValid: boolean;
}

function GraphExplorer(props: GraphExplorerProps) {

    const allowedFileActions = [
        ChonkyActions.OpenParentFolder, 
        ChonkyActions.OpenFiles,
        defineFileAction({
            id: "custom_open_item",
            button: {
              name: "Open",
              contextMenu: true,
              icon: ChonkyIconName.openFiles
            }
          }),
        defineFileAction({
            id: "custom_delete_item",
            button: {
              name: "Delete",
              contextMenu: true,
              icon: ChonkyIconName.trash
            }
          })
    ];

    const disabledFileActions: string[] = [
        ChonkyActions.SelectAllFiles.id,
        ChonkyActions.ClearSelection.id,
        ChonkyActions.ToggleHiddenFiles.id,
        ChonkyActions.OpenSelection.id
    ];

    const allowedPathRegexString = "^((\\w|-| )\/?)+\\w$";
    const allowedPathRegex = new RegExp(allowedPathRegexString);


    //const defaultGraph = DemoGraphs.generateLatticeGraph(10,5);
    const defaultGraph = DemoGraphs.generateCollatzConjectureGraph(16);

    const initState: State = {
        graphData: defaultGraph,
        graphDataInput: JSON.stringify({nodes: defaultGraph.nodes, links: defaultGraph.links}, null, 2),
        showUploadGraphDataModal: false,
        showSaveGraphModal: false,
        showOpenGraphModal: false,
        showSettingsMenu: false,
        showAdvancedMenu: false,
        linkSettings: {
            length: 75,
            labelProperty: "none",
            showArrowheads: false
        },
        nodeSettings: {
            labelProperty: "none",
            colorProperty: "default"
        },
        searchSettings: {
            searchString: "",
            isActive: false,
            useRegex: false
        },
        forceCenter: new Force.Center(0.5, 0.5),
        forceCharge: new Force.Charge(false, -30, 1, 100),
        forceCollide: new Force.Collide(true, 5, 5, 50),
        forceX: new Force.Position(false, 0, 5),
        forceY: new Force.Position(false, 0, 5),
        forceRadial: new Force.Radial(false, 0, 0, 50, 5),
        storageContext: {
            files: [],
            folderChain: [{ id: '#INTERNAL_ROOT', name: 'Datasets', isDir: true }]
        },
        saveDatasetAsPath: "",
        saveDatasetAsPathIsValid: false
    };   

    const [state, setState] = useState(initState);
    const prevProps = usePrevious(props);
    const prevState = usePrevious(state);

    useEffect(() => {
        if (props.appSettings.StorageEnabled) {

            const datasetIdMatch = locationMatchesDatasetId();
            if ((!prevProps && datasetIdMatch[0])
                || (prevProps && props.location !== prevProps.location)) {
                    openDataset(datasetIdMatch[1])
            }
            
            const currFolderChainPath = getFolderChainPath(state.storageContext.folderChain);
            const prevFolderChain = prevState ? getFolderChainPath(state.storageContext.folderChain) : currFolderChainPath;

            if ((!prevState?.showSaveGraphModal && state.showSaveGraphModal)
            || (!prevState?.showOpenGraphModal && state.showOpenGraphModal)
            || (prevFolderChain !== currFolderChainPath )) {
                refreshFiles();
            }
        }
    });

    function openDataset(datasetId: string) {
        const url = `datasets/${datasetId}/data`

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    return Promise.reject({status: response.status, statusText: response.statusText})
                } else {
                    return response.json() as Promise<DatasetData>
                }
            })
            .then(dataset => {
                const graph = JSON.parse(dataset.Data);
                setState({...state,
                    ...state,
                    showOpenGraphModal: false,
                    currentDatasetRef: dataset.Ref,
                    graphDataInput: dataset.Data,
                    graphData: {
                        nodes: graph.nodes,
                        links: graph.links,
                        timestamp: new Date(),
                    }
                });
            })
            .catch(error => {
                //TODO: toast/snackbar for user feedback
                console.log(error);
            });
    }

    function locationMatchesDatasetId(): [boolean, string] {
        const guidRegexStr = "[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}";
        const datasetIdRegex = new RegExp(`datasetId=(${guidRegexStr})`);
        const datasetIdMatch = props.location.search?.match(datasetIdRegex);
        const isMatch = datasetIdMatch ? true : false;
        const datasetId = datasetIdMatch ? datasetIdMatch[1] : "";
        return [isMatch, datasetId];
    }

    function handleOnSaveDatasetAsInputChange(e: React.FormEvent<HTMLInputElement>) {
        
        const userInputPath = e.currentTarget.value;
        let isValid = allowedPathRegex.test(userInputPath);

        setState({...state,
            saveDatasetAsPath: userInputPath,
            saveDatasetAsPathIsValid: isValid
        });
      }

      function handleSaveDatasetAsSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        if (state.saveDatasetAsPathIsValid) {

            const scope = state.storageContext.folderChain[1]?.name.toLowerCase();
            const inputPath = state.saveDatasetAsPath.startsWith("/") ? 
                state.saveDatasetAsPath.slice(1) : state.saveDatasetAsPath;
            const path = `${getCurrentScopedPath()}${inputPath}`
            const data = state.graphDataInput;//JSON.stringify({nodes: state.graphData.nodes, links: state.graphData.links}, null, 2),

            fetch('datasets', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: `{"Scope": "${scope}","Path": "${path}", "Data": ${JSON.stringify(data)}}`
              })
            .then(response => {
                if (!response.ok) {
                    return Promise.reject({status: response.status, statusText: response.statusText})
                } else {
                    return response.json() as Promise<Dataset>
                }
            })
            .then(dataset => {
                //TODO support different scopes
                let newChain = [
                    { id: '#INTERNAL_ROOT', name: 'Datasets', isDir: true },
                    { id: '#INTERNAL_DEFAULT_SHARED', name: 'Shared', isDir: true }
                ]
                let path = dataset.Path.startsWith("/") ? dataset.Path.slice(1) : dataset.Path;
                path.split("/").slice(0, -1).forEach(folder => {
                    newChain.push({ id: (Math.random() * 99999).toString(), name: folder, isDir: true })
                });

                setState({...state,
                        storageContext: { 
                            ...state.storageContext,
                            folderChain: newChain
                        },
                        showSaveGraphModal: !state.showSaveGraphModal
                    });
                //TODO: update currentProject
            })
            .catch(error => {
                console.log(error);
            });
        }
      }

      function handleChonkyAction(data: ChonkyFileActionData)  {
            let dataIdString: string = data.id;

            if (data.id === ChonkyActions.OpenFiles.id) {
                // is also triggered when user wants to go up a directory
                const { targetFile, files } = data.payload;
                const itemToOpen = targetFile ?? files[0]; // selection disabled so should only have target (file or dir)
                handleChonkyItemOpen(itemToOpen);
            } else if (dataIdString === "custom_open_item") {
                handleChonkyItemOpen(data.state.contextMenuTriggerFile);
            } else if (dataIdString === "custom_delete_item") {
                handleChonkyItemDelete(data.state.contextMenuTriggerFile);
            }
        }

      function handleChonkyItemOpen(item: FileData | null) {
        if (item) {
            if (item.isDir === true) {

                let parentFolderIndex = state.storageContext.folderChain.findIndex((f: FileData | null) => f?.id === item.id);
                if (parentFolderIndex == -1) {
                    // It must be a child folder
                    setState({...state,
                        storageContext: { 
                            ...state.storageContext,
                            folderChain: [...state.storageContext.folderChain, item] 
                        }
                    });
                } else if (parentFolderIndex == state.storageContext.folderChain.length - 1) {
                    // Current folder selected so let's just refresh
                    refreshFiles();
                } else if (parentFolderIndex >= 0) {
                    let newChain = state.storageContext.folderChain.slice(0, parentFolderIndex + 1)

                    setState({...state,
                        storageContext: { 
                            ...state.storageContext,
                            folderChain: newChain
                        }
                    });
                }

            } else {
               const datasetId = item.id;
               props.history.push(`?datasetId=${datasetId}`);
            }
        }
      }

      function handleChonkyItemDelete(item: FileData | null) {
        if (item) {
            if (item.isDir === true) {
                alert("Deletion of folders is not yet implemented.")
            } else {
                alert("TODO")
            }
        }
    }

      function ongraphDataInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        setState({...state, graphDataInput: event.target.value });
      }
    
      function toggleUploadGraphDataModal() {
        setState({...state, showUploadGraphDataModal: !state.showUploadGraphDataModal });
      }
    
      function toggleSaveGraphModal() {
        setState({...state, showSaveGraphModal: !state.showSaveGraphModal });
      }

      function refreshFiles() {
        if (state.storageContext.folderChain.length == 0) {}
        else if (state.storageContext.folderChain.length == 1) {
            setState({...state,
                storageContext: { ...state.storageContext, files: [
                    { id: '#INTERNAL_DEFAULT_SHARED', name: 'Shared', isDir: true }
                    //{ id: 'jean.frederic.faust@gmail.com', name: 'Personal', isDir: true } requires identity
                ]}
            });
        } else {
            // folderChain[0] = Datasets, top level folder (virtual)
            // folderChain[1] = Scope, used to for 'shared' folder and user-specific function datasets
            const scope = state.storageContext.folderChain[1]?.name.toLowerCase();
            const scopedPath = getCurrentScopedPath();

            fetch(`datasets?scope=${scope}&path=${encodeURIComponent(scopedPath)}`)
                .then(response => {
                    if (!response.ok) {
                        return Promise.reject({status: response.status, statusText: response.statusText})
                    } else {
                        return response.json() as Promise<DatasetRef[]>
                    }
                })
                .then(datasets => {
                    const newFiles = mapReferencesToFileArray(datasets, scopedPath);
                    
                    setState({...state,
                        storageContext: { ...state.storageContext, files: newFiles }
                    });
                })
                .catch(error => {
                    //TODO: toast/snackbar for user feedback
                    console.log(error);
                });

        }        
      }

      function toggleOpenGraphModal() {
          setState({...state, showOpenGraphModal: !state.showOpenGraphModal });
      }
      
      function getCurrentScopedPath() {
        const scopedChain = state.storageContext.folderChain.slice(2);

        let scopedPath = "/";
        if (scopedChain.length > 0) {
            scopedPath = "/" + scopedChain.map(f => f?.name).join("/") + "/";
        }
        return scopedPath;
      }

      function getCurrentDisplayPath() {
        return getFolderChainPath(state.storageContext.folderChain);
      }

      function getFolderChainPath(folderChain: FileArray) {
        return "/" + folderChain?.slice(1).map(f => f?.name).join("/") + "/";
      }

      function mapReferencesToFileArray(references: DatasetRef[], browsePath: string) {
        // Datasets can have any path but we don't store folder objects in the database 
        // so here we need to "virtualize" the list of folders

        let itemArray = references.map((d: DatasetRef) => {
            
            const relativePath = d.Path.slice(browsePath.length);
            const relativePathSplitted = relativePath.split("/");

            const isDir = relativePathSplitted.length > 1;
            const name = relativePathSplitted[0];
            // Directories are "virtualized" so they don't have an id. We generate one with enough
            // randomness that we won't have duplicates either in the folder chain by drilling down
            // or with child folders
            const id = isDir ? (Math.random() * 99999).toString() : d.Id

            return {
                id: id, 
                name: name, 
                isDir: isDir
            }
        });

        const results = [];
        const map = new Map();
        for (const item of itemArray) {
            
            if (item.isDir) {
                if (!map.has(item.name)) {
                    map.set(item.name, true); 
                    results.push(item);
                }
            } else {
                results.push({...item});
            }
        }

        function sortByName( a: FileData, b: FileData ) {
            return a.name.localeCompare(b.name)
          }

        const [dirs, files] = partition(results, (i: FileData) => i.isDir ? true : false);
        return dirs.sort(sortByName).concat(files.sort(sortByName));
      }

      function partition<T>(array: T[], isValid: (element: T) => boolean): [T[], T[]] {
        const pass: T[] = []
        const fail: T[] = []
        array.forEach(element => {
          if (isValid(element)) {
            pass.push(element)
          } else {
            fail.push(element)
          }
        })
        return [pass, fail]
      }
        
      function processgraphDataInput() {
        try {
          let graph = JSON.parse(state.graphDataInput);
    
          //TODO: json data validation 
          props.history.push("/");
          setState({...state,
              showUploadGraphDataModal: false,
              graphData: {
                nodes: graph.nodes,
                links: graph.links,
                timestamp: new Date(),
              }
            });
        } catch (e) {
          alert("Exception parsing JSON string: " + (e as Error).message);
        }
      }

    function toggleSettingsMenu() {
        setState({...state, 
            showAdvancedMenu: false,
            showSettingsMenu: !state.showSettingsMenu,
        });
    }

    function toggleAdvancedMenu() {
        setState({...state, 
            showSettingsMenu: false,
            showAdvancedMenu: !state.showAdvancedMenu,            
        });
    }

    function onNodeLabelPropertyChange(option: string) {
        setState({...state, nodeSettings: { ...state.nodeSettings, labelProperty: option }});
    }
    
    function onLinkLabelPropertyChange(option: string) {
        setState({...state, linkSettings: { ...state.linkSettings, labelProperty: option }});
    }

    function onColorPropertyChange(option: string) {
        setState({...state, nodeSettings: { ...state.nodeSettings, colorProperty: option }});
    }

    function onLinkLengthChanged(value: number) {
        setState({...state, linkSettings: { ...state.linkSettings, length: value }});
    }

    function toggleArrowheads(active: boolean) {
        setState({...state, linkSettings: { ...state.linkSettings, showArrowheads: active }});
    }

    function toggleSearch() {
        setState({...state, 
            showSettingsMenu: false,
            showAdvancedMenu: false,            
            searchSettings: { ...state.searchSettings, isActive: !state.searchSettings.isActive }
        });
    }

    function toggleRegexSearch(active: boolean) {
        setState({...state, searchSettings: { ...state.searchSettings, useRegex: active }});
    }

    function onSearchStringChanged(searchString: string) {
        setState({...state, searchSettings:  { ...state.searchSettings, searchString: searchString}});
    }

    function toggleChargeForce(active: boolean) {
        setState({...state, forceCharge: { ...state.forceCharge, enabled: active }});
    }

    function onChargeForceStrengthChanged(value: number) {
        setState({...state, forceCharge: { ...state.forceCharge, strength: value }});
    }

    function onChargeForceMinDistanceChanged(value: number) {
        setState({...state, forceCharge: { ...state.forceCharge, distanceMin: value }});
    }

    function onChargeForceMaxDistanceChanged(value: number) {
        setState({...state, forceCharge: { ...state.forceCharge, distanceMax: value }});
    }

    function toggleCollisionForce(active: boolean) {
        setState({...state, forceCollide: { ...state.forceCollide, enabled: active }});
    }

    function onCollisionForceStrengthChanged(value: number) {
        setState({...state, forceCollide: { ...state.forceCollide, strength: value }});
    }

    function onCollisionForceRadiusChanged(value: number) {
        setState({...state, forceCollide: { ...state.forceCollide, radius: value }});
    }

    function onCollisionForceIterationsChanged(value: number) {
        setState({...state, forceCollide: { ...state.forceCollide, iterations: value }});
    }

    function toggleRadialForce(active: boolean) {
        setState({...state, forceRadial: { ...state.forceRadial, enabled: active }});
    }

    function onRadialForceStrengthChanged(value: number) {
        setState({...state, forceRadial: { ...state.forceRadial, strength: value }});
    }

    function onRadialForceRadiusChanged(value: number) {
        setState({...state, forceRadial: { ...state.forceRadial, radius: value }});
    }

    function togglePositionXForce(active: boolean) {
        setState({...state, forceX: { ...state.forceX, enabled: active }});
    }

    function onXForceStrengthChanged(value: number) {
        setState({...state, forceX: { ...state.forceX, strength: value }});
    }

    function togglePositionYForce(active: boolean) {
        setState({...state, forceY: { ...state.forceY, enabled: active }});
    }

    function onYForceStrengthChanged(value: number) {
        setState({...state, forceY: { ...state.forceY, strength: value }});
    }  

    function renderDatasetTitle() {
        if (state.currentDatasetRef) {
            const pathItems = state.currentDatasetRef.Path.split('/');
            const name = pathItems[pathItems.length-1]
            return <span id="graph-explorer-dataset-title">| {name}</span>;
        } else {
            return null;
        }
            
    }

    function renderGraphSettingsMenu() {
        //TODO: document this or find workaround?
        let invalidProps: string[] = ["index", "x", "y", "vx", "vy", "source", "target"];
        //TODO: look through all nodes to get all keys
        let nodeLabelOptions = ["none", "position"].concat(Object.keys(state.graphData.nodes[0]).filter(k => !invalidProps.includes(k)));
        let linkLabelOptions = ["none"].concat(Object.keys(state.graphData.links[0]).filter(k => !invalidProps.includes(k)));
        let colorOptions = ["default"].concat(Object.keys(state.graphData.nodes[0]).filter(k => !invalidProps.includes(k)));

        return <SettingsMenu key={state.showSettingsMenu.toString()} menuId="graph-settings-menu" visible={state.showSettingsMenu} title="Graph Settings">
                    <SettingsGroup key="Nodes" groupName="Nodes" description="Title, color, size" iconName="glyphicon glyphicon-adjust">
                        <div className="settings-row"><label>Label</label><Dropdown value={state.nodeSettings.labelProperty} options={nodeLabelOptions} onOptionChange={onNodeLabelPropertyChange}/></div>
                        <div className="settings-row"><label>Color</label><Dropdown value={state.nodeSettings.colorProperty} options={colorOptions} onOptionChange={onColorPropertyChange}/></div>
                    </SettingsGroup>
                    <SettingsGroup key="Link" groupName="Links" description="Arrowhead, length" iconName="glyphicon glyphicon-share-alt">
                        <div className="settings-row"><label>Label</label><Dropdown value={state.linkSettings.labelProperty} options={linkLabelOptions} onOptionChange={onLinkLabelPropertyChange}/></div>
                        <div className="settings-row"><label>Length: {state.linkSettings.length}</label><Slider min={5} max={200} step={5} value={state.linkSettings.length} onChange={onLinkLengthChanged}/></div>
                        <div className="settings-row"><label>Arrowheads</label><Toggle active={state.linkSettings.showArrowheads} onToggle={toggleArrowheads}/></div>
                    </SettingsGroup>
                    <SettingsGroup key="Forces" groupName="Forces" description="Charge, collision, radial, x/y" iconName="glyphicon glyphicon-resize-small">
                        <SettingsSection name="Charge Force" active={state.forceCharge.enabled} onToggle={toggleChargeForce} link="https://github.com/d3/d3-force#many-body">
                            <div className="settings-row"><label>Min. distance: {state.forceCharge.distanceMin}</label><Slider min={1} max={100} step={2} value={state.forceCharge.distanceMin} onChange={onChargeForceMinDistanceChanged}/></div>
                            <div className="settings-row"><label>Max. distance: {state.forceCharge.distanceMax}</label><Slider min={1} max={500} step={5} value={state.forceCharge.distanceMax} onChange={onChargeForceMaxDistanceChanged}/></div>
                            <div className="settings-row"><label>Strength: {state.forceCharge.strength}</label><Slider min={-100} max={100} step={2} value={state.forceCharge.strength} onChange={onChargeForceStrengthChanged}/></div>
                        </SettingsSection> 
                        <SettingsSection name="Collision Force" active={state.forceCollide.enabled} onToggle={toggleCollisionForce} link="https://github.com/d3/d3-force#collision">
                            <div className="settings-row"><label>Radius: {state.forceCollide.radius}</label><Slider min={1} max={100} step={2} value={state.forceCollide.radius} onChange={onCollisionForceRadiusChanged}/></div>
                            <div className="settings-row"><label>Strength: {state.forceCollide.strength}</label><Slider min={0} max={10} step={1} value={state.forceCollide.strength} onChange={onCollisionForceStrengthChanged}/></div>
                            <div className="settings-row"><label>Iterations: {state.forceCollide.iterations}</label><Slider min={1} max={10} step={1} value={state.forceCollide.iterations} onChange={onCollisionForceIterationsChanged}/></div>
                        </SettingsSection> 
                        <SettingsSection name="Radial Force" active={state.forceRadial.enabled} onToggle={toggleRadialForce} link="https://github.com/d3/d3-force#forceRadial">
                            <div className="settings-row"><label>Radius: {state.forceRadial.radius}</label><Slider min={5} max={500} step={5} value={state.forceRadial.radius} onChange={onRadialForceRadiusChanged}/></div>
                            <div className="settings-row"><label>Strength: {state.forceRadial.strength}</label><Slider min={0} max={10} step={1} value={state.forceRadial.strength} onChange={onRadialForceStrengthChanged}/></div>
                        </SettingsSection> 
                        <SettingsSection name="X Force" active={state.forceX.enabled} onToggle={togglePositionXForce} link="https://github.com/d3/d3-force#positioning">
                            <div className="settings-row"><label>Strength: {state.forceX.strength}</label><Slider min={0} max={10} step={1} value={state.forceX.strength} onChange={onXForceStrengthChanged}/></div>
                        </SettingsSection> 
                        <SettingsSection name="Y Force" active={state.forceY.enabled} onToggle={togglePositionYForce} link="https://github.com/d3/d3-force#positioning">
                            <div className="settings-row"><label>Strength: {state.forceY.strength}</label><Slider min={0} max={10} step={1} value={state.forceY.strength} onChange={onYForceStrengthChanged}/></div>
                        </SettingsSection> 
                    </SettingsGroup>
                    <SettingsGroup key="Time" groupName="Time" description="Coming soon" iconName="glyphicon glyphicon-time"/>
                </SettingsMenu>;
    }

    function renderAdvancedMenu() {
        const visibleGroups = [
            <SettingsGroup key="Upload" groupName="Upload" description="Upload graph data" 
                iconName="glyphicon glyphicon-upload" onGroupClick={toggleUploadGraphDataModal} onClickOverride={true}/>,
            !props.appSettings.StorageEnabled ? [] : <SettingsGroup key="Storage" groupName="Storage" description="Save and open datasets" 
                enabled={props.appSettings.StorageEnabled}
                iconName="glyphicon glyphicon-cloud">
                    
                    <SettingsGroup key="Save" groupName="Save" description="Save current dataset" 
                        enabled={state.currentDatasetRef !== undefined} disabledReason="No dataset currently opened"
                        iconName="glyphicon glyphicon-floppy-disk" onGroupClick={() => alert("todo")} onClickOverride={true}/>
                    <SettingsGroup key="Save as" groupName="Save as" description="Save as new dataset" 
                        iconName="glyphicon glyphicon-floppy-save" onGroupClick={toggleSaveGraphModal} onClickOverride={true}/>
                    <SettingsGroup key="Open" groupName="Open" description="Open a dataset" 
                        iconName="glyphicon glyphicon-folder-open" onGroupClick={toggleOpenGraphModal} onClickOverride={true}/>

                </SettingsGroup>,
            <SettingsGroup key="About" groupName="About" description="Version" iconName="glyphicon glyphicon-tag">
                <p>TODO</p>
            </SettingsGroup>
        ];

        return <SettingsMenu menuId="graph-advanced-menu" visible={state.showAdvancedMenu} title="Other">
            {visibleGroups.flat()}
        </SettingsMenu>;
    }

    function renderUploadGraphDataModal() {
        return state.showUploadGraphDataModal ? (<Modal title="Upload graph data" description="Paste the JSON graph data in the textarea below" 
                active={state.showUploadGraphDataModal} onClose={toggleUploadGraphDataModal}>
                    <textarea rows={16} className="textarea-clipboard-input" spellCheck={false}
                    onChange={ongraphDataInputChange} value={state.graphDataInput} />
                    <button className="btn btn-primary confirmation-btn" onClick={processgraphDataInput}>
                        Proceed
                    </button>                
                </Modal>) : null;
      }

      function renderSaveGraphModal() {
        const canSave = state.storageContext.folderChain.length > 1;
        const description = canSave ? "Save dataset for further usage and sharing" : 
            "Choose a folder below to proceed";

        let form = canSave ? <form onSubmit={handleSaveDatasetAsSubmit}>
                        <div className="modal-input-path-save">
                            <label htmlFor="save-dataset-relative-path">{getCurrentDisplayPath()}</label>
                            <input type="text" id="save-dataset-relative-path" placeholder="newFolder1/myDatasetName"
                                value={state.saveDatasetAsPath} onChange={handleOnSaveDatasetAsInputChange}
                                pattern={allowedPathRegexString}
                                title="The string can contain any word character [A-Za-z0-9_], dashes and spaces but cannot begin or end with a forward slash. Also, it must end with a word character"/>
                            <button className="btn btn-success confirmation-btn">Save</button>
                        </div>
                    </form> : null;
        
        return state.showSaveGraphModal ? (<Modal title="Save dataset" description={description} 
                active={state.showSaveGraphModal} onClose={toggleSaveGraphModal}>
                    <div style={{ height: 350 }}>
                        <FileBrowser folderChain={state.storageContext.folderChain} files={state.storageContext.files}
                            disableSelection={true} disableDragAndDrop={true}
                            onFileAction={handleChonkyAction} fileActions={allowedFileActions}
                            disableDefaultFileActions={disabledFileActions}>
                                <FileNavbar />
                                <FileToolbar />
                                <FileList />
                                <FileContextMenu />
                        </FileBrowser>
                    </div>
                    {form}
                </Modal>) : null;
      }

      function renderOpenGraphModal() {       
        return state.showOpenGraphModal ? (<Modal title="Open dataset" description="Select a dataset to open" 
                active={state.showOpenGraphModal} onClose={toggleOpenGraphModal}>
                    <div style={{ height: 400 }}>
                        <FileBrowser folderChain={state.storageContext.folderChain} files={state.storageContext.files}
                            disableSelection={true} disableDragAndDrop={true}
                            onFileAction={handleChonkyAction} fileActions={allowedFileActions}
                            disableDefaultFileActions={disabledFileActions}>
                                <FileNavbar />
                                <FileToolbar />
                                <FileList />
                                <FileContextMenu />
                        </FileBrowser>
                    </div>
                </Modal>) : null;
      }

    let forceSettings:ForceSettings = {
        forceCenter: state.forceCenter,
        forceCharge: state.forceCharge,
        forceCollide: state.forceCollide,
        forceX: state.forceX,
        forceY: state.forceY,
        forceRadial: state.forceRadial
    }         
    return <div className="page-content">
                {renderDatasetTitle()}
                <AdvancedSearch id="graph-search" size={40} visible={state.searchSettings.isActive} useRegex={state.searchSettings.useRegex} 
                    debounceDurationSec={1} onSearchStringChanged={onSearchStringChanged} onToggleRegex={toggleRegexSearch} autoFocus={true}/>
                <IconButton id="btn-graph-search" title="Search" icon="glyphicon glyphicon-search" active={state.searchSettings.isActive} onClick={toggleSearch} />
                <IconButton id="btn-graph-settings" title="Settings" icon="glyphicon glyphicon-cog" active={state.showSettingsMenu} onClick={toggleSettingsMenu} />
                {renderGraphSettingsMenu()}
                <IconButton id="btn-graph-more" title="More" icon="glyphicon glyphicon-option-vertical" active={state.showAdvancedMenu} onClick={toggleAdvancedMenu} />
                {renderAdvancedMenu()}
                <D3Graph id="graph-explorer" key={state.graphData.timestamp.toISOString()} appSettings={props.appSettings} graphData={state.graphData} nodeSettings={state.nodeSettings} linkSettings={state.linkSettings} 
                    searchSettings={state.searchSettings} forceSettings={forceSettings}/>
                <span id="graph-details">{state.graphData.nodes.length} nodes, {state.graphData.links.length} links</span>
                {renderUploadGraphDataModal()}
                {renderSaveGraphModal()}
                {renderOpenGraphModal()}
        </div>;
}

export default withRouter(GraphExplorer);