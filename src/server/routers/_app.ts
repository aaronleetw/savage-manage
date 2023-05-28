import { router } from '../trpc';
import { userRouter } from './user';
import { authRouter } from './auth';
import { plannerRouter } from './planner';
 
export const appRouter = router({
    user: userRouter, // put procedures under "user" namespace
    auth: authRouter,
    planner: plannerRouter,
});
 
export type AppRouter = typeof appRouter;
