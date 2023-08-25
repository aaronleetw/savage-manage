import { linkItems } from '@/utils/link_items';
import { router, publicProcedure, loggedInProcedure, permissionProcedure, hasPermissionInProcedure } from '../trpc';

function mapAsync<T, U>(array: T[], callbackfn: (value: T, index: number, array: T[]) => Promise<U>): Promise<U[]> {
    return Promise.all(array.map(callbackfn));
}

async function filterAsync<T>(array: T[], callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>): Promise<T[]> {
    const filterMap = await mapAsync(array, callbackfn);
    return array.filter((value, index) => filterMap[index]);
}

async function someAsync<T>(array: T[], callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>): Promise<boolean> {
    const filterMap = await mapAsync(array, callbackfn);
    return array.some((value, index) => filterMap[index]);
}
  
export const permissionsRouter = router({
    getSidebarItems: loggedInProcedure.query(
        async ({ ctx }) => {
            const items = await filterAsync(linkItems, async (item) => {
                if (typeof item.permission === "string") {
                    return await hasPermissionInProcedure(item.permission, ctx);
                } else {
                    return await someAsync(item.permission, async (permission) => await hasPermissionInProcedure(permission, ctx));
                }
            });
            return items.map((item) => item.name);
        }
    )
});