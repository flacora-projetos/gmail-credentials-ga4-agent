# Perguntas e Insights de Tráfego GA4

Este guia lista sugestões de perguntas (e respectivas métricas/dimensões) para extrair análise do site via GA4 usando o Agente GA4. Adapte sempre o `propertyId` e datas para cada cliente.

## Volume e Tendências
- Sessões totais e usuários em um período (`sessions`, `totalUsers`).
- Distribuição diária/semanal/mensal de sessões (`date`, `week`, `yearWeek`, `month`).
- Comparação com período anterior (usar `dateRanges` duplas).
- Sessões por canal de aquisição (`sessionSource`, `sessionMedium`, `sessionDefaultChannelGroup`, `newUsers`, `sessionConversionRate`).
- Usuários novos vs recorrentes (`newVsReturning`, `newUsers`, `totalUsers`).

## Qualidade de Sessões
- Duração média e engajamento (`averageSessionDuration`, `engagedSessions`, `engagementRate`).
- Taxa de rejeição (`bounceRate`) por canal ou página.
- Sessões com eventos chave (`eventName`, `eventCount`).
- Sessões Engajadas por dispositivo (`deviceCategory`, `engagedSessions`).

## Conteúdo (Páginas e Telas)
- Páginas mais acessadas (`pagePathPlusQueryString`, `screenPageViews`).
- Tempo médio por página (`userEngagementDuration` com `pagePath`).
- Eventos por página (`eventName`, `eventCount`, `pagePath`).
- Landing pages e conversão (`landingPage`, `sessions`, `sessionConversionRate`).
- Caminhos de navegação (usar `previousPagePath`, `pagePath`).

## Conversões / Ecommerce
- Transações e receita (`transactions`, `purchaseRevenue`, `totalRevenue`).
- Itens mais vendidos (`itemName`, `itemListName`, `itemsPurchased`, `itemRevenue`).
- Funil de conversão (ex.: `sessionStart → view_item → add_to_cart → purchase` com `eventName`).
- Taxa de conversão por campanha (`campaignName`, `sessionConversionRate`, `transactions`).
- Compare performance por cidade/estado (`city`, `country`, `transactions`).

## Comportamento do Usuário
- Ida e volta para identificar quedas (`exitPage`, `exitRate`).
- Eventos customizados: `keyEvents`, `eventCount`, `eventValue`.
- Analisar engajamento por país, dispositivo ou idioma (`country`, `deviceCategory`, `language`).
- Usuários ativos em tempo real (`runGa4RealtimeReport` com `country`, `activeUsers`).

## Compatibilidade e Metadados
- Checar se métricas/dimensões podem ser combinadas antes de rodar relatórios (`checkGa4Compatibility`).
- Descobrir novas métricas/dimensões usando `getGa4Metadata` com `search` (ex.: “session”, “revenue”).
- Filtrar catálogos grandes com `includeDimensions`, `includeMetrics`, `maxItems`.

## Exemplo de Sequência para Relatório Completo
1. `findGa4Properties` → identificar o `propertyId` correto.
2. `checkGa4Compatibility` com `dimensions`/`metrics` planejadas.
3. `runGa4Report`/`runGa4PivotReport` com filtros e ordenações desejados.
4. Duplicar a consulta com `batchRunGa4Reports` para comparar diferentes visões (ex.: por canal e por dispositivo).
