import { Grafo } from "./Grafo";
import * as fs from "fs";

export class GrafoLista extends Grafo {
  private listaAdjacencia: Map<string, { destino: string; peso: number }[]>;

  constructor() {
    super();
    this.listaAdjacencia = new Map();
  }

  inserirVertice(rotulo: string): boolean {
    if (this.listaAdjacencia.has(rotulo)) {
      return false;
    }
    this.listaAdjacencia.set(rotulo, []);
    this.vertices.push(rotulo);
    return true;
  }

  removerVertice(rotulo: string): boolean {
    if (!this.listaAdjacencia.has(rotulo)) {
      return false;
    }

    this.listaAdjacencia.delete(rotulo);
    this.vertices = this.vertices.filter((v) => v !== rotulo);

    for (const [vertice, arestas] of this.listaAdjacencia.entries()) {
      this.listaAdjacencia.set(
        vertice,
        arestas.filter((aresta) => aresta.destino !== rotulo)
      );
    }

    return true;
  }

  rotuloVertice(indice: number): string {
    return this.vertices[indice];
  }

  imprimirGrafo(): void {
    console.log("Lista de Adjacencia:");
    for (const [vertice, arestas] of this.listaAdjacencia.entries()) {
      const arestasStr = arestas
        .map((a) => `${a.destino}(${a.peso})`)
        .join(", ");
      console.log(`${vertice} -> ${arestasStr}`);
    }
  }

  inserirAresta(origem: number, destino: number, peso: number): boolean {
    const rotuloOrigem = this.vertices[origem];
    const rotuloDestino = this.vertices[destino];

    if (
      !this.listaAdjacencia.has(rotuloOrigem) ||
      !this.listaAdjacencia.has(rotuloDestino)
    ) {
      return false;
    }

    if (!this.ponderado) {
      peso = 1;
    }

    const arestas = this.listaAdjacencia.get(rotuloOrigem);
    if (arestas) {
      arestas.push({ destino: rotuloDestino, peso });
    }

    if (!this.direcionado) {
      const arestasDestino = this.listaAdjacencia.get(rotuloDestino);
      if (arestasDestino) {
        arestasDestino.push({ destino: rotuloOrigem, peso });
      }
    }

    return true;
  }

  removerAresta(origem: number, destino: number): boolean {
    const rotuloOrigem = this.vertices[origem];
    const rotuloDestino = this.vertices[destino];

    if (
      !this.listaAdjacencia.has(rotuloOrigem) ||
      !this.listaAdjacencia.has(rotuloDestino)
    ) {
      return false;
    }

    const arestas = this.listaAdjacencia.get(rotuloOrigem);
    if (arestas) {
      this.listaAdjacencia.set(
        rotuloOrigem,
        arestas.filter((aresta) => aresta.destino !== rotuloDestino)
      );
    }

    if (!this.direcionado) {
      const arestasDestino = this.listaAdjacencia.get(rotuloDestino);
      if (arestasDestino) {
        this.listaAdjacencia.set(
          rotuloDestino,
          arestasDestino.filter((aresta) => aresta.destino !== rotuloOrigem)
        );
      }
    }

    return true;
  }

  existeAresta(origem: number, destino: number): boolean {
    const rotuloOrigem = this.vertices[origem];
    const rotuloDestino = this.vertices[destino];

    if (!this.listaAdjacencia.has(rotuloOrigem)) {
      return false;
    }

    return this.listaAdjacencia
      .get(rotuloOrigem)!
      .some((aresta) => aresta.destino === rotuloDestino);
  }

  pesoAresta(origem: number, destino: number): number {
    const rotuloOrigem = this.vertices[origem];
    const rotuloDestino = this.vertices[destino];

    if (!this.listaAdjacencia.has(rotuloOrigem)) {
      return 0;
    }

    const arestas = this.listaAdjacencia.get(rotuloOrigem);
    if (arestas) {
      const aresta = arestas.find((aresta) => aresta.destino === rotuloDestino);
      return aresta ? aresta.peso : 0;
    }

    return 0;
  }

  retornarVizinhos(vertice: number): number[] {
    const rotuloVertice = this.vertices[vertice];

    if (!this.listaAdjacencia.has(rotuloVertice)) {
      return [];
    }

    const arestas = this.listaAdjacencia.get(rotuloVertice);
    if (arestas) {
      return arestas.map((aresta) => this.vertices.indexOf(aresta.destino));
    } else {
      return [];
    }
  }

  exportarParaJSON(): { nodes: any[]; edges: any[] } {
    const nodes = this.vertices.map((rotulo, indice) => ({
      id: indice,
      label: rotulo,
    }));

    const edges: any[] = [];

    for (const [vertice, arestas] of this.listaAdjacencia.entries()) {
      const origem = this.vertices.indexOf(vertice);
      for (const aresta of arestas) {
        const destino = this.vertices.indexOf(aresta.destino);
        const edge: { from: number; to: number; label?: string } = {
          from: origem,
          to: destino,
        };
        if (this.ponderado) {
          edge.label = aresta.peso.toString();
        }
        edges.push(edge);
      }
    }

    fs.writeFileSync("grafo.json", JSON.stringify({ nodes, edges }, null, 2));
    console.log("Dados do grafo exportados para grafo.json");
    return { nodes, edges };
  }
}

export default GrafoLista;
