import {is, on, emit, clear, set} from 'minimal-state';
import causalLog from './causal-log';

// a kind of "React for app state"

/* TODOs:

  - use(Component) should not automatically re-run the parent component,
    but check wether fragment updated.
    => will also help to refine fragment update rules
    NOTE: it's a bit tricky because parent then has to rerun, but should not break use() components
    However, it does not work for event() components

  - probably, event() components should have a different model that can accumulate events, like useAction.
    then they could be run w/o rendering parent, and (if props change) re-run on render & queue a new event

  - possibly rename event() to useEvent() to make consistent with use()

  - stale update problem: understand in what cases object identity of state properties must change.
    or, if updates to root are made sufficiently fine-grained, possibly don't block
    non-changes to state in root (but first approach is cleaner)

  - use a dedicated class for Fragment for efficiency (low priority, because a mid-sized full initial render
    without side effects turns out to only take a couple of ms)
*/

export {
  use,
  declare,
  event,
  declareStateRoot,
  dispatch,
  useAction,
  useDispatch,
  useRootState,
  useExternalState,
  useEvent,
  useOn,
  useUpdate,
  useState,
  useMemo,
  useCallback,
  useUnmount,
  Action,
  Atom,
  merge,
  debugStateTree,
};

// INTERNAL exports for state-tree-react
export {root, _run, log, cleanup};

const root = {children: [], level: -1};
let current = root;
let renderRoot = null;
let nUses = 0;
let renderTime = 0;

const updateSet = new Set();

function declare(Component, props, stableProps) {
  let key = props?.key;
  let element = current.children.find(
    c => c.component === Component && c.key === key
  );
  let [newElement] = _run(Component, props, {element, stableProps});
  return newElement.fragment;
}

function use(Component, props, stableProps) {
  let isComponent = typeof Component === 'function';
  if (!isComponent) {
    // eslint-disable-next-line
    return useExternalState(Component, props);
  }

  let key = props?.key;
  let element = current.children.find(
    c => c.component === Component && c.key === key
  );
  let [newElement] = _run(Component, props, {
    element,
    isUsed: true,
    stableProps,
  });
  return newElement.fragment[0];
}

function event(Component, props, stableProps) {
  let key = props?.key;
  let element = current.children.find(
    c => c.component === Component && c.key === key
  );
  let [newElement] = _run(Component, props, {
    element,
    isEvent: true,
    isUsed: true,
    stableProps,
  });
  return newElement.fragment[0];
}

function _run(
  Component,
  props = null,
  {
    element,
    stableProps = null,
    isUsed = false,
    isEvent = false,
    isMount = false,
    isRoot = false,
    state,
  } = {}
) {
  let mustUpdate = updateSet.has(element);
  if (mustUpdate) updateSet.delete(element);

  if (sameProps(element?.props, props) && !mustUpdate) {
    element.renderTime = renderTime;
    if (element.isEvent) {
      // an event component must return undefined if not rendered
      resultToFragment(undefined, element.fragment);
    }
    return [element, undefined];
  }

  if (element === undefined) {
    isMount = true;
    element = {
      component: Component,
      render: Component,
      props,
      stableProps,
      key: props?.key,
      children: [],
      uses: [],
      renderTime,
      parent: current,
      level: current.level + 1,
      root: renderRoot,
      isUsed,
      isEvent,
      fragment: Fragment(),
    };
    if (isRoot) {
      element.actionSubs = new Map();
      element.stateSubs = new Map();
      element.state = state;
      element.root = element;
      renderRoot = element;
    }
    log('mounting new element', element.component.name);
    current.children.push(element);
  } else {
    if (props !== null) element.props = props;
    if (stableProps !== null) element.stableProps = stableProps;
    element.renderTime = renderTime;
  }
  let renderProps = {...element.props, ...element.stableProps};

  // run component
  let tmp = [current, nUses];
  current = element;
  nUses = 0;
  let result;
  if (isMount) {
    // handle level-2 component
    result = Component(renderProps);
    if (typeof result === 'function') {
      let mountUses = element.uses;
      element.uses = [];
      nUses = 0;
      element.render = result;
      result = element.render(renderProps);
      // level-2 uses are simply put at the end so they don't interfere on re-renders
      // and can still register unmount handlers
      element.uses = element.uses.concat(mountUses);
    }
  } else {
    result = element.render(renderProps);
  }
  [current, nUses] = tmp;

  // unmount children that weren't rendered
  let children = element.children;
  for (let i = children.length - 1; i >= 0; i--) {
    let child = children[i];
    if (child.renderTime !== renderTime) {
      cleanup(child);
      children.splice(i, 1);
    }
  }

  // process result (creates or updates element.fragment)
  log('rendered', Component.name, 'with result', result);
  // here we should obtain update info in case of re-renders!!!
  let updateKeys = resultToFragment(result, element.fragment);

  return [element, updateKeys];
}

function cleanup(element) {
  log('unmounting element', element.component.name);
  clear(element.fragment);
  for (let use of element.uses) {
    use?.cleanup?.();
  }
  if (renderRoot !== null) {
    unsubscribeAll(renderRoot.actionSubs, element);
    unsubscribeAll(renderRoot.stateSubs, element);
  }
  for (let child of element.children) {
    cleanup(child);
  }
}

// for creating state obj at the top level & later rerun on update
function declareStateRoot(Component, props = null, {state, defaultState = {}}) {
  current = root;
  state = state ?? {...defaultState};
  renderTime = Date.now();

  const [rootElement] = _run(Component, props, {
    isMount: true,
    isRoot: true,
    state,
  });
  const rootFragment = rootElement.fragment;
  let result = rootFragment[0];
  log('initial root render returned', result, 'after', Date.now() - renderTime);
  // TODO: could it be problematic here that we don't update unchanged values, can there be stable sub-objects?
  is(state, result);
  renderRoot = null;

  on(rootFragment, (result, keys) => {
    log('root fragment update triggered!', keys);
    // TODO: could it be problematic here that we don't update unchanged values, can there be stable sub-objects?
    if (keys === undefined) is(state, result);
    else {
      for (let key of keys) {
        if (state[key] === result[key]) {
          console.error('value did not change', key);
        }
        // probably use set here
        is(state, key, result[key]);
      }
    }
  });

  on(state, (key, value, oldValue) => {
    if (oldValue !== undefined && value === oldValue) return;
    // TODO: what updates should we queue on state updates during render?
    let subscribers = rootElement.stateSubs.get(key);
    if (subscribers !== undefined) {
      for (let element of subscribers) {
        queueUpdate(element, 'state ' + key);
      }
    }
  });

  const dispatch = (type, payload) =>
    dispatchFromRoot(rootElement, type, payload);
  on(state, 'dispatch', dispatch);
  return {
    state,
    dispatch,
    setProps: (...args) => setProps(rootElement, ...args),
  };
}

function sameProps(prevProps, props) {
  if (prevProps === undefined) return false;
  if (prevProps === props) return true;
  if (prevProps === null || props === null || props === undefined) return false;
  for (let key in prevProps) {
    if (!(key in props) || props[key] !== prevProps[key]) return false;
  }
  for (let key in props) {
    if (!(key in prevProps) || props[key] !== prevProps[key]) return false;
  }
  return true;
}

// rerendering
function queueUpdate(caller, reason = '') {
  log('queuing update', caller.component.name, reason);
  markForUpdate(caller);
  return Promise.resolve().then(() => {
    updateAll(caller.component.name + ' ' + reason);
  });
}

function updateAll(reason) {
  if (updateSet.size === 0) {
    // console.error('update obsolete: all elements updated', reason);
    return;
  }
  log('tree update caused by', reason);
  let orderedElements = [...updateSet].sort(
    (el1, el2) => el1.level - el2.level
  );
  // console.error(
  //   'orderedElements',
  //   orderedElements.map(el => el.component.name).join(', ')
  // );
  for (let element of orderedElements) {
    if (!updateSet.has(element)) {
      // console.error('update obsolete: element already updated', reason);
      continue;
    }
    renderRoot = element.root;
    renderTime = Date.now();
    log('rerendering', element.component.name);
    let [, updateKeys] = _run(element.component, element.props, {element});
    log('render took', Date.now() - renderTime);
    let result = element.fragment[0];
    // TODO: rerendered element should already provide fine-grained update info (keys)
    emit(element.fragment, result, updateKeys);
    renderRoot = null;
  }
}

function markForUpdate(element) {
  let parent = element;
  updateSet.add(parent);
  if (!parent.isUsed) return parent;
  while (parent.parent !== root) {
    parent = parent.parent;
    updateSet.add(parent);
    if (!parent.isUsed) return parent;
  }
  return parent;
}

async function setProps(element, ...args) {
  log('setProps', ...args);
  let newProps = {...element.props};
  set(newProps, ...args);
  if (sameProps(element.props, newProps)) return;
  element.props = newProps;
  return queueUpdate(element, 'setProps');
}

function dispatch(state, type, payload) {
  emit(state, 'dispatch', type, payload);
}

async function dispatchFromRoot(rootElement, type, payload) {
  log('dispatching', rootElement.component.name, String(type));

  let subscribers = rootElement.actionSubs.get(type);
  if (subscribers === undefined || subscribers.size === 0) return;

  let promises = [];
  for (let element of subscribers) {
    for (let use of element.uses) {
      if (use.action === type) {
        use.push(payload);
        let promise = queueUpdate(element, 'dispatch ' + type);
        promises.push(promise);
      }
    }
  }
  await Promise.all(promises);
}

function subscribe(subscriptions, type, element) {
  let subscribers =
    subscriptions.get(type) ?? subscriptions.set(type, new Set()).get(type);
  subscribers.add(element);
}
function unsubscribeAll(subscriptions, element) {
  for (let entry of subscriptions) {
    let [key, set] = entry;
    set.delete(element);
    if (set.size === 0) {
      subscriptions.delete(key);
    }
  }
}

// this will be useful for typing the payload
function Action(type) {
  return {type, toString: () => type};
}

// the next two need to be rendered inside an {isRoot: true} component
function useAction(type) {
  if (current === root) throw Error('Hooks can only be called during render');
  let actionQueue = current.uses[nUses];
  if (actionQueue === undefined) {
    actionQueue = [];
    actionQueue.action = type;
    subscribe(renderRoot.actionSubs, type, current);
    current.uses[nUses] = actionQueue;
  }
  nUses++;
  if (actionQueue.length > 0) {
    let payload = actionQueue.shift();
    if (actionQueue.length > 0) {
      queueUpdate(current, 'queued dispatch ' + type);
    }
    return [true, payload];
  } else {
    return [false, undefined];
  }
}

// function useActions(...types) {
//   if (current === root)
//     throw Error('useAction can only be called during render');
//   for (let type of types) {
//     subscribe(renderRoot.actionSubs, type, current);
//   }
//   if (types.includes(currentAction[0])) {
//     return [currentAction[0], currentAction[1]];
//   } else {
//     return [undefined, undefined];
//   }
// }

function useDispatch() {
  let callerRoot = renderRoot;
  return (type, payload) => dispatchFromRoot(callerRoot, type, payload);
}

// TODO maybe more efficient to memo this hook, like useState (not sure though)
function useRootState(keys) {
  if (current === root) throw Error('Hooks can only be called during render');
  let {state} = renderRoot;
  if (Array.isArray(keys)) {
    let values = [];
    for (let key of keys) {
      subscribe(renderRoot.stateSubs, key, current);
      values.push(state[key]);
    }
    return values;
  } else if (keys !== undefined) {
    subscribe(renderRoot.stateSubs, keys, current);
    return state[keys];
  } else {
    return state;
  }
}

function useExternalState(state, keyOrSelector) {
  if (current === root) throw Error('Hooks can only be called during render');
  let caller = current;
  let use = caller.uses[nUses];

  let [key, selector] =
    typeof keyOrSelector === 'function'
      ? [undefined, keyOrSelector]
      : [keyOrSelector, undefined];

  if (use === undefined || use.key !== keyOrSelector) {
    if (use !== undefined) {
      use.cleanup();
    } else {
      use = {key: keyOrSelector};
    }

    if (selector !== undefined) {
      try {
        use.value = selector(state);
      } catch (err) {
        console.warn(err);
      }
    }

    let listener = () => {
      if (current === caller) return;
      if (selector !== undefined) {
        let value = selector(state);
        if (use.value === value) return;
        use.value = value;
      }
      queueUpdate(caller, 'useExternalState ' + key);
    };

    use.cleanup =
      key === undefined ? on(state, listener) : on(state, key, listener);
    caller.uses[nUses] = use;
  }
  nUses++;
  return key === undefined ? use.value : state[key];
}

function useEvent(emitter, keyOrSelector) {
  if (current === root) throw Error('Hooks can only be called during render');
  let caller = current;
  let eventQueue = caller.uses[nUses];
  if (eventQueue === undefined || eventQueue.key !== keyOrSelector) {
    if (eventQueue === undefined) {
      eventQueue = [];
    } else {
      eventQueue.cleanup();
    }
    eventQueue.key = keyOrSelector;

    let [key, selector] =
      typeof keyOrSelector === 'function'
        ? [undefined, keyOrSelector]
        : [keyOrSelector, undefined];

    let listener = (...args) => {
      if (selector !== undefined && !selector(...args)) return;
      eventQueue.push(args);
      queueUpdate(caller, 'useEvent ' + key);
    };
    eventQueue.cleanup =
      key === undefined ? on(emitter, listener) : on(emitter, key, listener);
    current.uses[nUses] = eventQueue;
  }
  nUses++;
  if (eventQueue.length > 0) {
    let args = eventQueue.shift();
    if (eventQueue.length > 0) {
      queueUpdate(current, 'queued useEvent ');
    }
    return [true, ...args];
  } else {
    return [false];
  }
}

function useOn(...args) {
  if (current === root) throw Error('Hooks can only be called during render');
  let caller = current;
  let use = caller.uses[nUses];
  if (use !== undefined) {
    use.cleanup();
  }
  let cleanup = on(...args);
  caller.uses[nUses] = {cleanup};
  nUses++;
}

function useUpdate() {
  if (current === root) throw Error('Hooks can only be called during render');
  let caller = current;
  return () => queueUpdate(caller, 'useUpdate');
}

function useState(initial) {
  if (current === root) throw Error('Hooks can only be called during render');
  let caller = current;
  let use = caller.uses[nUses];
  if (use === undefined) {
    const setState = value => {
      if (value === use[0]) return;
      use[0] = value;
      if (current !== caller) {
        queueUpdate(caller, 'useState ' + value);
      }
      return value;
    };
    use = [initial, setState];
    caller.uses[nUses] = use;
  }
  nUses++;
  return use;
}

function useMemo(func, deps) {
  if (current === root) throw Error('Hooks can only be called during render');
  let caller = current;
  let use = caller.uses[nUses] ?? [undefined, undefined];
  if (use[1] === undefined || !arrayEqual(use[1], deps)) {
    use[1] = deps;
    use[0] = func(use[0]);
    caller.uses[nUses] = use;
  }
  nUses++;
  return use[0];
}

function useCallback(func, deps) {
  if (current === root) throw Error('Hooks can only be called during render');
  let caller = current;
  let use = caller.uses[nUses] ?? [undefined, undefined];
  if (use[1] === undefined || !arrayEqual(use[1], deps)) {
    use[1] = deps;
    use[0] = func;
    caller.uses[nUses] = use;
  }
  nUses++;
  return use[0];
}

function useUnmount(cleanup) {
  if (current === root) throw Error('Hooks can only be called during render');
  current.uses[nUses] = {cleanup};
  nUses++;
}

function arrayEqual(a, b) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function Atom(value) {
  let atom = [value];
  atom._atom = true;
  return atom;
}

// TODO using classes for Fragments probably increases efficiency,
// because the compiler has more static info & reuses methods

// it may well be the case that putting the value in a .value class property is faster than in [0]

function Fragment() {
  let fragment = [undefined];
  fragment._frag = true;
  fragment._deps = new Map();
  fragment._type = 'nullish'; // 'plain', 'merged', 'object'
  on(fragment, (...args) => {
    for (let e of fragment._deps) {
      e[1](...args);
    }
  });
  return fragment;
}

function isFragment(thing) {
  return thing?._frag;
}

// TODO we provide keys for fine-grained-update here if possible, like in child component updates
function resultToFragment(result, fragment) {
  if (result === undefined || result === null) {
    fragment._type = 'nullish';
    fragment[0] = result;
    return;
  }

  if (result._frag) {
    fragment[0] = result[0];
    fragment._type = result._type;
    result._deps.set(fragment, (value, keys) => {
      fragment[0] = value;
      emit(fragment, value, keys);
    });
    return;
  }

  if (result._atom) {
    fragment[0] = result[0];
    fragment._type = 'plain';
    return;
  }

  if (result._merged) {
    let updateKeys = setMergedFragment(fragment, result);
    fragment._type = 'merged';
    return updateKeys;
  }

  if (Array.isArray(result) || result instanceof Map || result instanceof Set) {
    fragment[0] = result;
    fragment._type = 'plain';
    return;
  }

  if (typeof result === 'object') {
    let updateKeys = setObjectFragment(fragment, result);
    fragment._type = 'object';
    return updateKeys;
  }

  // plain value
  fragment[0] = result;
  fragment._type = 'plain';
}

function setObjectFragment(fragment, obj) {
  let pureObj = {};
  let keys = fragment._type === 'object' ? [] : undefined;
  let oldObj = fragment[0];
  fragment[0] = pureObj;

  for (let key in obj) {
    let prop = obj[key];
    if (isFragment(prop)) {
      pureObj[key] = prop[0];
      // these listeners should be a class method on (Object)Fragment
      prop._deps.set(fragment, value => {
        // do not forward on non-changes to be consistent with non-fragment props
        if (pureObj[key] === value) return;
        pureObj[key] = value;
        // TODO: should object identity change?
        // TODO: forward deeply nested update info, i.e. use second param?
        emit(fragment, pureObj, [key]);
      });
    } else {
      pureObj[key] = prop;
    }
    // if fragment already was an object fragment, we extract updated keys
    if (keys !== undefined && oldObj[key] !== pureObj[key]) {
      keys.push(key);
    }
  }

  return keys;
}

function merge(...objArray) {
  objArray._merged = true;
  return objArray;
}

// TODO: should sub-object identity change?
// does current model break if it changes?
function setMergedFragment(fragment, objArray) {
  let mergedObj = {};
  let oldObj = fragment[0];
  fragment[0] = mergedObj;

  function updateSelf(value, keys) {
    let objects = objArray.map(oa => (oa._frag ? oa[0] : oa));
    fragment[0] = Object.assign(mergedObj, ...objects);
    emit(fragment, fragment[0], keys ?? Object.keys(value));
  }

  for (let objFragment of objArray) {
    if (isFragment(objFragment)) {
      Object.assign(mergedObj, objFragment[0]);
      objFragment._deps.set(fragment, updateSelf);
    } else {
      Object.assign(mergedObj, objFragment);
    }
  }

  // if fragment already was a merged fragment, we extract updated keys
  let keys;
  if (fragment._type === 'merged') {
    keys = [];
    for (let key in mergedObj) {
      if (oldObj[key] !== mergedObj[key]) {
        keys.push(key);
      }
    }
  }
  return keys;
}

let doLog = !!window.jamConfig?.development;
function debugStateTree() {
  window.root = root;
  doLog = true;
}

function log(...args) {
  if (doLog === false) return;
  causalLog('STATE-TREE', ...args);
}
