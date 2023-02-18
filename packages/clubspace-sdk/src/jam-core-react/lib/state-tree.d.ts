export function use(Component: any, props: any, stableProps: any): any;
export function declare(Component: any, props: any, stableProps: any): any;
export function event(Component: any, props: any, stableProps: any): any;
export function declareStateRoot(Component: any, props: any, { state, defaultState }: {
    state: any;
    defaultState?: {};
}): {
    state: any;
    dispatch: (type: any, payload: any) => Promise<void>;
    setProps: (...args: any[]) => Promise<void>;
};
export function dispatch(state: any, type: any, payload: any): void;
export function useAction(type: any): any[];
export function useDispatch(): (type: any, payload: any) => Promise<void>;
export function useRootState(keys: any): any;
export function useExternalState(state: any, keyOrSelector: any): any;
export function useEvent(emitter: any, keyOrSelector: any): any[];
export function useOn(...args: any[]): void;
export function useUpdate(): () => Promise<void>;
export function useState(initial: any): any;
export function useMemo(func: any, deps: any): any;
export function useCallback(func: any, deps: any): any;
export function useUnmount(cleanup: any): void;
export function Action(type: any): {
    type: any;
    toString: () => any;
};
export function Atom(value: any): any[];
export function merge(...objArray: any[]): any[];
export function debugStateTree(): void;
export namespace root {
    const children: any[];
    const level: number;
}
export function _run(Component: any, props?: any, { element, stableProps, isUsed, isEvent, isMount, isRoot, state, }?: {
    element: any;
    stableProps?: any;
    isUsed?: boolean;
    isEvent?: boolean;
    isMount?: boolean;
    isRoot?: boolean;
    state: any;
}): any[];
export function log(...args: any[]): void;
export function cleanup(element: any): void;
