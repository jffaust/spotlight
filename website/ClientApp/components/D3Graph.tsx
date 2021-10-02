import * as React from 'react';
import * as d3 from 'd3';
import * as Force from '../types/Force';
import { Simulation, SimulationNodeDatum, forceCenter, BaseType, group } from 'd3';
import { Graph } from '../types/Graph';
import { LinkSettings, NodeSettings, ForceSettings, SearchSettings } from '../types/GraphSettings';
import { AppSettings } from '../types/AppSettings';
import { blendTwoRgbColors, hslToRgb, isRgbString, rgb, toRgbString } from '../helpers/colors';
import { useEffect, useState } from 'react';
import { usePrevious } from '../helpers/customHooks';

type D3GraphProps = {
    appSettings: AppSettings;
    id: string;
    graphData: Graph;
    linkSettings: LinkSettings;
    nodeSettings: NodeSettings;
    forceSettings: ForceSettings;
    searchSettings: SearchSettings;
};

interface State {
    colorMapping: any;
}

export default function D3Graph(props: D3GraphProps) {
    let initState: State = {colorMapping: {}};
    const [state, setState] = useState(initState);
    const prevProps = usePrevious(props);
    const prevState = usePrevious(state);
    const dragBehavior = d3.drag<SVGCircleElement, any>().on("drag", dragNode);

    function selectSVG() {
        return d3.select<Element, any>(`svg#svg-${props.id}`);
    }

    function selectGraph() {
        return d3.select<Element, any>(`g#graph-${props.id}`);
    }

    let ForceSimulation: Simulation<SimulationNodeDatum, undefined> = d3.forceSimulation();
    let d3Nodes: d3.Selection<SVGCircleElement, any, d3.BaseType, any> = selectGraph().selectAll("circle");
    let d3NodeLabels: d3.Selection<SVGTextElement, any, d3.BaseType, any> = selectGraph().selectAll("text.nl");
    let d3Links: d3.Selection<SVGLineElement, any, d3.BaseType, any> = selectGraph().selectAll("line");
    let d3LinkLabels: d3.Selection<SVGTextElement, any, d3.BaseType, any> = selectGraph().selectAll("text.ll");
    

    useEffect(() => {
        if (!prevProps || (props.graphData.timestamp != prevProps.graphData.timestamp)) {
            clearGraphDisplay();
            generateColorMapping();
            initGraphDisplay();
            updateGraphDisplay();
            updateForces();
        } else {

            //TODO: Ideally we don't update the same elements twice but realistically only one setting will change at time
            if (prevProps.searchSettings.isActive != props.searchSettings.isActive
                || prevProps.searchSettings.useRegex != props.searchSettings.useRegex
                || prevProps.searchSettings.searchString != props.searchSettings.searchString) {
                updateGraphDisplay();
            }

            if (prevProps.nodeSettings.colorProperty != props.nodeSettings.colorProperty
                || prevProps.appSettings.DefaultNodeColor != props.appSettings.DefaultNodeColor) {
                generateColorMapping();
            } 
            
            if (prevState?.colorMapping != state.colorMapping) {
                ForceSimulation.on("tick", graphTick);
                d3Nodes.call(dragBehavior);
                updateNodeElements();
            }

            if (prevProps.nodeSettings.labelProperty != props.nodeSettings.labelProperty) {
                updateNodeLabelElements();
            }

            if (prevProps.linkSettings.length != props.linkSettings.length) {
                updateForces();
            }

            if (prevProps.linkSettings.showArrowheads != props.linkSettings.showArrowheads) {
                updateLinkElements();
            }

            if (prevProps.linkSettings.labelProperty != props.linkSettings.labelProperty) {
                updateLinkLabelElements();
            }

            if (JSON.stringify(prevProps.forceSettings) != JSON.stringify(props.forceSettings)) {
                updateForces();
            }
        }
    });

    function clearGraphDisplay() {
        if (typeof window !== 'undefined') {

            d3Nodes.remove();
            d3Links.remove();
            d3NodeLabels.remove();
            d3LinkLabels.remove();
        }
    }

    function initGraphDisplay() {
        if (typeof window !== 'undefined') {
            
            let graph = selectGraph();
            let svg = selectSVG();

            const width = Number(svg.style('width').slice(0, -2));
            const height = Number(svg.style('height').slice(0, -2));

            var zoomed = function() {
                graph.attr("transform", d3.event.transform);
            }

            var zoomBehavior = d3.zoom().on("zoom", zoomed)

            svg.call(zoomBehavior);
            svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(width/2, height/2).scale(1));

            //Add definition for arrowheads
            svg.selectAll("defs").data(["defs"]).enter().append("defs")
                .selectAll("marker")
                .data(["end"])      
                .enter().append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "0 0 10 10")
                .attr("refX", 17)
                .attr("refY", 5)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .append("svg:path")
                .attr("id", "marker-end-arrow")
                .attr("d", "M 2 0 L 10 5 L 2 10");

            //Append links first so they're behind the nodes when displayed
            d3Links = graph.selectAll("line")
                .data(props.graphData.links)
                .enter().append("line")
                .style("stroke", "#aaa")
                .style("stroke-width", 2)
                .attr("x1", function (l: any) { return l.source.x; })
                .attr("y1", function (l: any) { return l.source.y; })
                .attr("x2", function (l: any) { return l.target.x; })
                .attr("y2", function (l: any) { return l.target.y; });

            d3Nodes = graph.selectAll("circle")
                .data(props.graphData.nodes)
                .enter()
                .append("circle")
                .attr("r", 10)
                .attr("cx", function (n: any) { return n.x; })
                .attr("cy", function (n: any) { return n.y; })
                .call(dragBehavior);
                //.style("fill-opacity", (n:any) => getNodeOpacity(n));

            d3Nodes.append("circle:title")
                .text(function(n: any) { return n.id; });

            //TODO: Just-In Time Labels instead of always creating the elements
            d3NodeLabels = graph.selectAll("text.nl")
                .data(props.graphData.nodes)
                .enter()
                .append("text")
                .attr("class", "nl") //nl = node label
                .style("fill", "none")
                .attr("dx", 15)
                .attr("dy", ".4em")
                .attr("x", function (n: any) { return n.x; })
                .attr("y", function (n: any) { return n.y; });

            //TODO: Just-In Time Labels instead of always creating the elements
            d3LinkLabels = graph.selectAll("text.ll")
                .data(props.graphData.links)
                .enter()
                .append("text")
                .attr("class", "ll") //ll = link label
                .style("fill", "none")
                .attr("x", function (l: any) { return (l.source.x + l.target.x) / 2; })
                .attr("y", function (l: any) { return (l.source.y + l.target.y) / 2; });
        }
    }

    function dragNode(d: any, i: any) {
        //d.px += d3.event.dx;
        //d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy; 
        graphTick();
    }

    function graphTick() {
         updateNodeElements();

        if (props.nodeSettings.labelProperty != "none") {
            updateNodeLabelElements();
        }

        updateLinkElements();
        
        if (props.linkSettings.labelProperty != "none") {
            updateLinkLabelElements();
        }
    }

    function updateForces() {
        if (typeof window !== 'undefined') {

            if (!selectSVG().empty()) {
                ForceSimulation.on("tick", graphTick);

                ForceSimulation.nodes(props.graphData.nodes);

                if (props.forceSettings.forceCharge.enabled) {
                    let forceCharge = d3.forceManyBody()
                        .strength(props.forceSettings.forceCharge.strength)
                        .distanceMin(props.forceSettings.forceCharge.distanceMin)
                        .distanceMax(props.forceSettings.forceCharge.distanceMax);
                    ForceSimulation.force("charge", forceCharge);
                } else {
                    ForceSimulation.force("charge", null);
                }

                if (props.forceSettings.forceCollide.enabled) {
                    let forceCollide = d3.forceCollide()
                        .strength(props.forceSettings.forceCollide.strength / 10)  
                        .radius(props.forceSettings.forceCollide.radius)
                        .iterations(props.forceSettings.forceCollide.iterations);
                    ForceSimulation.force("collide", forceCollide);
                } else {
                    ForceSimulation.force("collide", null);
                }

                if (props.forceSettings.forceRadial.enabled) {
                    let forceRadial = d3.forceRadial(props.forceSettings.forceRadial.radius)
                        .radius(props.forceSettings.forceRadial.radius)
                        .strength(props.forceSettings.forceRadial.strength / 10);  
                    ForceSimulation.force("radial", forceRadial);
                } else {
                    ForceSimulation.force("radial", null);
                }

                if (props.forceSettings.forceX.enabled) {
                    let forceX = d3.forceX()
                        .strength(props.forceSettings.forceX.strength / 10)  
                        .x(props.forceSettings.forceX.position);
                    ForceSimulation.force("forceX", forceX);
                } else {
                    ForceSimulation.force("forceX", null);
                }

                if (props.forceSettings.forceY.enabled) {
                    let forceY = d3.forceY()
                        .strength(props.forceSettings.forceY.strength / 10)  
                        .y(props.forceSettings.forceY.position);
                    ForceSimulation.force("forceY", forceY);
                } else {
                    ForceSimulation.force("forceY", null);
                }

                let forceLink = d3.forceLink()
                        .id(function (d: any) { return d.id; })
                        .distance(props.linkSettings.length)
                        .strength(1)
                        .iterations(5)
                        .links(props.graphData.links);
                ForceSimulation.force("link", forceLink);

                // updates ignored until this is run
                // restarts the simulation (important if simulation has already slowed down)
                ForceSimulation.alpha(1).restart();
            }
        }
    }

    function updateNodeElements() {
        d3Nodes
            .attr("cx", function (n) { return n.x; })
            .attr("cy", function (n) { return n.y; })
            .style("fill", (n:any) => getNodeColor(n));
    }

    function updateNodeLabelElements() {
        d3NodeLabels
            .attr("x", function (n: any) { return n.x; })
            .attr("y", function (n: any) { return n.y; })
            .style("fill", (n:any) => getNodeLabelColor(n))
            .text((n: any) => getNodeLabel(n));
    }

    function updateLinkElements() {
        d3Links
            .attr("x1", function (l) { return l.source.x; })
            .attr("y1", function (l) { return l.source.y; })
            .attr("x2", function (l) { return l.target.x; })
            .attr("y2", function (l) { return l.target.y; })
            .style("stroke", (l:any) => getLinkColor(l))
            .attr("marker-end", () => props.linkSettings.showArrowheads ? "url(#end)" : null);
    }

    function updateLinkLabelElements() {
        d3LinkLabels
            .attr("x", function (l: any) { return Math.round((l.source.x + l.target.x) / 2); })
            .attr("y", function (l: any) { return Math.round((l.source.y + l.target.y) / 2); })
            .attr("transform", (l:any) => getLinkLabelTransform(l))
            .style("fill", (l:any) => getLinkLabelColor(l))
            .text((l: any) => getLinkLabel(l));
    }

    function updateGraphDisplay() {
        //if (typeof window !== 'undefined') {
            updateNodeElements();
            updateNodeLabelElements();
            updateLinkElements();
            updateLinkLabelElements();
        //}            
    }

    //Is the element (node | link) relevant to the search string
    function isElementRelevant(id: string) {
        if (!props.searchSettings.isActive || !props.searchSettings.searchString) {
            return true;
        } else {
            if (props.searchSettings.useRegex) {
                let regex = new RegExp(props.searchSettings.searchString);
                return regex.test(id);
            } else {
                let searchString = props.searchSettings.searchString.toLowerCase();
                return id.toLowerCase().indexOf(searchString) != -1;
            }
        }
    }

    function getNodeColor(node: any) {
        let nodeRgb  = props.appSettings.DefaultNodeColor;
        if (props.nodeSettings.colorProperty != "default" && Object.keys(state.colorMapping).length > 0) {
            nodeRgb = state.colorMapping[node[props.nodeSettings.colorProperty]];
        }

        if (isElementRelevant(node.id)) {
            return toRgbString(nodeRgb);
        } else {
            // Node is not relevant so we fake opacity of the node's color blending
            // on the background. We fake it so still get the effect without having actual
            // opactiy that would allow us to see the links going to the center of the nodes
            return toRgbString(blendColorWithBackground(nodeRgb, 0.3));
        }
    }

    function getNodeLabelColor(node: any) {
        const rgbString = "rgb(255, 255, 255)";
        
        if (isElementRelevant(node.id)) {
            return rgbString;
        } else {
            const rgbObj = {r: 255, g: 255, b: 255};
            return toRgbString(blendColorWithBackground(rgbObj, 0.3));
        }
    }

    function getLinkColor(link: any) {
        const rgbString = "rgb(170, 170, 170)";
        
        if (isElementRelevant(link.source.id) || isElementRelevant(link.target.id)) {
            return rgbString;
        } else {
            const rgbObj = {r: 255, g: 255, b: 255};
            return toRgbString(blendColorWithBackground(rgbObj, 0.3));
        }
    }
    
    function getLinkLabelColor(link: any) {
        const rgbString = "rgb(255, 255, 255)";
        
        if (isElementRelevant(link.source.id) || isElementRelevant(link.target.id)) {
            return rgbString;
        } else {
            const rgbObj = {r: 255, g: 255, b: 255};
            return toRgbString(blendColorWithBackground(rgbObj, 0.3));
        }
    }

    function blendColorWithBackground(top: rgb, alpha: number) {
        const backgroundRgb = { r: 50, g: 50, b: 50}; //TODO: from app settings or something
        return blendTwoRgbColors(backgroundRgb, top, alpha)
    }

    function generateColorMapping() {
        let mapping: { [property: string]: rgb } = {};
        
        if (props.nodeSettings.colorProperty != "default") {
            props.graphData.nodes.forEach(element => {
                try { mapping[element[props.nodeSettings.colorProperty]] = props.appSettings.DefaultNodeColor; } catch (error) {}
            });

            let dinstinctKeys = Object.keys(mapping);
            if (dinstinctKeys.length > 36) {
                mapping = {};
                alert("Too many groups. Nodes will be of default color");
            } else {
                let step = 360 / dinstinctKeys.length;
                for(let i = 0; i < dinstinctKeys.length; i++) {
                    mapping[dinstinctKeys[i]] = hslToRgb({h: i*step, s: 75, l: 75});
                }
            }
        }   
        
        setState({...state, colorMapping: mapping});  
    }

    function getNodeLabel(node: any) {
        if (props.nodeSettings.labelProperty == "position") {
            return `(x:${node.x.toFixed(0)}, y:${node.y.toFixed(0)})`;
        } else {
            return node[props.nodeSettings.labelProperty];
        }
    }

    function getLinkLabel(link: any) {
        //TODO: link contains key
        return link[props.linkSettings.labelProperty];
    }

    function getLinkLabelTransform(link: any) {
        const diffX = link.target.x - link.source.x;
        const diffY = link.target.y - link.source.y;
        const posX = Math.round((link.source.x + link.target.x) / 2);
        const posY = Math.round((link.source.y + link.target.y) / 2);
        const absoluteAngleDegrees = Math.atan2(Math.abs(diffY), Math.abs(diffX))*180/Math.PI;

        let actualAngleDegrees = absoluteAngleDegrees;
        if ((diffX > 0 && diffY < 0) || (diffX < 0 && diffY > 0)) {
            actualAngleDegrees = absoluteAngleDegrees*-1;
        }

        return `rotate(${actualAngleDegrees}, ${posX}, ${posY})`;
    }

    
    return <div className="d3-graph">
                <svg className="d3-graph" id={`svg-${props.id}`}>
                    <g id={`graph-${props.id}`}/> 
                </svg>
            </div>;
}