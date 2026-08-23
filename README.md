# WellCalçados — Site e vitrine

Site estático sem build/framework, com página inicial (`index.html`) e catálogo filtrável (`vitrine.html`).

## Identidade visual
- Conceito: vitrine editorial de sneakers, com produto recortado em destaque e uma etiqueta compacta de pronta entrega (modelo, tamanho, preço e código de barras)
- Paleta: branco (#FFFFFF), azul-marinho (#081429) e roxo (#5B2E93)
- Fontes: Archivo Black (títulos), Space Mono (preço/tamanho/tags), Inter (texto)

## Estrutura da página
1. Hero — composição de e-commerce com headline ampla, produto recortado e etiqueta compacta
2. Processo — 3 passos (escolher → confirmar → receber)
3. Categorias — 4 cards com foto de fundo
4. Seleção da home — oito produtos em destaque
5. Vitrine completa — busca e filtros por marca e tamanho em `vitrine.html`
6. Diferenciais — permuta, parcelamento, atendimento, localização
7. Depoimento (placeholder — trocar por real)
8. CTA final

## Pendências / próximos passos
- [ ] Confirmar preços e numerações dos modelos que ainda aparecem como "consultar" na vitrine
- [ ] Trocar depoimento placeholder por um depoimento real de cliente
- [ ] Trocar link do botão final (`#contato` → Instagram) pelo link de WhatsApp real, se preferir
- [ ] Se o catálogo crescer, migrar `catalog.js` para uma planilha ou painel de estoque

## Fotos
As fotos ficam na pasta `img/`. Os dados usados pela vitrine estão centralizados em `catalog.js`. Para adicionar um modelo, inclua a imagem e um novo objeto nesse arquivo.
