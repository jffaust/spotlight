import { Graph } from "../types/Graph";

export function generateLatticeGraph(w: number, h: number): Graph {
    let graph: Graph = {
      timestamp: new Date(),
      nodes: [], 
      links: []
    }
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let group = "";
        group += x % 2 == 0 ? "EvenX" : "OddX";
        group += y % 2 == 0 ? "EvenY" : "OddY";
        graph.nodes.push({ id: `[${x},${y}]`, name: "test", group: group});
      }
    }

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h - 1; y++) {
        graph.links.push({ source: `[${x},${y}]`, target: `[${x},${y+1}]`, label: "next" });
      }
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w - 1; x++) {
        graph.links.push({ source: `[${x},${y}]`, target: `[${x+1},${y}]`, label: "next" });
      }
    }

    return graph;
  }

  export function generateCollatzConjectureGraph(start: number): Graph {
    let graph: Graph = {
      timestamp: new Date(),
      nodes: [], 
      links: []
    }
    
    if (!Number.isInteger(start)) {
      console.log(`Expected integer value for the start of the Collatz conjecture. Received '${start}'`)
      return graph;
    }

    if (start < 2) {
      console.log(`Expected integer > 1 for the start of the Collatz conjecture. Received '${start}'`)
      return graph;
    }

    let hashtable: {[key: string]: boolean} = {};
    for (let i = start; i > 1; i--) {
      
      let current = i;
      if (!Object.prototype.hasOwnProperty.call(hashtable, `${current}`)) {
        hashtable[`${current}`] = true;
        graph.nodes.push({ id: `${current}`, parity: getParity(start)});
      }
      
      while(current != 1) {

        let previous = current;
        const parity = getParity(current);

        if (parity == "Odd") {
          current = 3*current + 1;
        } else {
          current = current / 2;
        }

        let linkKey = `${previous}->${current}`;
        if (!Object.prototype.hasOwnProperty.call(hashtable, linkKey)) {
          hashtable[linkKey] = true;
          graph.links.push({ source: `${previous}`, target: `${current}`, label: "next" });  
        }

        if (!Object.prototype.hasOwnProperty.call(hashtable, `${current}`)) {
          hashtable[`${current}`] = true;
          graph.nodes.push({ id: `${current}`, parity: getParity(current)});
        } else {
          break;
        }
      }
    }

    return graph;
  }

  function getParity(n: number): string {
    return n % 2 == 0 ? "Even" : "Odd";
  }