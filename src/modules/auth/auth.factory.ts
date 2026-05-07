import { AuthService } from '@/modules/auth/auth.service';
import { AuthController } from '@/modules/auth/auth.controller';

const authService = new AuthService();
const authController = new AuthController(authService);

export { authController, authService };
export const authRouter = authController.router;
