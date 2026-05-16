import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

@Injectable()
export class CloudFrontService {
  generateSignedUrl(url: string) {
    return getSignedUrl({
      url,

      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,

      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, '\n'),

      dateLessThan: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
    });
  }
}
