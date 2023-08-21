/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';

const HANDSOME_VIC = {
  provide: 'HANDSOME_MAN',
  useFactory: async () => {
    const getVic = new Promise((resolve) => {
      setTimeout(() => resolve({ name: 'VIC' }), 1000);
    });
    const Vic = await getVic;
    return Vic;
  },
};

@Module({
  providers: [HANDSOME_VIC],
  exports: [HANDSOME_VIC],
})
export class HandsomeModule {}
