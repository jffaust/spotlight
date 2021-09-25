import { Graph } from "../types/Graph";

export function generateGraph(w: number, h: number): Graph {
    let lattice: Graph = {
      timestamp: new Date(),
      nodes: [], 
      links: []
    }
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let group = "";
        group += x % 2 == 0 ? "EvenX" : "OddX";
        group += y % 2 == 0 ? "EvenY" : "OddY";
        lattice.nodes.push({ id: `[${x},${y}]`, name: "test", group: group});
      }
    }

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h - 1; y++) {
        lattice.links.push({ source: `[${x},${y}]`, target: `[${x},${y+1}]`, label: "next" });
      }
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w - 1; x++) {
        lattice.links.push({ source: `[${x},${y}]`, target: `[${x+1},${y}]`, label: "next" });
      }
    }

    return lattice;
  }