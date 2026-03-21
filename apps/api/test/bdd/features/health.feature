# language: pt
Funcionalidade: Health check
  Como operador
  Quero confirmar que a API responde
  Para validar liveness

  Cenário: Serviço disponível
    Quando faço um GET para "/api/v1/health"
    Então o código de estado HTTP deve ser 200
    E o corpo JSON deve ter a propriedade "ok"
    E o campo "ok" deve ser verdadeiro
