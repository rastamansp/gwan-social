# language: pt
Funcionalidade: Erros HTTP
  Como cliente da API
  Quero receber erros no formato NestJS
  Para tratar 404 de forma consistente

  Cenário: Utilizador inexistente
    Quando faço um GET para "/api/v1/users/user_inexistente_bdd"
    Então o código de estado HTTP deve ser 404
    E o corpo JSON deve ter a propriedade "statusCode"
    E o campo "statusCode" deve ser 404
    E o campo "message" deve ser uma string não vazia
    E o campo "error" deve ser uma string não vazia
