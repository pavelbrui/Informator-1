/* eslint-disable */


import { AllTypesProps, ReturnTypes, Ops } from './const.js';
import fetch, { Response } from 'node-fetch';
import WebSocket from 'ws';
export const HOST = "http://localhost:8080/"


export const HEADERS = {}
export const apiSubscription = (options: chainOptions) => (query: string) => {
  try {
    const queryString = options[0] + '?query=' + encodeURIComponent(query);
    const wsString = queryString.replace('http', 'ws');
    const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
    const webSocketOptions = options[1]?.websocket || [host];
    const ws = new WebSocket(...webSocketOptions);
    return {
      ws,
      on: (e: (args: any) => void) => {
        ws.onmessage = (event: any) => {
          if (event.data) {
            const parsed = JSON.parse(event.data);
            const data = parsed.data;
            return e(data);
          }
        };
      },
      off: (e: (args: any) => void) => {
        ws.onclose = e;
      },
      error: (e: (args: any) => void) => {
        ws.onerror = e;
      },
      open: (e: () => void) => {
        ws.onopen = e;
      },
    };
  } catch {
    throw new Error('No websockets implemented');
  }
};
const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json() as Promise<GraphQLResponse>;
};

export const apiFetch =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, unknown> = {}) => {
    const fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === 'GET') {
      return fetch(`${options[0]}?query=${encodeURIComponent(query)}`, fetchOptions)
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetch(`${options[0]}`, {
      body: JSON.stringify({ query, variables }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      ...fetchOptions,
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };

export const InternalsBuildQuery = ({
  ops,
  props,
  returns,
  options,
  scalars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  options?: OperationOptions;
  scalars?: ScalarDefinition;
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p = '',
    root = true,
    vars: Array<{ name: string; graphQLType: string }> = [],
  ): string => {
    const keyForPath = purifyGraphQLKey(k);
    const newPath = [p, keyForPath].join(SEPARATOR);
    if (!o) {
      return '';
    }
    if (typeof o === 'boolean' || typeof o === 'number') {
      return k;
    }
    if (typeof o === 'string') {
      return `${k} ${o}`;
    }
    if (Array.isArray(o)) {
      const args = InternalArgsBuilt({
        props,
        returns,
        ops,
        scalars,
        vars,
      })(o[0], newPath);
      return `${ibb(args ? `${k}(${args})` : k, o[1], p, false, vars)}`;
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(`${alias}:${operationName}`, operation, p, false, vars);
        })
        .join('\n');
    }
    const hasOperationName = root && options?.operationName ? ' ' + options.operationName : '';
    const keyForDirectives = o.__directives ?? '';
    const query = `{${Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map((e) => ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false, vars))
      .join('\n')}}`;
    if (!root) {
      return `${k} ${keyForDirectives}${hasOperationName} ${query}`;
    }
    const varsString = vars.map((v) => `${v.name}: ${v.graphQLType}`).join(', ');
    return `${k} ${keyForDirectives}${hasOperationName}${varsString ? `(${varsString})` : ''} ${query}`;
  };
  return ibb;
};

export const Thunder =
  (fn: FetchFunction) =>
  <O extends keyof typeof Ops, SCLR extends ScalarDefinition, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: (Z & ValueTypes[R]) | ValueTypes[R],
    ops?: OperationOptions & { variables?: Record<string, unknown> },
  ) =>
    fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
      ops?.variables,
    ).then((data) => {
      if (graphqlOptions?.scalars) {
        return decodeScalarsInResponse({
          response: data,
          initialOp: operation,
          initialZeusQuery: o as VType,
          returns: ReturnTypes,
          scalars: graphqlOptions.scalars,
          ops: Ops,
        });
      }
      return data;
    }) as Promise<InputType<GraphQLTypes[R], Z, SCLR>>;

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder =
  (fn: SubscriptionFunction) =>
  <O extends keyof typeof Ops, SCLR extends ScalarDefinition, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: (Z & ValueTypes[R]) | ValueTypes[R],
    ops?: OperationOptions & { variables?: ExtractVariables<Z> },
  ) => {
    const returnedFunction = fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
    ) as SubscriptionToGraphQL<Z, GraphQLTypes[R], SCLR>;
    if (returnedFunction?.on && graphqlOptions?.scalars) {
      const wrapped = returnedFunction.on;
      returnedFunction.on = (fnToCall: (args: InputType<GraphQLTypes[R], Z, SCLR>) => void) =>
        wrapped((data: InputType<GraphQLTypes[R], Z, SCLR>) => {
          if (graphqlOptions?.scalars) {
            return fnToCall(
              decodeScalarsInResponse({
                response: data,
                initialOp: operation,
                initialZeusQuery: o as VType,
                returns: ReturnTypes,
                scalars: graphqlOptions.scalars,
                ops: Ops,
              }),
            );
          }
          return fnToCall(data);
        });
    }
    return returnedFunction;
  };

export const Subscription = (...options: chainOptions) => SubscriptionThunder(apiSubscription(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>,
>(
  operation: O,
  o: (Z & ValueTypes[R]) | ValueTypes[R],
  ops?: {
    operationOptions?: OperationOptions;
    scalars?: ScalarDefinition;
  },
) =>
  InternalsBuildQuery({
    props: AllTypesProps,
    returns: ReturnTypes,
    ops: Ops,
    options: ops?.operationOptions,
    scalars: ops?.scalars,
  })(operation, o as VType);

export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;

export const Selector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();

export const TypeFromSelector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();
export const Gql = Chain(HOST, {
  headers: {
    'Content-Type': 'application/json',
    ...HEADERS,
  },
});

export const ZeusScalars = ZeusSelect<ScalarCoders>();

export const decodeScalarsInResponse = <O extends Operations>({
  response,
  scalars,
  returns,
  ops,
  initialZeusQuery,
  initialOp,
}: {
  ops: O;
  response: any;
  returns: ReturnTypesType;
  scalars?: Record<string, ScalarResolver | undefined>;
  initialOp: keyof O;
  initialZeusQuery: InputValueType | VType;
}) => {
  if (!scalars) {
    return response;
  }
  const builder = PrepareScalarPaths({
    ops,
    returns,
  });

  const scalarPaths = builder(initialOp as string, ops[initialOp], initialZeusQuery);
  if (scalarPaths) {
    const r = traverseResponse({ scalarPaths, resolvers: scalars })(initialOp as string, response, [ops[initialOp]]);
    return r;
  }
  return response;
};

export const traverseResponse = ({
  resolvers,
  scalarPaths,
}: {
  scalarPaths: { [x: string]: `scalar.${string}` };
  resolvers: {
    [x: string]: ScalarResolver | undefined;
  };
}) => {
  const ibb = (k: string, o: InputValueType | VType, p: string[] = []): unknown => {
    if (Array.isArray(o)) {
      return o.map((eachO) => ibb(k, eachO, p));
    }
    if (o == null) {
      return o;
    }
    const scalarPathString = p.join(SEPARATOR);
    const currentScalarString = scalarPaths[scalarPathString];
    if (currentScalarString) {
      const currentDecoder = resolvers[currentScalarString.split('.')[1]]?.decode;
      if (currentDecoder) {
        return currentDecoder(o);
      }
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string' || !o) {
      return o;
    }
    const entries = Object.entries(o).map(([k, v]) => [k, ibb(k, v, [...p, purifyGraphQLKey(k)])] as const);
    const objectFromEntries = entries.reduce<Record<string, unknown>>((a, [k, v]) => {
      a[k] = v;
      return a;
    }, {});
    return objectFromEntries;
  };
  return ibb;
};

export type AllTypesPropsType = {
  [x: string]:
    | undefined
    | `scalar.${string}`
    | 'enum'
    | {
        [x: string]:
          | undefined
          | string
          | {
              [x: string]: string | undefined;
            };
      };
};

export type ReturnTypesType = {
  [x: string]:
    | {
        [x: string]: string | undefined;
      }
    | `scalar.${string}`
    | undefined;
};
export type InputValueType = {
  [x: string]: undefined | boolean | string | number | [any, undefined | boolean | InputValueType] | InputValueType;
};
export type VType =
  | undefined
  | boolean
  | string
  | number
  | [any, undefined | boolean | InputValueType]
  | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
  | PlainType
  | {
      [x: string]: ZeusArgsType;
    }
  | Array<ZeusArgsType>;

export type Operations = Record<string, string>;

export type VariableDefinition = {
  [x: string]: unknown;
};

export const SEPARATOR = '|';

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (...args: infer R) => WebSocket ? R : never;
export type chainOptions = [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }] | [fetchOptions[0]];
export type FetchFunction = (query: string, variables?: Record<string, unknown>) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<F extends [infer ARGS, any] ? ARGS : undefined>;

export type OperationOptions = {
  operationName?: string;
};

export type ScalarCoder = Record<string, (s: unknown) => string>;

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super('');
    console.error(response);
  }
  toString() {
    return 'GraphQL Response Error';
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops ? typeof Ops[O] : never;
export type ThunderGraphQLOptions<SCLR extends ScalarDefinition> = {
  scalars?: SCLR | ScalarCoders;
};

const ExtractScalar = (mappedParts: string[], returns: ReturnTypesType): `scalar.${string}` | undefined => {
  if (mappedParts.length === 0) {
    return;
  }
  const oKey = mappedParts[0];
  const returnP1 = returns[oKey];
  if (typeof returnP1 === 'object') {
    const returnP2 = returnP1[mappedParts[1]];
    if (returnP2) {
      return ExtractScalar([returnP2, ...mappedParts.slice(2)], returns);
    }
    return undefined;
  }
  return returnP1 as `scalar.${string}` | undefined;
};

export const PrepareScalarPaths = ({ ops, returns }: { returns: ReturnTypesType; ops: Operations }) => {
  const ibb = (
    k: string,
    originalKey: string,
    o: InputValueType | VType,
    p: string[] = [],
    pOriginals: string[] = [],
    root = true,
  ): { [x: string]: `scalar.${string}` } | undefined => {
    if (!o) {
      return;
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string') {
      const extractionArray = [...pOriginals, originalKey];
      const isScalar = ExtractScalar(extractionArray, returns);
      if (isScalar?.startsWith('scalar')) {
        const partOfTree = {
          [[...p, k].join(SEPARATOR)]: isScalar,
        };
        return partOfTree;
      }
      return {};
    }
    if (Array.isArray(o)) {
      return ibb(k, k, o[1], p, pOriginals, false);
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(alias, operationName, operation, p, pOriginals, false);
        })
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
    }
    const keyName = root ? ops[k] : k;
    return Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map(([k, v]) => {
        // Inline fragments shouldn't be added to the path as they aren't a field
        const isInlineFragment = originalKey.match(/^...\s*on/) != null;
        return ibb(
          k,
          k,
          v,
          isInlineFragment ? p : [...p, purifyGraphQLKey(keyName || k)],
          isInlineFragment ? pOriginals : [...pOriginals, purifyGraphQLKey(originalKey)],
          false,
        );
      })
      .reduce((a, b) => ({
        ...a,
        ...b,
      }));
  };
  return ibb;
};

export const purifyGraphQLKey = (k: string) => k.replace(/\([^)]*\)/g, '').replace(/^[^:]*\:/g, '');

const mapPart = (p: string) => {
  const [isArg, isField] = p.split('<>');
  if (isField) {
    return {
      v: isField,
      __type: 'field',
    } as const;
  }
  return {
    v: isArg,
    __type: 'arg',
  } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (props: AllTypesPropsType, returns: ReturnTypesType, ops: Operations) => {
  const ResolvePropsType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
    if (propsP1 === 'enum' && mappedParts.length === 1) {
      return 'enum';
    }
    if (typeof propsP1 === 'string' && propsP1.startsWith('scalar.') && mappedParts.length === 1) {
      return propsP1;
    }
    if (typeof propsP1 === 'object') {
      if (mappedParts.length < 2) {
        return 'not';
      }
      const propsP2 = propsP1[mappedParts[1].v];
      if (typeof propsP2 === 'string') {
        return rpp(
          `${propsP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
      if (typeof propsP2 === 'object') {
        if (mappedParts.length < 3) {
          return 'not';
        }
        const propsP3 = propsP2[mappedParts[2].v];
        if (propsP3 && mappedParts[2].__type === 'arg') {
          return rpp(
            `${propsP3}${SEPARATOR}${mappedParts
              .slice(3)
              .map((mp) => mp.v)
              .join(SEPARATOR)}`,
          );
        }
      }
    }
  };
  const ResolveReturnType = (mappedParts: Part[]) => {
    if (mappedParts.length === 0) {
      return 'not';
    }
    const oKey = ops[mappedParts[0].v];
    const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
    if (typeof returnP1 === 'object') {
      if (mappedParts.length < 2) return 'not';
      const returnP2 = returnP1[mappedParts[1].v];
      if (returnP2) {
        return rpp(
          `${returnP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
    }
  };
  const rpp = (path: string): 'enum' | 'not' | `scalar.${string}` => {
    const parts = path.split(SEPARATOR).filter((l) => l.length > 0);
    const mappedParts = parts.map(mapPart);
    const propsP1 = ResolvePropsType(mappedParts);
    if (propsP1) {
      return propsP1;
    }
    const returnP1 = ResolveReturnType(mappedParts);
    if (returnP1) {
      return returnP1;
    }
    return 'not';
  };
  return rpp;
};

export const InternalArgsBuilt = ({
  props,
  ops,
  returns,
  scalars,
  vars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  scalars?: ScalarDefinition;
  vars: Array<{ name: string; graphQLType: string }>;
}) => {
  const arb = (a: ZeusArgsType, p = '', root = true): string => {
    if (typeof a === 'string') {
      if (a.startsWith(START_VAR_NAME)) {
        const [varName, graphQLType] = a.replace(START_VAR_NAME, '$').split(GRAPHQL_TYPE_SEPARATOR);
        const v = vars.find((v) => v.name === varName);
        if (!v) {
          vars.push({
            name: varName,
            graphQLType,
          });
        } else {
          if (v.graphQLType !== graphQLType) {
            throw new Error(
              `Invalid variable exists with two different GraphQL Types, "${v.graphQLType}" and ${graphQLType}`,
            );
          }
        }
        return varName;
      }
    }
    const checkType = ResolveFromPath(props, returns, ops)(p);
    if (checkType.startsWith('scalar.')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...splittedScalar] = checkType.split('.');
      const scalarKey = splittedScalar.join('.');
      return (scalars?.[scalarKey]?.encode?.(a) as string) || JSON.stringify(a);
    }
    if (Array.isArray(a)) {
      return `[${a.map((arr) => arb(arr, p, false)).join(', ')}]`;
    }
    if (typeof a === 'string') {
      if (checkType === 'enum') {
        return a;
      }
      return `${JSON.stringify(a)}`;
    }
    if (typeof a === 'object') {
      if (a === null) {
        return `null`;
      }
      const returnedObjectString = Object.entries(a)
        .filter(([, v]) => typeof v !== 'undefined')
        .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
        .join(',\n');
      if (!root) {
        return `{${returnedObjectString}}`;
      }
      return returnedObjectString;
    }
    return `${a}`;
  };
  return arb;
};

export const resolverFor = <X, T extends keyof ResolverInputTypes, Z extends keyof ResolverInputTypes[T]>(
  type: T,
  field: Z,
  fn: (
    args: Required<ResolverInputTypes[T]>[Z] extends [infer Input, any] ? Input : any,
    source: any,
  ) => Z extends keyof ModelTypes[T] ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X : never,
) => fn as (args?: any, source?: any) => ReturnType<typeof fn>;

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<UnwrapPromise<ReturnType<T>>>;
export type ZeusHook<
  T extends (...args: any[]) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>,
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
  __typename?: boolean;
  __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
export type ScalarDefinition = Record<string, ScalarResolver>;

type IsScalar<S, SCLR extends ScalarDefinition> = S extends 'scalar' & { name: infer T }
  ? T extends keyof SCLR
    ? SCLR[T]['decode'] extends (s: unknown) => unknown
      ? ReturnType<SCLR[T]['decode']>
      : unknown
    : unknown
  : S;
type IsArray<T, U, SCLR extends ScalarDefinition> = T extends Array<infer R>
  ? InputType<R, U, SCLR>[]
  : InputType<T, U, SCLR>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string | Variable<any, string>;

type IsInterfaced<SRC extends DeepAnify<DST>, DST, SCLR extends ScalarDefinition> = FlattenArray<SRC> extends
  | ZEUS_INTERFACES
  | ZEUS_UNIONS
  ? {
      [P in keyof SRC]: SRC[P] extends '__union' & infer R
        ? P extends keyof DST
          ? IsArray<R, '__typename' extends keyof DST ? DST[P] & { __typename: true } : DST[P], SCLR>
          : IsArray<R, '__typename' extends keyof DST ? { __typename: true } : Record<string, never>, SCLR>
        : never;
    }[keyof SRC] & {
      [P in keyof Omit<
        Pick<
          SRC,
          {
            [P in keyof DST]: SRC[P] extends '__union' & infer R ? never : P;
          }[keyof DST]
        >,
        '__typename'
      >]: IsPayLoad<DST[P]> extends BaseZeusResolver ? IsScalar<SRC[P], SCLR> : IsArray<SRC[P], DST[P], SCLR>;
    }
  : {
      [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<DST[P]> extends BaseZeusResolver
        ? IsScalar<SRC[P], SCLR>
        : IsArray<SRC[P], DST[P], SCLR>;
    };

export type MapType<SRC, DST, SCLR extends ScalarDefinition> = SRC extends DeepAnify<DST>
  ? IsInterfaced<SRC, DST, SCLR>
  : never;
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputType<SRC, DST, SCLR extends ScalarDefinition = {}> = IsPayLoad<DST> extends { __alias: infer R }
  ? {
      [P in keyof R]: MapType<SRC, R[P], SCLR>[keyof MapType<SRC, R[P], SCLR>];
    } & MapType<SRC, Omit<IsPayLoad<DST>, '__alias'>, SCLR>
  : MapType<SRC, IsPayLoad<DST>, SCLR>;
export type SubscriptionToGraphQL<Z, T, SCLR extends ScalarDefinition> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
  off: (fn: (e: { data?: InputType<T, Z, SCLR>; code?: number; reason?: string; message?: string }) => void) => void;
  error: (fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void) => void;
  open: () => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FromSelector<SELECTOR, NAME extends keyof GraphQLTypes, SCLR extends ScalarDefinition = {}> = InputType<
  GraphQLTypes[NAME],
  SELECTOR,
  SCLR
>;

export type ScalarResolver = {
  encode?: (s: unknown) => string;
  decode?: (s: unknown) => unknown;
};

export type SelectionFunction<V> = <T>(t: T | V) => T;

type BuiltInVariableTypes = {
  ['String']: string;
  ['Int']: number;
  ['Float']: number;
  ['ID']: unknown;
  ['Boolean']: boolean;
};
type AllVariableTypes = keyof BuiltInVariableTypes | keyof ZEUS_VARIABLES;
type VariableRequired<T extends string> = `${T}!` | T | `[${T}]` | `[${T}]!` | `[${T}!]` | `[${T}!]!`;
type VR<T extends string> = VariableRequired<VariableRequired<T>>;

export type GraphQLVariableType = VR<AllVariableTypes>;

type ExtractVariableTypeString<T extends string> = T extends VR<infer R1>
  ? R1 extends VR<infer R2>
    ? R2 extends VR<infer R3>
      ? R3 extends VR<infer R4>
        ? R4 extends VR<infer R5>
          ? R5
          : R4
        : R3
      : R2
    : R1
  : T;

type DecomposeType<T, Type> = T extends `[${infer R}]`
  ? Array<DecomposeType<R, Type>> | undefined
  : T extends `${infer R}!`
  ? NonNullable<DecomposeType<R, Type>>
  : Type | undefined;

type ExtractTypeFromGraphQLType<T extends string> = T extends keyof ZEUS_VARIABLES
  ? ZEUS_VARIABLES[T]
  : T extends keyof BuiltInVariableTypes
  ? BuiltInVariableTypes[T]
  : any;

export type GetVariableType<T extends string> = DecomposeType<
  T,
  ExtractTypeFromGraphQLType<ExtractVariableTypeString<T>>
>;

type UndefinedKeys<T> = {
  [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K;
}[keyof T];

type WithNullableKeys<T> = Pick<T, UndefinedKeys<T>>;
type WithNonNullableKeys<T> = Omit<T, UndefinedKeys<T>>;

type OptionalKeys<T> = {
  [P in keyof T]?: T[P];
};

export type WithOptionalNullables<T> = OptionalKeys<WithNullableKeys<T>> & WithNonNullableKeys<T>;

export type Variable<T extends GraphQLVariableType, Name extends string> = {
  ' __zeus_name': Name;
  ' __zeus_type': T;
};

export type ExtractVariables<Query> = Query extends Variable<infer VType, infer VName>
  ? { [key in VName]: GetVariableType<VType> }
  : Query extends [infer Inputs, infer Outputs]
  ? ExtractVariables<Inputs> & ExtractVariables<Outputs>
  : Query extends string | number | boolean
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : UnionToIntersection<{ [K in keyof Query]: WithOptionalNullables<ExtractVariables<Query[K]>> }[keyof Query]>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export const START_VAR_NAME = `$ZEUS_VAR`;
export const GRAPHQL_TYPE_SEPARATOR = `__$GRAPHQL__`;

export const $ = <Type extends GraphQLVariableType, Name extends string>(name: Name, graphqlType: Type) => {
  return (START_VAR_NAME + name + GRAPHQL_TYPE_SEPARATOR + graphqlType) as unknown as Variable<Type, Name>;
};
type ZEUS_INTERFACES = never
export type ScalarCoders = {
	DgraphDateTime?: ScalarResolver;
	AWSDateTime?: ScalarResolver;
	AWSDate?: ScalarResolver;
	AWSTime?: ScalarResolver;
	AWSTimestamp?: ScalarResolver;
	AWSEmail?: ScalarResolver;
	AWSJSON?: ScalarResolver;
	AWSURL?: ScalarResolver;
	AWSPhone?: ScalarResolver;
	AWSIPAddress?: ScalarResolver;
}
type ZEUS_UNIONS = never

export type ValueTypes = {
    ["Mutation"]: AliasType<{
	telegram?:ValueTypes["TelegramMutation"],
		__typename?: boolean | `@${string}`
}>;
	["TelegramMutation"]: AliasType<{
	startBot?:boolean | `@${string}`,
	startBotRu?:boolean | `@${string}`,
	startBotClone?:boolean | `@${string}`,
newChats?: [{	ids?: Array<string | undefined | null> | undefined | null | Variable<any, string>},boolean | `@${string}`],
		__typename?: boolean | `@${string}`
}>;
	["TelegramQuery"]: AliasType<{
	getCookies?:boolean | `@${string}`,
getChats?: [{	regName?: string | undefined | null | Variable<any, string>},ValueTypes["Chat"]],
getChatsMessages?: [{	input: Array<ValueTypes["GetInfoInput"]> | Variable<any, string>},ValueTypes["Message"]],
getChatContent?: [{	input: ValueTypes["GetInfoInput"] | Variable<any, string>},boolean | `@${string}`],
getMessagesFromManyChats?: [{	daysAgo?: number | undefined | null | Variable<any, string>,	keyWords?: Array<Array<string> | undefined | null> | Variable<any, string>,	keyWordsReg?: boolean | undefined | null | Variable<any, string>,	chats?: Array<string> | undefined | null | Variable<any, string>,	chatsReg?: boolean | undefined | null | Variable<any, string>},ValueTypes["Message"]],
getMessagesByTags?: [{	daysAgo?: number | undefined | null | Variable<any, string>,	keyWords?: Array<Array<string>> | Variable<any, string>,	keyWordsReg?: boolean | undefined | null | Variable<any, string>,	collections?: Array<string> | undefined | null | Variable<any, string>,	collectionsReg?: boolean | undefined | null | Variable<any, string>,	chats?: Array<string> | undefined | null | Variable<any, string>,	chatsReg?: boolean | undefined | null | Variable<any, string>},ValueTypes["FiltersResponse"]],
getMessagesByTagsAndTopic?: [{	daysAgo?: number | undefined | null | Variable<any, string>,	topic: Array<string> | Variable<any, string>,	keyWords?: Array<Array<string> | undefined | null> | Variable<any, string>,	keyWordsReg?: boolean | undefined | null | Variable<any, string>,	collections?: Array<string> | undefined | null | Variable<any, string>,	collectionsReg?: boolean | undefined | null | Variable<any, string>,	chats?: Array<string> | undefined | null | Variable<any, string>,	chatsReg?: boolean | undefined | null | Variable<any, string>},ValueTypes["Message"]],
getMessagesByTopic?: [{	daysAgo?: number | undefined | null | Variable<any, string>,	topic: Array<string> | Variable<any, string>,	collections?: Array<string> | undefined | null | Variable<any, string>,	collectionsReg?: boolean | undefined | null | Variable<any, string>,	chats?: Array<string> | undefined | null | Variable<any, string>,	chatsReg?: boolean | undefined | null | Variable<any, string>},ValueTypes["Message"]],
		__typename?: boolean | `@${string}`
}>;
	["FiltersResponse"]: AliasType<{
	messages?:ValueTypes["Message"],
	length?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["GetInfoInput"]: {
	chat_id?: Array<string | undefined | null> | undefined | null | Variable<any, string>,
	regContentTags?: Array<string | undefined | null> | undefined | null | Variable<any, string>,
	regChatName: string | Variable<any, string>,
	chatsCount?: number | undefined | null | Variable<any, string>,
	messageCount?: number | undefined | null | Variable<any, string>,
	images?: boolean | undefined | null | Variable<any, string>
};
	["Message"]: AliasType<{
	from?:boolean | `@${string}`,
	from_id?:boolean | `@${string}`,
	text?:boolean | `@${string}`,
	date?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	chat_id?:boolean | `@${string}`,
	chat_name?:boolean | `@${string}`,
	message_thread_id?:boolean | `@${string}`,
	reply_to?:boolean | `@${string}`,
	photo?:boolean | `@${string}`,
	type?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Chat"]: AliasType<{
	type?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	username?:boolean | `@${string}`,
	name_id?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	updateAt?:boolean | `@${string}`,
	messages?:ValueTypes["Message"],
		__typename?: boolean | `@${string}`
}>;
	["Query"]: AliasType<{
	telegram?:ValueTypes["TelegramQuery"],
		__typename?: boolean | `@${string}`
}>;
	["ResponseWithUrls"]: AliasType<{
	responseText?:boolean | `@${string}`,
	urls?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["LoginType"]:LoginType;
	["DgraphDgraphIndex"]:DgraphDgraphIndex;
	["DgraphDateTime"]:unknown;
	["AWSDateTime"]:unknown;
	["AWSDate"]:unknown;
	["AWSTime"]:unknown;
	["AWSTimestamp"]:unknown;
	["AWSEmail"]:unknown;
	["AWSJSON"]:unknown;
	["AWSURL"]:unknown;
	["AWSPhone"]:unknown;
	["AWSIPAddress"]:unknown;
	["ModelMutationMap"]: {
	create?: string | undefined | null | Variable<any, string>,
	update?: string | undefined | null | Variable<any, string>,
	delete?: string | undefined | null | Variable<any, string>
};
	["ModelQueryMap"]: {
	get?: string | undefined | null | Variable<any, string>,
	list?: string | undefined | null | Variable<any, string>
};
	["ModelSubscriptionMap"]: {
	onCreate?: Array<string | undefined | null> | undefined | null | Variable<any, string>,
	onUpdate?: Array<string | undefined | null> | undefined | null | Variable<any, string>,
	onDelete?: Array<string | undefined | null> | undefined | null | Variable<any, string>,
	level?: ValueTypes["ModelSubscriptionLevel"] | undefined | null | Variable<any, string>
};
	["ModelSubscriptionLevel"]:ModelSubscriptionLevel;
	["TimestampConfiguration"]: {
	createdAt?: string | undefined | null | Variable<any, string>,
	updatedAt?: string | undefined | null | Variable<any, string>
};
	["HttpMethod"]:HttpMethod;
	["HttpHeader"]: {
	key?: string | undefined | null | Variable<any, string>,
	value?: string | undefined | null | Variable<any, string>
};
	["PredictionsActions"]:PredictionsActions;
	["SearchableQueryMap"]: {
	search?: string | undefined | null | Variable<any, string>
};
	["AuthRule"]: {
	allow: ValueTypes["AuthStrategy"] | Variable<any, string>,
	provider?: ValueTypes["AuthProvider"] | undefined | null | Variable<any, string>,
	ownerField?: string | undefined | null | Variable<any, string>,
	identityClaim?: string | undefined | null | Variable<any, string>,
	groupClaim?: string | undefined | null | Variable<any, string>,
	groups?: Array<string | undefined | null> | undefined | null | Variable<any, string>,
	groupsField?: string | undefined | null | Variable<any, string>,
	operations?: Array<ValueTypes["ModelOperation"] | undefined | null> | undefined | null | Variable<any, string>,
	queries?: Array<ValueTypes["ModelQuery"] | undefined | null> | undefined | null | Variable<any, string>,
	mutations?: Array<ValueTypes["ModelMutation"] | undefined | null> | undefined | null | Variable<any, string>
};
	["AuthStrategy"]:AuthStrategy;
	["AuthProvider"]:AuthProvider;
	["ModelOperation"]:ModelOperation;
	["ModelQuery"]:ModelQuery;
	["ModelMutation"]:ModelMutation
  }

export type ResolverInputTypes = {
    ["Mutation"]: AliasType<{
	telegram?:ResolverInputTypes["TelegramMutation"],
		__typename?: boolean | `@${string}`
}>;
	["TelegramMutation"]: AliasType<{
	startBot?:boolean | `@${string}`,
	startBotRu?:boolean | `@${string}`,
	startBotClone?:boolean | `@${string}`,
newChats?: [{	ids?: Array<string | undefined | null> | undefined | null},boolean | `@${string}`],
		__typename?: boolean | `@${string}`
}>;
	["TelegramQuery"]: AliasType<{
	getCookies?:boolean | `@${string}`,
getChats?: [{	regName?: string | undefined | null},ResolverInputTypes["Chat"]],
getChatsMessages?: [{	input: Array<ResolverInputTypes["GetInfoInput"]>},ResolverInputTypes["Message"]],
getChatContent?: [{	input: ResolverInputTypes["GetInfoInput"]},boolean | `@${string}`],
getMessagesFromManyChats?: [{	daysAgo?: number | undefined | null,	keyWords?: Array<Array<string> | undefined | null>,	keyWordsReg?: boolean | undefined | null,	chats?: Array<string> | undefined | null,	chatsReg?: boolean | undefined | null},ResolverInputTypes["Message"]],
getMessagesByTags?: [{	daysAgo?: number | undefined | null,	keyWords?: Array<Array<string> | undefined | null>,	keyWordsReg?: boolean | undefined | null,	collections?: Array<string> | undefined | null,	collectionsReg?: boolean | undefined | null,	chats?: Array<string> | undefined | null,	chatsReg?: boolean | undefined | null},ResolverInputTypes["FiltersResponse"]],
getMessagesByTagsAndTopic?: [{	daysAgo?: number | undefined | null,	topic: Array<string>,	keyWords?: Array<Array<string> | undefined | null>,	keyWordsReg?: boolean | undefined | null,	collections?: Array<string> | undefined | null,	collectionsReg?: boolean | undefined | null,	chats?: Array<string> | undefined | null,	chatsReg?: boolean | undefined | null},ResolverInputTypes["Message"]],
getMessagesByTopic?: [{	daysAgo?: number | undefined | null,	topic: Array<string>,	collections?: Array<string> | undefined | null,	collectionsReg?: boolean | undefined | null,	chats?: Array<string> | undefined | null,	chatsReg?: boolean | undefined | null},ResolverInputTypes["Message"]],
		__typename?: boolean | `@${string}`
}>;
	["FiltersResponse"]: AliasType<{
	messages?:ResolverInputTypes["Message"],
	length?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["GetInfoInput"]: {
	chat_id?: Array<string | undefined | null> | undefined | null,
	regContentTags?: Array<string | undefined | null> | undefined | null,
	regChatName: string,
	chatsCount?: number | undefined | null,
	messageCount?: number | undefined | null,
	images?: boolean | undefined | null
};
	["Message"]: AliasType<{
	from?:boolean | `@${string}`,
	from_id?:boolean | `@${string}`,
	text?:boolean | `@${string}`,
	date?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	chat_id?:boolean | `@${string}`,
	chat_name?:boolean | `@${string}`,
	message_thread_id?:boolean | `@${string}`,
	reply_to?:boolean | `@${string}`,
	photo?:boolean | `@${string}`,
	type?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Chat"]: AliasType<{
	type?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	username?:boolean | `@${string}`,
	name_id?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	updateAt?:boolean | `@${string}`,
	messages?:ResolverInputTypes["Message"],
		__typename?: boolean | `@${string}`
}>;
	["Query"]: AliasType<{
	telegram?:ResolverInputTypes["TelegramQuery"],
		__typename?: boolean | `@${string}`
}>;
	["ResponseWithUrls"]: AliasType<{
	responseText?:boolean | `@${string}`,
	urls?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["LoginType"]:LoginType;
	["schema"]: AliasType<{
	query?:ResolverInputTypes["Query"],
	mutation?:ResolverInputTypes["Mutation"],
		__typename?: boolean | `@${string}`
}>;
	["DgraphDgraphIndex"]:DgraphDgraphIndex;
	["DgraphDateTime"]:unknown;
	["AWSDateTime"]:unknown;
	["AWSDate"]:unknown;
	["AWSTime"]:unknown;
	["AWSTimestamp"]:unknown;
	["AWSEmail"]:unknown;
	["AWSJSON"]:unknown;
	["AWSURL"]:unknown;
	["AWSPhone"]:unknown;
	["AWSIPAddress"]:unknown;
	["ModelMutationMap"]: {
	create?: string | undefined | null,
	update?: string | undefined | null,
	delete?: string | undefined | null
};
	["ModelQueryMap"]: {
	get?: string | undefined | null,
	list?: string | undefined | null
};
	["ModelSubscriptionMap"]: {
	onCreate?: Array<string | undefined | null> | undefined | null,
	onUpdate?: Array<string | undefined | null> | undefined | null,
	onDelete?: Array<string | undefined | null> | undefined | null,
	level?: ResolverInputTypes["ModelSubscriptionLevel"] | undefined | null
};
	["ModelSubscriptionLevel"]:ModelSubscriptionLevel;
	["TimestampConfiguration"]: {
	createdAt?: string | undefined | null,
	updatedAt?: string | undefined | null
};
	["HttpMethod"]:HttpMethod;
	["HttpHeader"]: {
	key?: string | undefined | null,
	value?: string | undefined | null
};
	["PredictionsActions"]:PredictionsActions;
	["SearchableQueryMap"]: {
	search?: string | undefined | null
};
	["AuthRule"]: {
	allow: ResolverInputTypes["AuthStrategy"],
	provider?: ResolverInputTypes["AuthProvider"] | undefined | null,
	ownerField?: string | undefined | null,
	identityClaim?: string | undefined | null,
	groupClaim?: string | undefined | null,
	groups?: Array<string | undefined | null> | undefined | null,
	groupsField?: string | undefined | null,
	operations?: Array<ResolverInputTypes["ModelOperation"] | undefined | null> | undefined | null,
	queries?: Array<ResolverInputTypes["ModelQuery"] | undefined | null> | undefined | null,
	mutations?: Array<ResolverInputTypes["ModelMutation"] | undefined | null> | undefined | null
};
	["AuthStrategy"]:AuthStrategy;
	["AuthProvider"]:AuthProvider;
	["ModelOperation"]:ModelOperation;
	["ModelQuery"]:ModelQuery;
	["ModelMutation"]:ModelMutation
  }

export type ModelTypes = {
    ["Mutation"]: {
		telegram: ModelTypes["TelegramMutation"]
};
	["TelegramMutation"]: {
		startBot: boolean,
	startBotRu: boolean,
	startBotClone: boolean,
	newChats: boolean
};
	["TelegramQuery"]: {
		getCookies: boolean,
	getChats?: Array<ModelTypes["Chat"]> | undefined,
	getChatsMessages?: Array<ModelTypes["Message"]> | undefined,
	getChatContent?: Array<string> | undefined,
	getMessagesFromManyChats?: Array<ModelTypes["Message"]> | undefined,
	getMessagesByTags?: ModelTypes["FiltersResponse"] | undefined,
	getMessagesByTagsAndTopic?: Array<ModelTypes["Message"]> | undefined,
	getMessagesByTopic?: Array<ModelTypes["Message"]> | undefined
};
	["FiltersResponse"]: {
		messages?: Array<ModelTypes["Message"]> | undefined,
	length?: number | undefined
};
	["GetInfoInput"]: {
	chat_id?: Array<string | undefined> | undefined,
	regContentTags?: Array<string | undefined> | undefined,
	regChatName: string,
	chatsCount?: number | undefined,
	messageCount?: number | undefined,
	images?: boolean | undefined
};
	["Message"]: {
		from: string,
	from_id?: string | undefined,
	text: string,
	date?: string | undefined,
	_id?: string | undefined,
	chat_id?: string | undefined,
	chat_name?: string | undefined,
	message_thread_id?: string | undefined,
	reply_to?: string | undefined,
	photo?: string | undefined,
	type?: string | undefined
};
	["Chat"]: {
		type?: string | undefined,
	_id?: string | undefined,
	username?: string | undefined,
	name_id?: string | undefined,
	name: string,
	updateAt?: string | undefined,
	messages?: Array<ModelTypes["Message"]> | undefined
};
	["Query"]: {
		telegram: ModelTypes["TelegramQuery"]
};
	["ResponseWithUrls"]: {
		responseText?: string | undefined,
	urls?: Array<string> | undefined
};
	["LoginType"]:LoginType;
	["schema"]: {
	query?: ModelTypes["Query"] | undefined,
	mutation?: ModelTypes["Mutation"] | undefined
};
	["DgraphDgraphIndex"]:DgraphDgraphIndex;
	["DgraphDateTime"]:any;
	["AWSDateTime"]:any;
	["AWSDate"]:any;
	["AWSTime"]:any;
	["AWSTimestamp"]:any;
	["AWSEmail"]:any;
	["AWSJSON"]:any;
	["AWSURL"]:any;
	["AWSPhone"]:any;
	["AWSIPAddress"]:any;
	["ModelMutationMap"]: {
	create?: string | undefined,
	update?: string | undefined,
	delete?: string | undefined
};
	["ModelQueryMap"]: {
	get?: string | undefined,
	list?: string | undefined
};
	["ModelSubscriptionMap"]: {
	onCreate?: Array<string | undefined> | undefined,
	onUpdate?: Array<string | undefined> | undefined,
	onDelete?: Array<string | undefined> | undefined,
	level?: ModelTypes["ModelSubscriptionLevel"] | undefined
};
	["ModelSubscriptionLevel"]:ModelSubscriptionLevel;
	["TimestampConfiguration"]: {
	createdAt?: string | undefined,
	updatedAt?: string | undefined
};
	["HttpMethod"]:HttpMethod;
	["HttpHeader"]: {
	key?: string | undefined,
	value?: string | undefined
};
	["PredictionsActions"]:PredictionsActions;
	["SearchableQueryMap"]: {
	search?: string | undefined
};
	["AuthRule"]: {
	allow: ModelTypes["AuthStrategy"],
	provider?: ModelTypes["AuthProvider"] | undefined,
	ownerField?: string | undefined,
	identityClaim?: string | undefined,
	groupClaim?: string | undefined,
	groups?: Array<string | undefined> | undefined,
	groupsField?: string | undefined,
	operations?: Array<ModelTypes["ModelOperation"] | undefined> | undefined,
	queries?: Array<ModelTypes["ModelQuery"] | undefined> | undefined,
	mutations?: Array<ModelTypes["ModelMutation"] | undefined> | undefined
};
	["AuthStrategy"]:AuthStrategy;
	["AuthProvider"]:AuthProvider;
	["ModelOperation"]:ModelOperation;
	["ModelQuery"]:ModelQuery;
	["ModelMutation"]:ModelMutation
    }

export type GraphQLTypes = {
    // https://docs.aws.amazon.com/appsync/latest/devguide/scalars.html;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/amplify-graphql-model-transformer/src/graphql-model-transformer.ts#L126;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/amplify-graphql-maps-to-transformer/src/graphql-maps-to-transformer.ts#L14;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/amplify-graphql-index-transformer/src/graphql-primary-key-transformer.ts#L31;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/amplify-graphql-index-transformer/src/graphql-index-transformer.ts#L24;
	// https://github.com/aws-amplify/amplify-cli/tree/master/packages/amplify-graphql-function-transformer;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/amplify-graphql-http-transformer/src/graphql-http-transformer.ts#L74;
	// https://github.com/aws-amplify/amplify-cli/tree/master/packages/amplify-graphql-predictions-transformer#predictions;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/amplify-graphql-searchable-transformer/src/graphql-searchable-transformer.ts#L64;
	// Streams data from DynamoDB to OpenSearch and exposes search capabilities.;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/amplify-graphql-relational-transformer/src/graphql-has-one-transformer.ts#L26;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/amplify-graphql-relational-transformer/src/graphql-has-many-transformer.ts#L27;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/amplify-graphql-relational-transformer/src/graphql-belongs-to-transformer.ts#L25;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/amplify-graphql-relational-transformer/src/graphql-many-to-many-transformer.ts#L40;
	// V2: https://docs.amplify.aws/cli/graphql/authorization-rules/#how-it-works;
	// V1: https://docs.amplify.aws/cli-legacy/graphql-transformer/auth/#definition;
	// When applied to a type, augments the application with;
	// owner and group-based authorization rules.;
	// V1: The following arguments are deprecated. It is encouraged to use the 'operations' argument.;
	// V1: The following objects are deprecated. It is encouraged to use ModelOperations.;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/graphql-connection-transformer/src/ModelConnectionTransformer.ts#L170;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/graphql-versioned-transformer/src/VersionedModelTransformer.ts#L21;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/amplify-appsync-simulator/src/schema/directives/auth.ts#L15;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/amplify-appsync-simulator/src/schema/directives/aws-subscribe.ts#L6;
	// https://github.com/aws-amplify/amplify-cli/blob/master/packages/graphql-key-transformer/src/KeyTransformer.ts#L84;
	["Mutation"]: {
	__typename: "Mutation",
	telegram: GraphQLTypes["TelegramMutation"]
};
	["TelegramMutation"]: {
	__typename: "TelegramMutation",
	startBot: boolean,
	startBotRu: boolean,
	startBotClone: boolean,
	newChats: boolean
};
	["TelegramQuery"]: {
	__typename: "TelegramQuery",
	getCookies: boolean,
	getChats?: Array<GraphQLTypes["Chat"]> | undefined,
	getChatsMessages?: Array<GraphQLTypes["Message"]> | undefined,
	getChatContent?: Array<string> | undefined,
	getMessagesFromManyChats?: Array<GraphQLTypes["Message"]> | undefined,
	getMessagesByTags?: GraphQLTypes["FiltersResponse"] | undefined,
	getMessagesByTagsAndTopic?: Array<GraphQLTypes["Message"]> | undefined,
	getMessagesByTopic?: Array<GraphQLTypes["Message"]> | undefined
};
	["FiltersResponse"]: {
	__typename: "FiltersResponse",
	messages?: Array<GraphQLTypes["Message"]> | undefined,
	length?: number | undefined
};
	["GetInfoInput"]: {
		chat_id?: Array<string | undefined> | undefined,
	regContentTags?: Array<string | undefined> | undefined,
	regChatName: string,
	chatsCount?: number | undefined,
	messageCount?: number | undefined,
	images?: boolean | undefined
};
	["Message"]: {
	__typename: "Message",
	from: string,
	from_id?: string | undefined,
	text: string,
	date?: string | undefined,
	_id?: string | undefined,
	chat_id?: string | undefined,
	chat_name?: string | undefined,
	message_thread_id?: string | undefined,
	reply_to?: string | undefined,
	photo?: string | undefined,
	type?: string | undefined
};
	["Chat"]: {
	__typename: "Chat",
	type?: string | undefined,
	_id?: string | undefined,
	username?: string | undefined,
	name_id?: string | undefined,
	name: string,
	updateAt?: string | undefined,
	messages?: Array<GraphQLTypes["Message"]> | undefined
};
	["Query"]: {
	__typename: "Query",
	telegram: GraphQLTypes["TelegramQuery"]
};
	["ResponseWithUrls"]: {
	__typename: "ResponseWithUrls",
	responseText?: string | undefined,
	urls?: Array<string> | undefined
};
	["LoginType"]: LoginType;
	["DgraphDgraphIndex"]: DgraphDgraphIndex;
	["DgraphDateTime"]: "scalar" & { name: "DgraphDateTime" };
	["AWSDateTime"]: "scalar" & { name: "AWSDateTime" };
	["AWSDate"]: "scalar" & { name: "AWSDate" };
	["AWSTime"]: "scalar" & { name: "AWSTime" };
	["AWSTimestamp"]: "scalar" & { name: "AWSTimestamp" };
	["AWSEmail"]: "scalar" & { name: "AWSEmail" };
	["AWSJSON"]: "scalar" & { name: "AWSJSON" };
	["AWSURL"]: "scalar" & { name: "AWSURL" };
	["AWSPhone"]: "scalar" & { name: "AWSPhone" };
	["AWSIPAddress"]: "scalar" & { name: "AWSIPAddress" };
	["ModelMutationMap"]: {
		create?: string | undefined,
	update?: string | undefined,
	delete?: string | undefined
};
	["ModelQueryMap"]: {
		get?: string | undefined,
	list?: string | undefined
};
	["ModelSubscriptionMap"]: {
		onCreate?: Array<string | undefined> | undefined,
	onUpdate?: Array<string | undefined> | undefined,
	onDelete?: Array<string | undefined> | undefined,
	level?: GraphQLTypes["ModelSubscriptionLevel"] | undefined
};
	["ModelSubscriptionLevel"]: ModelSubscriptionLevel;
	["TimestampConfiguration"]: {
		createdAt?: string | undefined,
	updatedAt?: string | undefined
};
	["HttpMethod"]: HttpMethod;
	["HttpHeader"]: {
		key?: string | undefined,
	value?: string | undefined
};
	["PredictionsActions"]: PredictionsActions;
	["SearchableQueryMap"]: {
		search?: string | undefined
};
	["AuthRule"]: {
		allow: GraphQLTypes["AuthStrategy"],
	provider?: GraphQLTypes["AuthProvider"] | undefined,
	ownerField?: string | undefined,
	identityClaim?: string | undefined,
	groupClaim?: string | undefined,
	groups?: Array<string | undefined> | undefined,
	groupsField?: string | undefined,
	operations?: Array<GraphQLTypes["ModelOperation"] | undefined> | undefined,
	queries?: Array<GraphQLTypes["ModelQuery"] | undefined> | undefined,
	mutations?: Array<GraphQLTypes["ModelMutation"] | undefined> | undefined
};
	["AuthStrategy"]: AuthStrategy;
	["AuthProvider"]: AuthProvider;
	["ModelOperation"]: ModelOperation;
	["ModelQuery"]: ModelQuery;
	["ModelMutation"]: ModelMutation
    }
export const enum LoginType {
	Login_with_Olx_password = "Login_with_Olx_password",
	Login_with_Google_account = "Login_with_Google_account",
	Login_with_cookies_instead_password = "Login_with_cookies_instead_password"
}
export const enum DgraphDgraphIndex {
	int = "int",
	float = "float",
	bool = "bool",
	hash = "hash",
	exact = "exact",
	term = "term",
	fulltext = "fulltext",
	trigram = "trigram",
	regexp = "regexp",
	year = "year",
	month = "month",
	day = "day",
	hour = "hour"
}
export const enum ModelSubscriptionLevel {
	off = "off",
	public = "public",
	on = "on"
}
export const enum HttpMethod {
	GET = "GET",
	POST = "POST",
	PUT = "PUT",
	DELETE = "DELETE",
	PATCH = "PATCH"
}
export const enum PredictionsActions {
	identifyText = "identifyText",
	identifyLabels = "identifyLabels",
	convertTextToSpeech = "convertTextToSpeech",
	translateText = "translateText"
}
export const enum AuthStrategy {
	owner = "owner",
	groups = "groups",
	private = "private",
	public = "public",
	custom = "custom"
}
export const enum AuthProvider {
	apiKey = "apiKey",
	iam = "iam",
	oidc = "oidc",
	userPools = "userPools",
	function = "function"
}
export const enum ModelOperation {
	create = "create",
	update = "update",
	delete = "delete",
	read = "read"
}
export const enum ModelQuery {
	get = "get",
	list = "list"
}
export const enum ModelMutation {
	create = "create",
	update = "update",
	delete = "delete"
}

type ZEUS_VARIABLES = {
	["GetInfoInput"]: ValueTypes["GetInfoInput"];
	["LoginType"]: ValueTypes["LoginType"];
	["DgraphDgraphIndex"]: ValueTypes["DgraphDgraphIndex"];
	["DgraphDateTime"]: ValueTypes["DgraphDateTime"];
	["AWSDateTime"]: ValueTypes["AWSDateTime"];
	["AWSDate"]: ValueTypes["AWSDate"];
	["AWSTime"]: ValueTypes["AWSTime"];
	["AWSTimestamp"]: ValueTypes["AWSTimestamp"];
	["AWSEmail"]: ValueTypes["AWSEmail"];
	["AWSJSON"]: ValueTypes["AWSJSON"];
	["AWSURL"]: ValueTypes["AWSURL"];
	["AWSPhone"]: ValueTypes["AWSPhone"];
	["AWSIPAddress"]: ValueTypes["AWSIPAddress"];
	["ModelMutationMap"]: ValueTypes["ModelMutationMap"];
	["ModelQueryMap"]: ValueTypes["ModelQueryMap"];
	["ModelSubscriptionMap"]: ValueTypes["ModelSubscriptionMap"];
	["ModelSubscriptionLevel"]: ValueTypes["ModelSubscriptionLevel"];
	["TimestampConfiguration"]: ValueTypes["TimestampConfiguration"];
	["HttpMethod"]: ValueTypes["HttpMethod"];
	["HttpHeader"]: ValueTypes["HttpHeader"];
	["PredictionsActions"]: ValueTypes["PredictionsActions"];
	["SearchableQueryMap"]: ValueTypes["SearchableQueryMap"];
	["AuthRule"]: ValueTypes["AuthRule"];
	["AuthStrategy"]: ValueTypes["AuthStrategy"];
	["AuthProvider"]: ValueTypes["AuthProvider"];
	["ModelOperation"]: ValueTypes["ModelOperation"];
	["ModelQuery"]: ValueTypes["ModelQuery"];
	["ModelMutation"]: ValueTypes["ModelMutation"];
}