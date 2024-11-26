import fs from "fs";

export abstract class Grafo {
  direcionado: boolean;
  ponderado: boolean;
  protected vertices: string[];

  constructor() {
    this.direcionado = false;
    this.ponderado = false;
    this.vertices = [];
  }

  abstract inserirVertice(rotulo: string): boolean;
  abstract removerVertice(rotulo: string): boolean;
  abstract rotuloVertice(indice: number): string;
  abstract imprimirGrafo(): void;
  abstract inserirAresta(
    origem: number,
    destino: number,
    peso: number
  ): boolean;
  abstract removerAresta(origem: number, destino: number): boolean;
  abstract existeAresta(origem: number, destino: number): boolean;
  abstract pesoAresta(origem: number, destino: number): number;
  abstract retornarVizinhos(vertice: number): number[];
  abstract exportarParaJSON(): { nodes: any[]; edges: any[] };

  public getNumeroVertices(): number {
    return this.vertices.length;
  }

  private exibirColoracao(cores: number[]) {
    console.log("Coloracao dos vertices:");
    cores.forEach((cor, vertice) => {
      console.log(`Vertice ${vertice}: Cor ${cor}`);
    });
  }

  carregarArquivo(caminhoArquivo: string): boolean {
    try {
      const dados = fs.readFileSync(caminhoArquivo, "utf-8");
      const linhas = dados.trim().split("\n");

      if (linhas.length === 0) return false;

      const [quantidadeVertices, quantidadeArestas, direcionado, ponderado] =
        linhas[0].split(" ").map(Number);
      this.direcionado = direcionado === 1;
      this.ponderado = ponderado === 1;

      for (let i = 0; i < quantidadeVertices; i++) {
        this.inserirVertice(i.toString());
      }

      for (let i = 1; i <= quantidadeArestas; i++) {
        if (linhas[i]) {
          const dadosAresta = linhas[i].split(" ").map(Number);
          const origem = dadosAresta[0];
          const destino = dadosAresta[1];
          const peso = this.ponderado ? dadosAresta[2] : 1;
          this.inserirAresta(origem, destino, peso);
        }
      }

      return true;
    } catch (erro) {
      console.error("Erro ao carregar o arquivo:", erro);
      return false;
    }
  }

  buscaEmLargura(verticeInicio: number): void {
    const visitados = new Set<number>();
    const fila: number[] = [];

    fila.push(verticeInicio);
    visitados.add(verticeInicio);

    console.log("Ordem de Visita BFS:");

    while (fila.length > 0) {
      const vertice = fila.shift()!;
      console.log(this.rotuloVertice(vertice));

      const vizinhos = this.retornarVizinhos(vertice);
      for (const vizinho of vizinhos) {
        if (!visitados.has(vizinho)) {
          visitados.add(vizinho);
          fila.push(vizinho);
        }
      }
    }
  }

  buscaEmProfundidade(verticeInicio: number): void {
    const visitados = new Set<number>();

    const visitarProfundidade = (vertice: number) => {
      visitados.add(vertice);
      console.log(this.rotuloVertice(vertice));

      const vizinhos = this.retornarVizinhos(vertice);
      for (const vizinho of vizinhos) {
        if (!visitados.has(vizinho)) {
          visitarProfundidade(vizinho);
        }
      }
    };

    console.log("Ordem de Visita DFS:");
    visitarProfundidade(verticeInicio);
  }

  private calcularTempoExecucao(algoritmo: () => any) {
    const inicio = performance.now();
    const resultado = algoritmo();
    const fim = performance.now();
    const duracao = fim - inicio;
    console.log(`Tempo de execucao: ${duracao} ms`);
    return resultado;
  }

  private tentarColorir(
    indiceVertice: number,
    cores: number[],
    quantidadeCores: number
  ): boolean {
    if (indiceVertice === this.vertices.length) return true;

    for (let cor = 1; cor <= quantidadeCores; cor++) {
      if (this.ehSeguro(indiceVertice, cores, cor)) {
        cores[indiceVertice] = cor;
        if (this.tentarColorir(indiceVertice + 1, cores, quantidadeCores))
          return true;
        cores[indiceVertice] = -1;
      }
    }

    return false;
  }

  private ehSeguro(
    indiceVertice: number,
    cores: number[],
    cor: number
  ): boolean {
    const vizinhos = this.retornarVizinhos(indiceVertice);
    for (const vizinho of vizinhos) {
      if (cores[vizinho] === cor) return false;
    }
    return true;
  }

  forcaBruta() {
    return this.calcularTempoExecucao(() => {
      const quantidadeVertices = this.vertices.length;
      const cores = Array(quantidadeVertices).fill(-1);
      let coresNecessarias = quantidadeVertices;

      for (
        let quantidadeCores = 2;
        quantidadeCores <= quantidadeVertices;
        quantidadeCores++
      ) {
        if (this.tentarColorir(0, cores, quantidadeCores)) {
          coresNecessarias = quantidadeCores;
          break;
        }
      }

      console.log("Forca Bruta");
      console.log(`Numero de cores utilizadas: ${coresNecessarias}`);
      if (quantidadeVertices <= 10) this.exibirColoracao(cores);
      return cores;
    });
  }

  dijkstra(verticeInicio: number): void {
    const distancias = new Array(this.vertices.length).fill(Infinity);
    const anteriores = new Array(this.vertices.length).fill(-1);
    const visitados = new Set<number>();

    distancias[verticeInicio] = 0;

    while (visitados.size !== this.vertices.length) {
      let verticeAtual = -1;
      let menorDistancia = Infinity;

      for (let indice = 0; indice < distancias.length; indice++) {
        if (!visitados.has(indice) && distancias[indice] < menorDistancia) {
          menorDistancia = distancias[indice];
          verticeAtual = indice;
        }
      }

      if (verticeAtual === -1) break;

      visitados.add(verticeAtual);

      const vizinhos = this.retornarVizinhos(verticeAtual);
      for (const vizinho of vizinhos) {
        const peso = this.pesoAresta(verticeAtual, vizinho);
        if (distancias[verticeAtual] + peso < distancias[vizinho]) {
          distancias[vizinho] = distancias[verticeAtual] + peso;
          anteriores[vizinho] = verticeAtual;
        }
      }
    }

    console.log("Resultado do Algoritmo de Dijkstra:");
    for (let indice = 0; indice < this.vertices.length; indice++) {
      console.log(
        `Vertice: ${this.rotuloVertice(indice)}, Distancia: ${
          distancias[indice]
        }, Anterior: ${
          anteriores[indice] !== -1
            ? this.rotuloVertice(anteriores[indice])
            : "N/A"
        }`
      );
    }
  }

  welshPowell() {
    return this.calcularTempoExecucao(() => {
      const quantidadeVertices = this.vertices.length;
      const graus = this.vertices.map((_, indice) => [
        indice,
        this.retornarVizinhos(indice).length,
      ]);
      graus.sort((a, b) => b[1] - a[1]);

      const cores = Array(quantidadeVertices).fill(-1);
      let coresUsadas = 0;

      graus.forEach(([indiceVertice]) => {
        const coresDisponiveis = Array(quantidadeVertices).fill(true);

        const vizinhos = this.retornarVizinhos(indiceVertice);
        for (const vizinho of vizinhos) {
          if (cores[vizinho] !== -1) coresDisponiveis[cores[vizinho]] = false;
        }

        for (let cor = 1; cor <= quantidadeVertices; cor++) {
          if (coresDisponiveis[cor]) {
            cores[indiceVertice] = cor;
            coresUsadas = Math.max(coresUsadas, cor);
            break;
          }
        }
      });

      console.log("Welsh-Powell");
      console.log(`Numero de cores utilizadas: ${coresUsadas}`);
      if (quantidadeVertices <= 10) this.exibirColoracao(cores);
      return cores;
    });
  }

  dsatur() {
    return this.calcularTempoExecucao(() => {
      const quantidadeVertices = this.vertices.length;
      const cores = Array(quantidadeVertices).fill(-1);
      const grauSaturacao = Array(quantidadeVertices).fill(0);

      let graus = this.vertices.map((_, indice) => [
        indice,
        this.retornarVizinhos(indice).length,
      ]);

      let coresUsadas = 0;

      while (graus.length > 0) {
        graus.sort((a, b) => {
          if (grauSaturacao[a[0]] === grauSaturacao[b[0]]) {
            return b[1] - a[1];
          }
          return grauSaturacao[b[0]] - grauSaturacao[a[0]];
        });

        const proximo = graus.shift();
        if (proximo) {
          const [indiceVertice] = proximo;
          const coresDisponiveis = Array(quantidadeVertices).fill(true);

          const vizinhos = this.retornarVizinhos(indiceVertice);
          for (const vizinho of vizinhos) {
            if (cores[vizinho] !== -1) coresDisponiveis[cores[vizinho]] = false;
          }

          for (let cor = 1; cor <= quantidadeVertices; cor++) {
            if (coresDisponiveis[cor]) {
              cores[indiceVertice] = cor;
              coresUsadas = Math.max(coresUsadas, cor);
              break;
            }
          }

          for (const vizinho of vizinhos) {
            grauSaturacao[vizinho]++;
          }
        }
      }

      console.log("DSatur");
      console.log(`Numero de cores utilizadas: ${coresUsadas}`);
      if (quantidadeVertices <= 10) this.exibirColoracao(cores);
      return cores;
    });
  }

  heuristicaSimples() {
    return this.calcularTempoExecucao(() => {
      const quantidadeVertices = this.vertices.length;
      const cores = Array(quantidadeVertices).fill(-1);
      let coresUsadas = 0;

      for (
        let indiceVertice = 0;
        indiceVertice < quantidadeVertices;
        indiceVertice++
      ) {
        const coresDisponiveis = Array(quantidadeVertices).fill(true);

        const vizinhos = this.retornarVizinhos(indiceVertice);
        for (const vizinho of vizinhos) {
          if (cores[vizinho] !== -1) coresDisponiveis[cores[vizinho]] = false;
        }

        for (let cor = 1; cor <= quantidadeVertices; cor++) {
          if (coresDisponiveis[cor]) {
            cores[indiceVertice] = cor;
            coresUsadas = Math.max(coresUsadas, cor);
            break;
          }
        }
      }

      console.log("Heuristica Simples");
      console.log(`Numero de cores utilizadas: ${coresUsadas}`);
      if (quantidadeVertices <= 10) this.exibirColoracao(cores);
      return cores;
    });
  }

  prim(): void {
    return this.calcularTempoExecucao(() => {
      const solucaoArestas: {
        origem: number;
        destino: number;
        peso: number;
      }[] = [];
      const verticesNaoVisitados = new Set<number>();
      for (let indice = 0; indice < this.vertices.length; indice++) {
        verticesNaoVisitados.add(indice);
      }
      const verticeInicial = 0;
      verticesNaoVisitados.delete(verticeInicial);
      const verticesIncluidos = new Set<number>();
      verticesIncluidos.add(verticeInicial);

      while (verticesNaoVisitados.size > 0) {
        let arestaMinima: {
          origem: number;
          destino: number;
          peso: number;
        } | null = null;
        let pesoMinimo = Infinity;

        for (const verticeU of verticesIncluidos) {
          const vizinhos = this.retornarVizinhos(verticeU);
          for (const verticeV of vizinhos) {
            if (verticesNaoVisitados.has(verticeV)) {
              const pesoArestaUV = this.pesoAresta(verticeU, verticeV);
              if (pesoArestaUV < pesoMinimo) {
                pesoMinimo = pesoArestaUV;
                arestaMinima = {
                  origem: verticeU,
                  destino: verticeV,
                  peso: pesoArestaUV,
                };
              }
            }
          }
        }

        if (arestaMinima) {
          solucaoArestas.push(arestaMinima);
          verticesNaoVisitados.delete(arestaMinima.destino);
          verticesIncluidos.add(arestaMinima.destino);
        } else {
          break;
        }
      }

      console.log("Arvore Geradora Minima (Prim):");
      let pesoTotal = 0;
      for (const aresta of solucaoArestas) {
        console.log(
          `Aresta (${this.rotuloVertice(aresta.origem)}, ${this.rotuloVertice(
            aresta.destino
          )}) - Peso: ${aresta.peso}`
        );
        pesoTotal += aresta.peso;
      }
      console.log(`Peso total da arvore: ${pesoTotal}`);
    });
  }

  kruskal(): void {
    return this.calcularTempoExecucao(() => {
      const solucaoArestas: {
        origem: number;
        destino: number;
        peso: number;
      }[] = [];
      const listaArestas: { origem: number; destino: number; peso: number }[] =
        [];

      for (let verticeU = 0; verticeU < this.vertices.length; verticeU++) {
        const vizinhos = this.retornarVizinhos(verticeU);
        for (const verticeV of vizinhos) {
          if (verticeU < verticeV || this.direcionado) {
            const pesoAresta = this.pesoAresta(verticeU, verticeV);
            listaArestas.push({
              origem: verticeU,
              destino: verticeV,
              peso: pesoAresta,
            });
          }
        }
      }

      listaArestas.sort((a, b) => a.peso - b.peso);

      const representante = new Array(this.vertices.length);
      for (let indice = 0; indice < representante.length; indice++) {
        representante[indice] = indice;
      }

      const encontrar = (indice: number): number => {
        if (representante[indice] !== indice) {
          representante[indice] = encontrar(representante[indice]);
        }
        return representante[indice];
      };

      const unir = (indice1: number, indice2: number): void => {
        const representante1 = encontrar(indice1);
        const representante2 = encontrar(indice2);
        if (representante1 !== representante2) {
          representante[representante2] = representante1;
        }
      };

      for (const aresta of listaArestas) {
        const verticeU = aresta.origem;
        const verticeV = aresta.destino;
        if (encontrar(verticeU) !== encontrar(verticeV)) {
          solucaoArestas.push(aresta);
          unir(verticeU, verticeV);
        }
      }

      console.log("Arvore Geradora Minima (Kruskal):");
      let pesoTotal = 0;
      for (const aresta of solucaoArestas) {
        console.log(
          `Aresta (${this.rotuloVertice(aresta.origem)}, ${this.rotuloVertice(
            aresta.destino
          )}) - Peso: ${aresta.peso}`
        );
        pesoTotal += aresta.peso;
      }
      console.log(`Peso total da arvore: ${pesoTotal}`);
    });
  }

  caixeiroExaustivo(verticeInicial: number): void {
    return this.calcularTempoExecucao(() => {
      const numeroVertices = this.vertices.length;
      const verticesRestantes = [];
      for (let indice = 0; indice < numeroVertices; indice++) {
        if (indice !== verticeInicial) {
          verticesRestantes.push(indice);
        }
      }

      const gerarPermutacoes = (arranjo: number[]): number[][] => {
        if (arranjo.length === 1) return [arranjo];
        const permutacoes: number[][] = [];
        for (let indice = 0; indice < arranjo.length; indice++) {
          const atual = arranjo[indice];
          const restante = arranjo
            .slice(0, indice)
            .concat(arranjo.slice(indice + 1));
          const permutacoesRestantes = gerarPermutacoes(restante);
          for (const permutacao of permutacoesRestantes) {
            permutacoes.push([atual].concat(permutacao));
          }
        }
        return permutacoes;
      };

      const todasPermutacoes = gerarPermutacoes(verticesRestantes);
      let menorCusto = Infinity;
      let melhorCaminho: number[] = [];

      for (const permutacao of todasPermutacoes) {
        let custoAtual = 0;
        let verticeAtual = verticeInicial;
        let caminhoValido = true;
        for (const proximoVertice of permutacao) {
          if (this.existeAresta(verticeAtual, proximoVertice)) {
            custoAtual += this.pesoAresta(verticeAtual, proximoVertice);
            verticeAtual = proximoVertice;
          } else {
            caminhoValido = false;
            break;
          }
        }
        if (caminhoValido && this.existeAresta(verticeAtual, verticeInicial)) {
          custoAtual += this.pesoAresta(verticeAtual, verticeInicial);
          if (custoAtual < menorCusto) {
            menorCusto = custoAtual;
            melhorCaminho = [verticeInicial].concat(permutacao, verticeInicial);
          }
        }
      }

      if (menorCusto === Infinity) {
        console.log(
          "[caixeiroExaustivo] Nao existe ciclo Hamiltoniano no grafo."
        );
      } else {
        console.log("Caixeiro Viajante (Busca Exaustiva):");
        console.log(
          `Menor custo: ${menorCusto}, Caminho: ${melhorCaminho
            .map((v) => this.rotuloVertice(v))
            .join(" -> ")}`
        );
      }
    });
  }

  caixeiroVizinhoMaisProximo(verticeInicial: number): void {
    return this.calcularTempoExecucao(() => {
      const numeroVertices = this.vertices.length;
      const verticesVisitados = new Set<number>();
      const caminhoPercorrido = [verticeInicial];
      let verticeAtual = verticeInicial;
      let custoTotal = 0;
      verticesVisitados.add(verticeAtual);

      while (verticesVisitados.size < numeroVertices) {
        const vizinhosNaoVisitados = this.retornarVizinhos(verticeAtual).filter(
          (vertice) => !verticesVisitados.has(vertice)
        );
        if (vizinhosNaoVisitados.length === 0) {
          console.log(
            "[caixeiroVizinhoMaisProximo] Nao e possivel visitar todos os vertices."
          );
          return;
        }
        let verticeMaisProximo = vizinhosNaoVisitados[0];
        let menorPeso = this.pesoAresta(verticeAtual, verticeMaisProximo);
        for (const verticeVizinho of vizinhosNaoVisitados) {
          const pesoAresta = this.pesoAresta(verticeAtual, verticeVizinho);
          if (pesoAresta < menorPeso) {
            menorPeso = pesoAresta;
            verticeMaisProximo = verticeVizinho;
          }
        }
        caminhoPercorrido.push(verticeMaisProximo);
        custoTotal += menorPeso;
        verticesVisitados.add(verticeMaisProximo);
        verticeAtual = verticeMaisProximo;
      }

      if (this.existeAresta(verticeAtual, verticeInicial)) {
        custoTotal += this.pesoAresta(verticeAtual, verticeInicial);
        caminhoPercorrido.push(verticeInicial);
      } else {
        console.log(
          "[caixeiroVizinhoMaisProximo] Nao e possivel retornar ao vertice inicial."
        );
        return;
      }

      console.log("Caixeiro Viajante (Vizinho Mais Proximo):");
      console.log(
        `Custo total: ${custoTotal}, Caminho: ${caminhoPercorrido
          .map((v) => this.rotuloVertice(v))
          .join(" -> ")}`
      );
    });
  }

  fordFulkerson(origem: number, destino: number): number {
    const grafoResidual = this.criarGrafoResidual();
    let fluxoMaximo = 0;

    while (true) {
      const caminho = this.encontrarCaminhoAumentante(
        grafoResidual,
        origem,
        destino
      );
      if (!caminho) break;

      const capacidadeMinima = Math.min(
        ...caminho.map(([u, v]) => grafoResidual[u][v])
      );

      for (const [u, v] of caminho) {
        grafoResidual[u][v] -= capacidadeMinima;
        if (!grafoResidual[v][u]) grafoResidual[v][u] = 0;
        grafoResidual[v][u] += capacidadeMinima;
      }

      fluxoMaximo += capacidadeMinima;
    }

    return fluxoMaximo;
  }

  private criarGrafoResidual(): number[][] {
    const grafoResidual: number[][] = [];
    for (let i = 0; i < this.vertices.length; i++) {
      grafoResidual[i] = [];
      for (let j = 0; j < this.vertices.length; j++) {
        grafoResidual[i][j] = this.pesoAresta(i, j);
      }
    }
    return grafoResidual;
  }

  private encontrarCaminhoAumentante(
    grafoResidual: number[][],
    origem: number,
    destino: number
  ): [number, number][] | null {
    const visitados = new Set<number>();
    const antecessores = Array(this.vertices.length).fill(-1);
    const fila: number[] = [origem];

    while (fila.length > 0) {
      const u = fila.shift()!;

      for (let v = 0; v < grafoResidual[u].length; v++) {
        if (!visitados.has(v) && grafoResidual[u][v] > 0) {
          visitados.add(v);
          antecessores[v] = u;
          fila.push(v);
          if (v === destino) {
            const caminho: [number, number][] = [];
            let atual = destino;
            while (atual !== origem) {
              const anterior = antecessores[atual];
              caminho.unshift([anterior, atual]);
              atual = anterior;
            }
            return caminho;
          }
        }
      }
    }

    return null;
  }

  buscaLocal(origem: number, destino: number): number {
    let fluxoMaximo = this.fordFulkerson(origem, destino);

    for (let u = 0; u < this.vertices.length; u++) {
      for (let v = 0; v < this.vertices.length; v++) {
        if (this.existeAresta(u, v)) {
          const pesoOriginal = this.pesoAresta(u, v);
          this.removerAresta(u, v);
          this.inserirAresta(v, u, pesoOriginal);

          const novoFluxoMaximo = this.fordFulkerson(origem, destino);
          if (novoFluxoMaximo > fluxoMaximo) {
            fluxoMaximo = novoFluxoMaximo;
          } else {
            this.removerAresta(v, u);
            this.inserirAresta(u, v, pesoOriginal);
          }
        }
      }
    }

    return fluxoMaximo;
  }
}

export default Grafo;
