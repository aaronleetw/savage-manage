import { router } from '../trpc';
import { userRouter } from './user';
import { authRouter } from './auth';
import { plannerRouter } from './planner';
import { permissionsRouter } from './permissions';
 
export const appRouter = router({
    user: userRouter, // put procedures under "user" namespace
    auth: authRouter,
    planner: plannerRouter,
    permissions: permissionsRouter
});
 
export type AppRouter = typeof appRouter;
