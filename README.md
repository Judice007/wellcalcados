# WellCalçados — Landing Page

Landing page em HTML único (`index.html`), sem build/framework — abre direto no navegador.

## Identidade visual
- Conceito: vitrine editorial de sneakers, com produto em destaque e uma etiqueta compacta de pronta entrega (modelo, tamanho, preço e código de barras)
- Paleta: fundo escuro (#0B0B0E), roxo (#6F4DFF), magenta (#FF3D9A), amarelo-tag (#FFC93C)
- Fontes: Archivo Black (títulos), Space Mono (preço/tamanho/tags), Inter (texto)

## Estrutura da página
1. Hero — composição de e-commerce com headline ampla, produto protagonista e etiqueta compacta
2. Processo — 3 passos (escolher → confirmar → receber)
3. Categorias — 4 cards com foto de fundo
4. Vitrine — grid de produtos com preço/tamanho (fotos reais já embutidas em base64)
5. Diferenciais — permuta, parcelamento, atendimento, localização
6. Depoimento (placeholder — trocar por real)
7. CTA final

## Pendências / próximos passos
- [ ] Preço + tamanho do "Nike Court branco/azul" e do "Nike Air Max Plus (TN) holográfico" (hoje estão como "consultar no direct")
- [ ] Trocar depoimento placeholder por um depoimento real de cliente
- [ ] Trocar link do botão final (`#contato` → Instagram) pelo link de WhatsApp real, se preferir
- [ ] Definir onde hospedar (Vercel, Netlify, GitHub Pages — arquivo único, deploy é rápido)
- [ ] Se for crescer o catálogo, vale migrar a vitrine pra ler de um JSON/planilha em vez de HTML fixo

## Fotos
As fotos dos produtos já estão embutidas como base64 dentro do HTML (recortadas de screenshots de WhatsApp/Instagram — sem watermark de terceiros). Pra trocar por foto nova, é só gerar um novo base64 e substituir o `src="data:image/jpeg;base64,..."` correspondente.
