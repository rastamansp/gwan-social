# language: pt
Funcionalidade: Autenticação
  Como novo utilizador
  Quero registar-me e obter tokens
  Para aceder a rotas protegidas

  Cenário: Registo, login e GET /me com Bearer
    Dado que gero credenciais de teste únicas
    Quando registo esse utilizador com displayName "Utilizador BDD" e email de teste
    Então o código de estado HTTP deve ser 201
    E o corpo JSON deve ter a propriedade "accessToken"
    E guardo o accessToken da resposta
    Quando faço login com esse utilizador
    Então o código de estado HTTP deve ser 200
    E o corpo JSON deve ter a propriedade "accessToken"
    E guardo o accessToken da resposta
    Quando faço um GET para "/api/v1/me" com autorização Bearer
    Então o código de estado HTTP deve ser 200
    E o campo "username" do corpo deve ser o username de teste
