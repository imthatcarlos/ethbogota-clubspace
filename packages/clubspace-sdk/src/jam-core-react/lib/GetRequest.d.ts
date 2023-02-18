export default function GetRequest({ path, dontFetch, fetchOnMount, getToken, }: {
    path: any;
    dontFetch: any;
    fetchOnMount: any;
    getToken: any;
}): ({ path, dontFetch, getToken }: {
    path: any;
    dontFetch: any;
    getToken: any;
}) => {
    data: any;
    status: any;
    isLoading: boolean;
};
export function getRequest(path: any, getToken: any): Promise<any[]>;
export function populateCache(path: any, data: any): void;
export function getCache(path: any): any;
export function setCache(path: any, { state, data, status }: {
    state: any;
    data: any;
    status: any;
}): void;
