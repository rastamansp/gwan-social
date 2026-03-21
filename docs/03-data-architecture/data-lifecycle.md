# Ciclo de vida dos dados

## Objetivo

Definir **retenção**, **eventos para processamento Python**, **consistência eventual** da reputação e preparação para **anonimização** futura.

## Classificação

| Categoria | Exemplos | Sensibilidade |
|-----------|----------|----------------|
| Identidade | email, hash de senha | Alta |
| Perfil | bio, avatar URL | Média |
| Interações e avaliações | quem avaliou quem | Alta / evidência social |
| Reputação | snapshots, histórico | Derivado; auditoria |

## Retenção (baseline)

- **Histórico de reputação:** manter conforme necessidade de produto e legal; política detalhada a definir com stakeholders (placeholder: mínimo 12 meses de histórico ativo para MVP técnico).  
- **Logs operacionais:** não conter PII; rotação curta em dev.

## Eventos para o worker Python

- Ex.: `RatingCreated`, `RecalculateReputationRequested`, `UserSuspended` (futuro).  
- Payload **versionado** (`schema_version`); ver [integration-patterns.md](../04-application-architecture/integration-patterns.md).  
- **Idempotência:** jobs podem repetir; worker deve deduplicar por `job_id` ou chave natural.

## Consistência eventual

- Após nova avaliação, o snapshot pode atualizar em segundos/minutos.  
- API deve expor `computed_at` ou equivalente para UI honesta.  
- Regressão de cálculo: novo job pode reprocessar intervalo (estratégia na ETAPA 2 + ADR se necessário).

## Anonimização / exclusão (futuro)

- Solicitação de exclusão: pipeline que anonimiza ou remove vínculos em `ratings`/`interactions` conforme lei e produto.  
- Coordenação com ADR de **moderação** e time jurídico antes da implementação.

## Backup e recuperação

- PostgreSQL como SoR: política de backup definida no ambiente de deploy (não prescrita nesta baseline).
