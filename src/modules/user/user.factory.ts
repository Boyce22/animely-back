import pino from 'pino';
import { User } from '@/modules/user/entities/user.entity';
import { UserProfileCustomization } from '@/modules/user/entities/user-profile-customization.entity';
import { UserRepository } from '@/modules/user/user.repository';
import { UserService } from '@/modules/user/user.service';
import { UserController } from '@/modules/user/user.controller';
import { ProfileCustomizationRepository } from '@/modules/user/profile-customization.repository';
import { ProfileCustomizationService } from '@/modules/user/profile-customization.service';
import { ProfileCustomizationController } from '@/modules/user/profile-customization.controller';
import { AppDataSource } from '@config';

import { countryService } from '@/modules/country/country.factory';

const logger = pino({ name: 'user-module' });

const userRepository = new UserRepository(AppDataSource.getRepository(User));
const userService = new UserService(userRepository, logger);
const userController = new UserController(userService, countryService);

const profileCustomizationRepository = new ProfileCustomizationRepository(
  AppDataSource.getRepository(UserProfileCustomization),
);
const profileCustomizationService = new ProfileCustomizationService(
  profileCustomizationRepository,
  userRepository,
  logger,
);
const profileCustomizationController = new ProfileCustomizationController(profileCustomizationService);

export { userController, userService, userRepository, profileCustomizationController };
export const userRouter = userController.router;
export const profileCustomizationRouter = profileCustomizationController.router;
