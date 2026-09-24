# Técnicas herdadas do Alfa Coworking (ALFA1.html)

O Alfa é um site de **conversão**: copy na voz do cliente, uma cor de acento, contenção visual e WhatsApp em todo lugar.
Adaptar ao FortLink (escuro violeta + neon), sem copiar o visual quente/laranja.

## 1. Hero de impacto com prova e ação
- Headline gigante (até ~8rem), `line-height: 0.92`, `letter-spacing: -0.035em`, **alinhada embaixo** do viewport,
  terminando com **ponto final na cor de acento** ("Construa seu sucesso aqui**.**").
- Eyebrow com **localização** ("Coworking em Foz do Iguaçu").
- Faixa "meta" separada por linha fina no rodapé do hero: proposta · prova social · referência local.
- Link secundário com **círculo + seta ↗** ("Ver planos e valores").
- CTA do header é WhatsApp com ícone e **pulso** (`pulsoBotao`).
- Overlays: gradiente vertical escuro + **radial de acento vindo do canto inferior**.

## 2. Seção "dor → solução" (o grande diferencial)
- Título de reenquadramento: "Não é desorganização. **É falta de lugar.**" (2ª frase na cor de acento).
- Lista numerada (01–08), cada linha = **frase de dor na 1ª pessoa do cliente** ("Não tenho onde receber meu cliente.")
  à esquerda em cinza + **nome da solução** à direita em acento com seta. Linha inteira clicável, hover com fundo sutil.
- Fechamento com label com **ponto pulsante** ("Aqui em um só endereço") + **frase gigante com gradiente brilhando**
  (`brilho`: background-position animado) + CTA WhatsApp.

## 3. Destaque + grade com revelação + modal
- Card destaque grande (imagem + texto + chips + 2 CTAs), badge "Em destaque".
- Grade de cards: hover dá **zoom na mídia** e **revela o resumo** (max-height/opacity, `cubic-bezier(.16,1,.3,1)`).
- Clique abre **modal de detalhe** (descrição, chips de itens, CTA **WhatsApp com mensagem pré-preenchida com o nome do item**),
  fecha com Esc/clique fora/botão.

## 4. Bloco "Tudo isso está incluso"
- Borda com **gradiente que corre** (`correBorda`, 1.5px de padding + background-size 300%).
- Lista em grid de benefícios incluídos em qualquer plano.

## 5. Faixa de oferta em cor sólida de acento
- Seção de cor cheia (quebra o ritmo escuro), logo em negativo, "Experimente antes",
  frase com **ênfase em itálico serifado** (Cormorant Garamond itálico) e CTA escuro com pulso.

## 6. Localização humana
- "O melhor jeito de entender é sentar aqui dentro." + endereço com **referência local** ("a 100 m da Polícia Federal"),
  horário, botões WhatsApp e telefone (`tel:`), foto da fachada.

## 7. Micro-animações CSS
`sobe` (entrada fade+up), `brilho` (shimmer em texto), `pulsa` (ponto vivo), `correBorda` (borda correndo),
`pulsoBotao`/`pulsoLaranja` (anel de pulso no CTA), `setaVai` (seta empurrando 5px em loop). Easing padrão `cubic-bezier(0.16,1,0.3,1)`.

## 8. Tipografia/cor
Sans geométrica (Satoshi) + serif itálica como acento pontual; **1 cor de acento**; textos secundários com opacidade (0.55–0.72).
