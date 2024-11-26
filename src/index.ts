import GrafoLista from "./GrafoLista";
import GrafoMatriz from "./GrafoMatriz";

function main(args: string[]): void {
  const caminhoArquivo = args[0];
  // const caminhoArquivo = "./src/arquivos/C4000-260-X.txt";
  // const caminhoArquivo = "./src/arquivos/k5.txt";
  // const caminhoArquivo = "./src/arquivos/k33.txt";
  // const caminhoArquivo = "./src/arquivos/kquase5.txt";
  // const caminhoArquivo = "./src/arquivos/r250-66-65.txt";
  // const caminhoArquivo = "./src/arquivos/r1000-234-234.txt";

  // const caminhoArquivo = "./src/arquivos/arvore.txt";
  // const caminhoArquivo = "./src/arquivos/caixeiro.txt";

  // const caminhoArquivo = "./src/arquivos2/50vertices25%Arestas.txt";
  // const caminhoArquivo = "./src/arquivos2/50vertices50%Arestas.txt";
  // const caminhoArquivo = "./src/arquivos/slide8.txt";
  // const caminhoArquivo = "./src/arquivos2/500vertices25%Arestas.txt";
  // const caminhoArquivo = "./src/arquivos2/500vertices50%Arestas.txt";
  // const caminhoArquivo = "./src/arquivos2/500vertices100%Arestas.txt";
  // const caminhoArquivo = "./src/arquivos2/1000vertices25%Arestas.txt";

  console.log("--- Grafo ---");
  var grafo = new GrafoLista();
  console.log(
    "Tipo de grafo: ",
    grafo instanceof GrafoLista ? "GrafoLista" : "GrafoMatriz"
  );
  grafo.carregarArquivo(caminhoArquivo);
  // grafo.forcaBruta();
  // grafo.welshPowell();
  // grafo.dsatur();
  // grafo.heuristicaSimples();
  // grafo.buscaEmLargura(1);
  // grafo.buscaEmProfundidade(1);
  // grafo.dijkstra(1);
  // grafo.prim();
  // grafo.kruskal();
  // grafo.caixeiroVizinhoMaisProximo(0);
  // grafo.caixeiroExaustivo(0);
  // const dadosGrafo = grafo.exportarParaJSON();

  const fluxoMaximo = grafo.fordFulkerson(0, grafo.getNumeroVertices() - 1);
  console.log(`Fluxo Máximo: ${fluxoMaximo}`);

  const fluxoMaximoOtimizado = grafo.buscaLocal(
    0,
    grafo.getNumeroVertices() - 1
  );
  console.log(`Fluxo Máximo Otimizado: ${fluxoMaximoOtimizado}`);
}

main(["./src/arquivos/slide0.txt"]);
main(["./src/arquivos/slide1.txt"]);
main(["./src/arquivos/slide4.txt"]);
main(["./src/arquivos/slide8.txt"]);
main(["./src/arquivos/slide9.txt"]);
