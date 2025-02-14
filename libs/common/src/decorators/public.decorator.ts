import { IS_PUBLIC_KEY } from '@core-service/common/constants/all.constants';
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
