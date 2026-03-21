import { Injectable } from '@nestjs/common'

@Injectable()
export class GetHealthUseCase {
  execute(): { ok: true } {
    return { ok: true }
  }
}
