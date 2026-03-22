import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/**
 * Cliente S3/MinIO partilhado (bucket público via MINIO_PUBLIC_BASE_URL).
 * Chaves de objeto são definidas pelos use cases (ex.: avatars/…, post-images/…).
 */
@Injectable()
export class MinioPublicStorageService {
  private readonly client: S3Client | null
  private readonly bucket: string
  private readonly publicBaseUrl: string

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('MINIO_BUCKET')?.trim() ?? ''
    const accessKey = this.config.get<string>('MINIO_ACCESS_KEY')?.trim() ?? ''
    const secretKey = this.config.get<string>('MINIO_SECRET_KEY')?.trim() ?? ''

    if (!this.bucket || !accessKey || !secretKey) {
      this.client = null
      this.publicBaseUrl = ''
      return
    }

    const endpoint = this.buildApiEndpoint()
    this.publicBaseUrl = this.buildPublicBaseUrl()
    this.client = new S3Client({
      region: 'us-east-1',
      endpoint,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true,
    })
  }

  isConfigured(): boolean {
    return this.client != null && this.publicBaseUrl.length > 0
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    if (!this.client) {
      throw new Error('MinioPublicStorageService: MinIO não configurado')
    }
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    )
  }

  publicUrlForKey(key: string): string {
    const base = this.publicBaseUrl.replace(/\/+$/, '')
    const k = key.replace(/^\/+/, '')
    return `${base}/${k}`
  }

  private buildApiEndpoint(): string {
    const ssl = this.config.get<string>('MINIO_USE_SSL') === 'true'
    const host = this.config.get<string>('MINIO_ENDPOINT')?.trim()
    const portRaw = this.config.get<string>('MINIO_PORT')?.trim() ?? '443'
    const port = Number.parseInt(portRaw, 10)
    const scheme = ssl ? 'https' : 'http'
    if (!host) {
      return `${scheme}://127.0.0.1:9000`
    }
    const omitPort = (ssl && port === 443) || (!ssl && port === 80) || Number.isNaN(port)
    return omitPort ? `${scheme}://${host}` : `${scheme}://${host}:${port}`
  }

  private buildPublicBaseUrl(): string {
    const explicit = this.config.get<string>('MINIO_PUBLIC_BASE_URL')?.trim().replace(/\/+$/, '')
    if (explicit) {
      return explicit
    }
    const ssl = this.config.get<string>('MINIO_USE_SSL') === 'true'
    const host = this.config.get<string>('MINIO_ENDPOINT')?.trim()
    const portRaw = this.config.get<string>('MINIO_PORT')?.trim() ?? '443'
    const port = Number.parseInt(portRaw, 10)
    const scheme = ssl ? 'https' : 'http'
    if (!host) {
      return ''
    }
    const omitPort = (ssl && port === 443) || (!ssl && port === 80) || Number.isNaN(port)
    const hostPart = omitPort ? host : `${host}:${port}`
    return `${scheme}://${hostPart}/${this.bucket}`
  }
}
