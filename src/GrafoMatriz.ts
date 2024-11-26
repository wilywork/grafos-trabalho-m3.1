import { Grafo } from "./Grafo";

export class GrafoMatriz extends Grafo {
  private matrizAdjacencia: number[][];

  constructor() {
    super();
    this.matrizAdjacencia = [];
    this.vertices = [];
  }

  inserirVertice(rotulo: string): boolean {
    if (this.vertices.includes(rotulo)) {
      return false;
    }
    this.vertices.push(rotulo);

    for (let i = 0; i < this.matrizAdjacencia.length; i++) {
      this.matrizAdjacencia[i].push(0);
    }
    this.matrizAdjacencia.push(new Array(this.vertices.length).fill(0));
    return true;
  }

  removerVertice(rotulo: string): boolean {
    const indice = this.vertices.indexOf(rotulo);
    if (indice === -1) {
      return false;
    }

    this.vertices.splice(indice, 1);
    this.matrizAdjacencia.splice(indice, 1);

    for (let i = 0; i < this.matrizAdjacencia.length; i++) {
      this.matrizAdjacencia[i].splice(indice, 1);
    }

    return true;
  }

  rotuloVertice(indice: number): string {
    return this.vertices[indice];
  }

  imprimirGrafo(): void {
    console.log("Matriz de Adjacencia:");
    console.log(
      this.matrizAdjacencia.map((linha) => linha.join(" ")).join("\n")
    );
    console.log("Vertices:");
    console.log(this.vertices.join(", "));
  }

  inserirAresta(origem: number, destino: number, peso: number): boolean {
    if (!this.ponderado) {
      peso = 1;
    }

    if (
      origem < 0 ||
      destino < 0 ||
      origem >= this.vertices.length ||
      destino >= this.vertices.length
    ) {
      return false;
    }

    this.matrizAdjacencia[origem][destino] = peso;

    if (!this.direcionado) {
      this.matrizAdjacencia[destino][origem] = peso;
    }

    return true;
  }

  removerAresta(origem: number, destino: number): boolean {
    if (
      origem < 0 ||
      destino < 0 ||
      origem >= this.vertices.length ||
      destino >= this.vertices.length
    ) {
      return false;
    }

    this.matrizAdjacencia[origem][destino] = 0;

    if (!this.direcionado) {
      this.matrizAdjacencia[destino][origem] = 0;
    }

    return true;
  }

  existeAresta(origem: number, destino: number): boolean {
    if (
      origem < 0 ||
      destino < 0 ||
      origem >= this.vertices.length ||
      destino >= this.vertices.length
    ) {
      return false;
    }

    return this.matrizAdjacencia[origem][destino] !== 0;
  }

  pesoAresta(origem: number, destino: number): number {
    if (
      origem < 0 ||
      destino < 0 ||
      origem >= this.vertices.length ||
      destino >= this.vertices.length
    ) {
      return 0;
    }

    return this.matrizAdjacencia[origem][destino];
  }

  retornarVizinhos(vertice: number): number[] {
    if (vertice < 0 || vertice >= this.vertices.length) {
      return [];
    }

    const vizinhos: number[] = [];
    for (let i = 0; i < this.matrizAdjacencia[vertice].length; i++) {
      if (this.matrizAdjacencia[vertice][i] !== 0) {
        vizinhos.push(i);
      }
    }

    return vizinhos;
  }

  exportarParaJSON(): { nodes: any[]; edges: any[] } {
    const nodes = this.vertices.map((rotulo, indice) => ({
      id: indice,
      label: rotulo,
    }));

    const edges: any[] = [];

    for (let i = 0; i < this.vertices.length; i++) {
      for (let j = 0; j < this.vertices.length; j++) {
        const peso = this.matrizAdjacencia[i][j];
        if (peso !== 0) {
          const edge: { from: number; to: number; label?: string } = {
            from: i,
            to: j,
          };
          if (this.ponderado) {
            edge.label = peso.toString();
          }
          edges.push(edge);
        }
      }
    }

    return { nodes, edges };
  }
}

export default GrafoMatriz;
