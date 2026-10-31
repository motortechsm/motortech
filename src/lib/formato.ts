// Funções para ler e mostrar valores no padrão brasileiro.

export function formatarPreco(valor: number): string {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Converte o que a pessoa digitou ("1.500,00", "1500", "R$ 89,90") em número.
// Retorna null se não for um preço válido.
export function lerPreco(texto: string): number | null {
  const limpo = texto.replace(/R\$|\s/g, "");
  if (!limpo) return null;

  let normal: string;
  if (limpo.includes(",")) {
    // Vírgula é o separador de centavos; pontos são de milhar.
    normal = limpo.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    // "1.500" = mil e quinhentos
    normal = limpo.replace(/\./g, "");
  } else {
    normal = limpo;
  }

  if (!/^\d{1,8}(\.\d{1,2})?$/.test(normal)) return null;
  return Number(normal);
}

// Preço no formato do campo do formulário: 1500 -> "1500,00"
export function precoParaCampo(valor: number): string {
  return Number(valor).toFixed(2).replace(".", ",");
}

// Cria um endereço amigável a partir do nome: "Módulo ECU Gol" -> "modulo-ecu-gol"
export function criarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function ehUuid(texto: string): boolean {
  return UUID.test(texto);
}
