/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as expenses from "../expenses.js";
import type * as groupMembers from "../groupMembers.js";
import type * as groups from "../groups.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_balances from "../lib/balances.js";
import type * as lib_currency from "../lib/currency.js";
import type * as lib_groupData from "../lib/groupData.js";
import type * as settlements from "../settlements.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  expenses: typeof expenses;
  groupMembers: typeof groupMembers;
  groups: typeof groups;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/balances": typeof lib_balances;
  "lib/currency": typeof lib_currency;
  "lib/groupData": typeof lib_groupData;
  settlements: typeof settlements;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
