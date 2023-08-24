import { Injectable } from '@nestjs/common';
import { CommonUtility } from 'src/core/utils/common.utility';

@Injectable()
export class CaptchaService {
  private generateNum(digit: number): string {
    return Array.from({ length: digit }, () =>
      CommonUtility.generateRandomNumber().toString(),
    ).join('');
  }

  sixNumCaptcha() {
    return this.generateNum(6);
  }
}
