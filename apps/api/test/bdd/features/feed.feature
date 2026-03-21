# language: pt
Funcionalidade: Feed
  Como cliente da API
  Quero obter o feed paginado
  Para mostrar posts no read model

  Cenário: Primeira página do feed
    Quando faço um GET para "/api/v1/feed"
    Então o código de estado HTTP deve ser 200
    E o corpo JSON deve ter a propriedade "items"
    E o corpo JSON deve ter a propriedade "hasMore"
    E a lista "items" deve existir
