# Princípios de arquitetura

## Objetivo

Definir regras **práticas e verificáveis** para o monorepo **gwan-social** (produto **Gwan Social Reputation** — ver [application-definition.md](../01-architecture-vision/application-definition.md)), alinhadas a Clean Architecture, SOLID e uso explícito de **casos de uso / application services**, sem misturar regras de negócio com frameworks ou infraestrutura.

## Definições

| Termo | Significado neste projeto |
|-------|---------------------------|
| **Regra de negócio** | Invariante ou política do domínio (ex.: quem pode avaliar quem, janelas de tempo, limites de score, consistência de agregados). Vive no **domínio** ou é **orquestrada** por casos de uso. |
| **Caso de uso (UC)** | Fluxo de aplicação que coordena entidades e portas (repositórios, fila, clock) para cumprir um objetivo do sistema. |
| **Controller / rota / handler HTTP** | Adaptador de entrada: valida formato (DTO), autentica, chama **um** caso de uso, mapeia resposta/erro. **Sem** regra de negócio. |
| **Componente de UI** | Apresentação e interação; chama API/SDK; **sem** duplicar cálculo de reputação ou regras de avaliação. |

## Princípios (obrigatórios)

1. **Separação em camadas (Clean Architecture)**  
   - **Domínio:** entidades, value objects, políticas puras; sem imports de Nest, TypeORM, Axios, Redis, etc.  
   - **Aplicação:** casos de uso, DTOs de aplicação, portas (interfaces).  
   - **Interfaces (adaptadores):** controllers Nest, consumidores de fila que delegam a casos de uso, presenters.  
   - **Infraestrutura:** implementações de repositório, cliente Redis, migrations, adaptadores externos.

2. **Regra de dependência**  
   Código interno **não** depende de frameworks; dependências apontam para dentro (domínio no centro).

3. **SOLID (aplicação pragmática)**  
   - **S:** módulos por capacidade de negócio (identity, profile, rating, reputation).  
   - **O/L/I/D:** interfaces de repositório e serviços substituíveis; evitar classes “Deus”.

4. **Use cases como ponto de orquestração**  
   Toda operação relevante do sistema passa por um caso de uso nomeado (ver [use-cases.md](../04-application-architecture/use-cases.md)).

5. **Consistência eventual onde o domínio exige**  
   Reputação contextual e histórico podem ser atualizados por **processamento assíncrono** (Python); a API expõe estados claros (ex.: “pendente de recálculo”) quando necessário.

6. **Contratos explícitos entre serviços**  
   Payloads de fila e DTOs públicos versionados; origem preferencial: `packages/shared-types` (tipos e schemas alinhados).

## Não-objetivos (fase atual)

- **Testes unitários:** fora do escopo até decisão explícita (sem criar suíte obrigatória na ETAPA 2 inicial).  
- **Definir provedor cloud único:** deployment genérico em containers; detalhes de nuvem em ADR futuro.  
- **Implementar moderação/apelações completas no MVP:** apenas ganchos e modelo de dados preparados quando aplicável.

## Anti-padrões (proibidos)

- Lógica de negócio em controllers, pipes de validação que **codificam regra de domínio** além de formato, componentes React/React Native de tela, ou scripts SQL soltos na aplicação.  
- Chamadas diretas de **`apps/api`** para bibliotecas de domínio do Python **sem** contrato de fila/API documentado.  
- Duplicar fórmulas de reputação em frontend e backend; **fonte da verdade** do cálculo pesado no worker Python, com regras de leitura documentadas.

## Relação com `.cursorrules`

O arquivo [`.cursorrules`](../../.cursorrules) na raiz reforça estes princípios para toda implementação e revisão.
