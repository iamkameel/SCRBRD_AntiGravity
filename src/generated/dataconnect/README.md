# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListPeople*](#listpeople)
  - [*GetPerson*](#getperson)
  - [*ListFixtures*](#listfixtures)
  - [*ListOrganisations*](#listorganisations)
  - [*ListVenues*](#listvenues)
  - [*ListSeasons*](#listseasons)
  - [*ListAgeDivisions*](#listagedivisions)
  - [*ListTeamClasses*](#listteamclasses)
  - [*ListTeams*](#listteams)
- [**Mutations**](#mutations)
  - [*CreatePerson*](#createperson)
  - [*DeletePerson*](#deleteperson)
  - [*UpsertFixture*](#upsertfixture)
  - [*CreateMatch*](#creatematch)
  - [*CreateOrganisation*](#createorganisation)
  - [*CreateVenue*](#createvenue)
  - [*CreateSeason*](#createseason)
  - [*CreateAgeDivision*](#createagedivision)
  - [*CreateTeamClass*](#createteamclass)
  - [*CreateTeam*](#createteam)
  - [*UpdateTeam*](#updateteam)
  - [*DeleteTeam*](#deleteteam)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@scrbrd/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@scrbrd/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@scrbrd/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListPeople
You can execute the `ListPeople` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listPeople(): QueryPromise<ListPeopleData, undefined>;

interface ListPeopleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPeopleData, undefined>;
}
export const listPeopleRef: ListPeopleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPeople(dc: DataConnect): QueryPromise<ListPeopleData, undefined>;

interface ListPeopleRef {
  ...
  (dc: DataConnect): QueryRef<ListPeopleData, undefined>;
}
export const listPeopleRef: ListPeopleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPeopleRef:
```typescript
const name = listPeopleRef.operationName;
console.log(name);
```

### Variables
The `ListPeople` query has no variables.
### Return Type
Recall that executing the `ListPeople` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPeopleData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPeopleData {
  people: ({
    id: UUIDString;
    firstName: string;
    lastName: string;
    preferredName?: string | null;
    email?: string | null;
    phone?: string | null;
    profileImageUrl?: string | null;
    status?: string | null;
    userAccount_on_person?: {
      userRoleAssignments_on_userAccount: ({
        id: UUIDString;
        systemRole: {
          label: string;
        };
          organisation?: {
            id: UUIDString;
            name: string;
          } & Organisation_Key;
      } & UserRoleAssignment_Key)[];
    };
  } & Person_Key)[];
}
```
### Using `ListPeople`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPeople } from '@scrbrd/dataconnect';


// Call the `listPeople()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPeople();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPeople(dataConnect);

console.log(data.people);

// Or, you can use the `Promise` API.
listPeople().then((response) => {
  const data = response.data;
  console.log(data.people);
});
```

### Using `ListPeople`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPeopleRef } from '@scrbrd/dataconnect';


// Call the `listPeopleRef()` function to get a reference to the query.
const ref = listPeopleRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPeopleRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.people);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.people);
});
```

## GetPerson
You can execute the `GetPerson` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getPerson(vars: GetPersonVariables): QueryPromise<GetPersonData, GetPersonVariables>;

interface GetPersonRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPersonVariables): QueryRef<GetPersonData, GetPersonVariables>;
}
export const getPersonRef: GetPersonRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPerson(dc: DataConnect, vars: GetPersonVariables): QueryPromise<GetPersonData, GetPersonVariables>;

interface GetPersonRef {
  ...
  (dc: DataConnect, vars: GetPersonVariables): QueryRef<GetPersonData, GetPersonVariables>;
}
export const getPersonRef: GetPersonRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPersonRef:
```typescript
const name = getPersonRef.operationName;
console.log(name);
```

### Variables
The `GetPerson` query requires an argument of type `GetPersonVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPersonVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetPerson` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPersonData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPersonData {
  person?: {
    id: UUIDString;
    firstName: string;
    lastName: string;
    preferredName?: string | null;
    email?: string | null;
    phone?: string | null;
    profileImageUrl?: string | null;
    status?: string | null;
    userAccount_on_person?: {
      userRoleAssignments_on_userAccount: ({
        id: UUIDString;
        systemRole: {
          label: string;
        };
          organisation?: {
            id: UUIDString;
            name: string;
          } & Organisation_Key;
      } & UserRoleAssignment_Key)[];
    };
  } & Person_Key;
}
```
### Using `GetPerson`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPerson, GetPersonVariables } from '@scrbrd/dataconnect';

// The `GetPerson` query requires an argument of type `GetPersonVariables`:
const getPersonVars: GetPersonVariables = {
  id: ..., 
};

// Call the `getPerson()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPerson(getPersonVars);
// Variables can be defined inline as well.
const { data } = await getPerson({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPerson(dataConnect, getPersonVars);

console.log(data.person);

// Or, you can use the `Promise` API.
getPerson(getPersonVars).then((response) => {
  const data = response.data;
  console.log(data.person);
});
```

### Using `GetPerson`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPersonRef, GetPersonVariables } from '@scrbrd/dataconnect';

// The `GetPerson` query requires an argument of type `GetPersonVariables`:
const getPersonVars: GetPersonVariables = {
  id: ..., 
};

// Call the `getPersonRef()` function to get a reference to the query.
const ref = getPersonRef(getPersonVars);
// Variables can be defined inline as well.
const ref = getPersonRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPersonRef(dataConnect, getPersonVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.person);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.person);
});
```

## ListFixtures
You can execute the `ListFixtures` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listFixtures(): QueryPromise<ListFixturesData, undefined>;

interface ListFixturesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListFixturesData, undefined>;
}
export const listFixturesRef: ListFixturesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listFixtures(dc: DataConnect): QueryPromise<ListFixturesData, undefined>;

interface ListFixturesRef {
  ...
  (dc: DataConnect): QueryRef<ListFixturesData, undefined>;
}
export const listFixturesRef: ListFixturesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listFixturesRef:
```typescript
const name = listFixturesRef.operationName;
console.log(name);
```

### Variables
The `ListFixtures` query has no variables.
### Return Type
Recall that executing the `ListFixtures` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListFixturesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListFixturesData {
  fixtures: ({
    id: UUIDString;
    scheduledStartAt: TimestampString;
    homeTeam: {
      name: string;
    };
      awayTeam: {
        name: string;
      };
        venue: {
          name: string;
        };
          status?: string | null;
  } & Fixture_Key)[];
}
```
### Using `ListFixtures`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listFixtures } from '@scrbrd/dataconnect';


// Call the `listFixtures()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listFixtures();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listFixtures(dataConnect);

console.log(data.fixtures);

// Or, you can use the `Promise` API.
listFixtures().then((response) => {
  const data = response.data;
  console.log(data.fixtures);
});
```

### Using `ListFixtures`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listFixturesRef } from '@scrbrd/dataconnect';


// Call the `listFixturesRef()` function to get a reference to the query.
const ref = listFixturesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listFixturesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.fixtures);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.fixtures);
});
```

## ListOrganisations
You can execute the `ListOrganisations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listOrganisations(): QueryPromise<ListOrganisationsData, undefined>;

interface ListOrganisationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListOrganisationsData, undefined>;
}
export const listOrganisationsRef: ListOrganisationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listOrganisations(dc: DataConnect): QueryPromise<ListOrganisationsData, undefined>;

interface ListOrganisationsRef {
  ...
  (dc: DataConnect): QueryRef<ListOrganisationsData, undefined>;
}
export const listOrganisationsRef: ListOrganisationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listOrganisationsRef:
```typescript
const name = listOrganisationsRef.operationName;
console.log(name);
```

### Variables
The `ListOrganisations` query has no variables.
### Return Type
Recall that executing the `ListOrganisations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListOrganisationsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListOrganisationsData {
  organisations: ({
    id: UUIDString;
    name: string;
    organisationType?: string | null;
    shortName?: string | null;
    slug: string;
    logoUrl?: string | null;
  } & Organisation_Key)[];
}
```
### Using `ListOrganisations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listOrganisations } from '@scrbrd/dataconnect';


// Call the `listOrganisations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listOrganisations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listOrganisations(dataConnect);

console.log(data.organisations);

// Or, you can use the `Promise` API.
listOrganisations().then((response) => {
  const data = response.data;
  console.log(data.organisations);
});
```

### Using `ListOrganisations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listOrganisationsRef } from '@scrbrd/dataconnect';


// Call the `listOrganisationsRef()` function to get a reference to the query.
const ref = listOrganisationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listOrganisationsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.organisations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.organisations);
});
```

## ListVenues
You can execute the `ListVenues` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listVenues(): QueryPromise<ListVenuesData, undefined>;

interface ListVenuesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListVenuesData, undefined>;
}
export const listVenuesRef: ListVenuesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listVenues(dc: DataConnect): QueryPromise<ListVenuesData, undefined>;

interface ListVenuesRef {
  ...
  (dc: DataConnect): QueryRef<ListVenuesData, undefined>;
}
export const listVenuesRef: ListVenuesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listVenuesRef:
```typescript
const name = listVenuesRef.operationName;
console.log(name);
```

### Variables
The `ListVenues` query has no variables.
### Return Type
Recall that executing the `ListVenues` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListVenuesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListVenuesData {
  venues: ({
    id: UUIDString;
    name: string;
    venueType?: string | null;
    organisation: {
      id: UUIDString;
      name: string;
    } & Organisation_Key;
  } & Venue_Key)[];
}
```
### Using `ListVenues`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listVenues } from '@scrbrd/dataconnect';


// Call the `listVenues()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listVenues();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listVenues(dataConnect);

console.log(data.venues);

// Or, you can use the `Promise` API.
listVenues().then((response) => {
  const data = response.data;
  console.log(data.venues);
});
```

### Using `ListVenues`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listVenuesRef } from '@scrbrd/dataconnect';


// Call the `listVenuesRef()` function to get a reference to the query.
const ref = listVenuesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listVenuesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.venues);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.venues);
});
```

## ListSeasons
You can execute the `ListSeasons` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listSeasons(): QueryPromise<ListSeasonsData, undefined>;

interface ListSeasonsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListSeasonsData, undefined>;
}
export const listSeasonsRef: ListSeasonsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSeasons(dc: DataConnect): QueryPromise<ListSeasonsData, undefined>;

interface ListSeasonsRef {
  ...
  (dc: DataConnect): QueryRef<ListSeasonsData, undefined>;
}
export const listSeasonsRef: ListSeasonsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSeasonsRef:
```typescript
const name = listSeasonsRef.operationName;
console.log(name);
```

### Variables
The `ListSeasons` query has no variables.
### Return Type
Recall that executing the `ListSeasons` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSeasonsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListSeasonsData {
  seasons: ({
    id: UUIDString;
    name: string;
    startDate: DateString;
    endDate: DateString;
    isActive?: boolean | null;
  } & Season_Key)[];
}
```
### Using `ListSeasons`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSeasons } from '@scrbrd/dataconnect';


// Call the `listSeasons()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSeasons();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSeasons(dataConnect);

console.log(data.seasons);

// Or, you can use the `Promise` API.
listSeasons().then((response) => {
  const data = response.data;
  console.log(data.seasons);
});
```

### Using `ListSeasons`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSeasonsRef } from '@scrbrd/dataconnect';


// Call the `listSeasonsRef()` function to get a reference to the query.
const ref = listSeasonsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSeasonsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.seasons);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.seasons);
});
```

## ListAgeDivisions
You can execute the `ListAgeDivisions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listAgeDivisions(): QueryPromise<ListAgeDivisionsData, undefined>;

interface ListAgeDivisionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAgeDivisionsData, undefined>;
}
export const listAgeDivisionsRef: ListAgeDivisionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAgeDivisions(dc: DataConnect): QueryPromise<ListAgeDivisionsData, undefined>;

interface ListAgeDivisionsRef {
  ...
  (dc: DataConnect): QueryRef<ListAgeDivisionsData, undefined>;
}
export const listAgeDivisionsRef: ListAgeDivisionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAgeDivisionsRef:
```typescript
const name = listAgeDivisionsRef.operationName;
console.log(name);
```

### Variables
The `ListAgeDivisions` query has no variables.
### Return Type
Recall that executing the `ListAgeDivisions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAgeDivisionsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAgeDivisionsData {
  ageDivisions: ({
    id: UUIDString;
    name: string;
    minAge?: number | null;
    maxAge?: number | null;
  } & AgeDivision_Key)[];
}
```
### Using `ListAgeDivisions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAgeDivisions } from '@scrbrd/dataconnect';


// Call the `listAgeDivisions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAgeDivisions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAgeDivisions(dataConnect);

console.log(data.ageDivisions);

// Or, you can use the `Promise` API.
listAgeDivisions().then((response) => {
  const data = response.data;
  console.log(data.ageDivisions);
});
```

### Using `ListAgeDivisions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAgeDivisionsRef } from '@scrbrd/dataconnect';


// Call the `listAgeDivisionsRef()` function to get a reference to the query.
const ref = listAgeDivisionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAgeDivisionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.ageDivisions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.ageDivisions);
});
```

## ListTeamClasses
You can execute the `ListTeamClasses` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listTeamClasses(): QueryPromise<ListTeamClassesData, undefined>;

interface ListTeamClassesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListTeamClassesData, undefined>;
}
export const listTeamClassesRef: ListTeamClassesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTeamClasses(dc: DataConnect): QueryPromise<ListTeamClassesData, undefined>;

interface ListTeamClassesRef {
  ...
  (dc: DataConnect): QueryRef<ListTeamClassesData, undefined>;
}
export const listTeamClassesRef: ListTeamClassesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTeamClassesRef:
```typescript
const name = listTeamClassesRef.operationName;
console.log(name);
```

### Variables
The `ListTeamClasses` query has no variables.
### Return Type
Recall that executing the `ListTeamClasses` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTeamClassesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListTeamClassesData {
  teamClasses: ({
    id: UUIDString;
    code: string;
    label: string;
  } & TeamClass_Key)[];
}
```
### Using `ListTeamClasses`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTeamClasses } from '@scrbrd/dataconnect';


// Call the `listTeamClasses()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTeamClasses();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTeamClasses(dataConnect);

console.log(data.teamClasses);

// Or, you can use the `Promise` API.
listTeamClasses().then((response) => {
  const data = response.data;
  console.log(data.teamClasses);
});
```

### Using `ListTeamClasses`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTeamClassesRef } from '@scrbrd/dataconnect';


// Call the `listTeamClassesRef()` function to get a reference to the query.
const ref = listTeamClassesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTeamClassesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.teamClasses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.teamClasses);
});
```

## ListTeams
You can execute the `ListTeams` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listTeams(): QueryPromise<ListTeamsData, undefined>;

interface ListTeamsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListTeamsData, undefined>;
}
export const listTeamsRef: ListTeamsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTeams(dc: DataConnect): QueryPromise<ListTeamsData, undefined>;

interface ListTeamsRef {
  ...
  (dc: DataConnect): QueryRef<ListTeamsData, undefined>;
}
export const listTeamsRef: ListTeamsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTeamsRef:
```typescript
const name = listTeamsRef.operationName;
console.log(name);
```

### Variables
The `ListTeams` query has no variables.
### Return Type
Recall that executing the `ListTeams` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTeamsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListTeamsData {
  teams: ({
    id: UUIDString;
    name: string;
    displayName?: string | null;
    shortName?: string | null;
    organisation: {
      id: UUIDString;
      name: string;
    } & Organisation_Key;
      season: {
        id: UUIDString;
        name: string;
      } & Season_Key;
        ageDivision: {
          id: UUIDString;
          name: string;
        } & AgeDivision_Key;
          teamClass: {
            id: UUIDString;
            label: string;
            code: string;
          } & TeamClass_Key;
  } & Team_Key)[];
}
```
### Using `ListTeams`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTeams } from '@scrbrd/dataconnect';


// Call the `listTeams()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTeams();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTeams(dataConnect);

console.log(data.teams);

// Or, you can use the `Promise` API.
listTeams().then((response) => {
  const data = response.data;
  console.log(data.teams);
});
```

### Using `ListTeams`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTeamsRef } from '@scrbrd/dataconnect';


// Call the `listTeamsRef()` function to get a reference to the query.
const ref = listTeamsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTeamsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.teams);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.teams);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreatePerson
You can execute the `CreatePerson` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createPerson(vars: CreatePersonVariables): MutationPromise<CreatePersonData, CreatePersonVariables>;

interface CreatePersonRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePersonVariables): MutationRef<CreatePersonData, CreatePersonVariables>;
}
export const createPersonRef: CreatePersonRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPerson(dc: DataConnect, vars: CreatePersonVariables): MutationPromise<CreatePersonData, CreatePersonVariables>;

interface CreatePersonRef {
  ...
  (dc: DataConnect, vars: CreatePersonVariables): MutationRef<CreatePersonData, CreatePersonVariables>;
}
export const createPersonRef: CreatePersonRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPersonRef:
```typescript
const name = createPersonRef.operationName;
console.log(name);
```

### Variables
The `CreatePerson` mutation requires an argument of type `CreatePersonVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePersonVariables {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
}
```
### Return Type
Recall that executing the `CreatePerson` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePersonData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePersonData {
  person_insert: Person_Key;
}
```
### Using `CreatePerson`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPerson, CreatePersonVariables } from '@scrbrd/dataconnect';

// The `CreatePerson` mutation requires an argument of type `CreatePersonVariables`:
const createPersonVars: CreatePersonVariables = {
  firstName: ..., 
  lastName: ..., 
  email: ..., // optional
  phone: ..., // optional
};

// Call the `createPerson()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPerson(createPersonVars);
// Variables can be defined inline as well.
const { data } = await createPerson({ firstName: ..., lastName: ..., email: ..., phone: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPerson(dataConnect, createPersonVars);

console.log(data.person_insert);

// Or, you can use the `Promise` API.
createPerson(createPersonVars).then((response) => {
  const data = response.data;
  console.log(data.person_insert);
});
```

### Using `CreatePerson`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPersonRef, CreatePersonVariables } from '@scrbrd/dataconnect';

// The `CreatePerson` mutation requires an argument of type `CreatePersonVariables`:
const createPersonVars: CreatePersonVariables = {
  firstName: ..., 
  lastName: ..., 
  email: ..., // optional
  phone: ..., // optional
};

// Call the `createPersonRef()` function to get a reference to the mutation.
const ref = createPersonRef(createPersonVars);
// Variables can be defined inline as well.
const ref = createPersonRef({ firstName: ..., lastName: ..., email: ..., phone: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPersonRef(dataConnect, createPersonVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.person_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.person_insert);
});
```

## DeletePerson
You can execute the `DeletePerson` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deletePerson(vars: DeletePersonVariables): MutationPromise<DeletePersonData, DeletePersonVariables>;

interface DeletePersonRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeletePersonVariables): MutationRef<DeletePersonData, DeletePersonVariables>;
}
export const deletePersonRef: DeletePersonRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deletePerson(dc: DataConnect, vars: DeletePersonVariables): MutationPromise<DeletePersonData, DeletePersonVariables>;

interface DeletePersonRef {
  ...
  (dc: DataConnect, vars: DeletePersonVariables): MutationRef<DeletePersonData, DeletePersonVariables>;
}
export const deletePersonRef: DeletePersonRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deletePersonRef:
```typescript
const name = deletePersonRef.operationName;
console.log(name);
```

### Variables
The `DeletePerson` mutation requires an argument of type `DeletePersonVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeletePersonVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeletePerson` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeletePersonData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeletePersonData {
  person_delete?: Person_Key | null;
}
```
### Using `DeletePerson`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deletePerson, DeletePersonVariables } from '@scrbrd/dataconnect';

// The `DeletePerson` mutation requires an argument of type `DeletePersonVariables`:
const deletePersonVars: DeletePersonVariables = {
  id: ..., 
};

// Call the `deletePerson()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deletePerson(deletePersonVars);
// Variables can be defined inline as well.
const { data } = await deletePerson({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deletePerson(dataConnect, deletePersonVars);

console.log(data.person_delete);

// Or, you can use the `Promise` API.
deletePerson(deletePersonVars).then((response) => {
  const data = response.data;
  console.log(data.person_delete);
});
```

### Using `DeletePerson`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deletePersonRef, DeletePersonVariables } from '@scrbrd/dataconnect';

// The `DeletePerson` mutation requires an argument of type `DeletePersonVariables`:
const deletePersonVars: DeletePersonVariables = {
  id: ..., 
};

// Call the `deletePersonRef()` function to get a reference to the mutation.
const ref = deletePersonRef(deletePersonVars);
// Variables can be defined inline as well.
const ref = deletePersonRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deletePersonRef(dataConnect, deletePersonVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.person_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.person_delete);
});
```

## UpsertFixture
You can execute the `UpsertFixture` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
upsertFixture(vars: UpsertFixtureVariables): MutationPromise<UpsertFixtureData, UpsertFixtureVariables>;

interface UpsertFixtureRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertFixtureVariables): MutationRef<UpsertFixtureData, UpsertFixtureVariables>;
}
export const upsertFixtureRef: UpsertFixtureRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertFixture(dc: DataConnect, vars: UpsertFixtureVariables): MutationPromise<UpsertFixtureData, UpsertFixtureVariables>;

interface UpsertFixtureRef {
  ...
  (dc: DataConnect, vars: UpsertFixtureVariables): MutationRef<UpsertFixtureData, UpsertFixtureVariables>;
}
export const upsertFixtureRef: UpsertFixtureRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertFixtureRef:
```typescript
const name = upsertFixtureRef.operationName;
console.log(name);
```

### Variables
The `UpsertFixture` mutation requires an argument of type `UpsertFixtureVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertFixtureVariables {
  id?: UUIDString | null;
  seasonId: UUIDString;
  homeTeamId: UUIDString;
  awayTeamId: UUIDString;
  venueId: UUIDString;
  scheduledStartAt: TimestampString;
}
```
### Return Type
Recall that executing the `UpsertFixture` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertFixtureData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertFixtureData {
  fixture_upsert: Fixture_Key;
}
```
### Using `UpsertFixture`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertFixture, UpsertFixtureVariables } from '@scrbrd/dataconnect';

// The `UpsertFixture` mutation requires an argument of type `UpsertFixtureVariables`:
const upsertFixtureVars: UpsertFixtureVariables = {
  id: ..., // optional
  seasonId: ..., 
  homeTeamId: ..., 
  awayTeamId: ..., 
  venueId: ..., 
  scheduledStartAt: ..., 
};

// Call the `upsertFixture()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertFixture(upsertFixtureVars);
// Variables can be defined inline as well.
const { data } = await upsertFixture({ id: ..., seasonId: ..., homeTeamId: ..., awayTeamId: ..., venueId: ..., scheduledStartAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertFixture(dataConnect, upsertFixtureVars);

console.log(data.fixture_upsert);

// Or, you can use the `Promise` API.
upsertFixture(upsertFixtureVars).then((response) => {
  const data = response.data;
  console.log(data.fixture_upsert);
});
```

### Using `UpsertFixture`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertFixtureRef, UpsertFixtureVariables } from '@scrbrd/dataconnect';

// The `UpsertFixture` mutation requires an argument of type `UpsertFixtureVariables`:
const upsertFixtureVars: UpsertFixtureVariables = {
  id: ..., // optional
  seasonId: ..., 
  homeTeamId: ..., 
  awayTeamId: ..., 
  venueId: ..., 
  scheduledStartAt: ..., 
};

// Call the `upsertFixtureRef()` function to get a reference to the mutation.
const ref = upsertFixtureRef(upsertFixtureVars);
// Variables can be defined inline as well.
const ref = upsertFixtureRef({ id: ..., seasonId: ..., homeTeamId: ..., awayTeamId: ..., venueId: ..., scheduledStartAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertFixtureRef(dataConnect, upsertFixtureVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.fixture_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.fixture_upsert);
});
```

## CreateMatch
You can execute the `CreateMatch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createMatch(vars: CreateMatchVariables): MutationPromise<CreateMatchData, CreateMatchVariables>;

interface CreateMatchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMatchVariables): MutationRef<CreateMatchData, CreateMatchVariables>;
}
export const createMatchRef: CreateMatchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createMatch(dc: DataConnect, vars: CreateMatchVariables): MutationPromise<CreateMatchData, CreateMatchVariables>;

interface CreateMatchRef {
  ...
  (dc: DataConnect, vars: CreateMatchVariables): MutationRef<CreateMatchData, CreateMatchVariables>;
}
export const createMatchRef: CreateMatchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createMatchRef:
```typescript
const name = createMatchRef.operationName;
console.log(name);
```

### Variables
The `CreateMatch` mutation requires an argument of type `CreateMatchVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateMatchVariables {
  fixtureId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateMatch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateMatchData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateMatchData {
  match_insert: Match_Key;
}
```
### Using `CreateMatch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createMatch, CreateMatchVariables } from '@scrbrd/dataconnect';

// The `CreateMatch` mutation requires an argument of type `CreateMatchVariables`:
const createMatchVars: CreateMatchVariables = {
  fixtureId: ..., 
};

// Call the `createMatch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createMatch(createMatchVars);
// Variables can be defined inline as well.
const { data } = await createMatch({ fixtureId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createMatch(dataConnect, createMatchVars);

console.log(data.match_insert);

// Or, you can use the `Promise` API.
createMatch(createMatchVars).then((response) => {
  const data = response.data;
  console.log(data.match_insert);
});
```

### Using `CreateMatch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createMatchRef, CreateMatchVariables } from '@scrbrd/dataconnect';

// The `CreateMatch` mutation requires an argument of type `CreateMatchVariables`:
const createMatchVars: CreateMatchVariables = {
  fixtureId: ..., 
};

// Call the `createMatchRef()` function to get a reference to the mutation.
const ref = createMatchRef(createMatchVars);
// Variables can be defined inline as well.
const ref = createMatchRef({ fixtureId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createMatchRef(dataConnect, createMatchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.match_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.match_insert);
});
```

## CreateOrganisation
You can execute the `CreateOrganisation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createOrganisation(vars: CreateOrganisationVariables): MutationPromise<CreateOrganisationData, CreateOrganisationVariables>;

interface CreateOrganisationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOrganisationVariables): MutationRef<CreateOrganisationData, CreateOrganisationVariables>;
}
export const createOrganisationRef: CreateOrganisationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createOrganisation(dc: DataConnect, vars: CreateOrganisationVariables): MutationPromise<CreateOrganisationData, CreateOrganisationVariables>;

interface CreateOrganisationRef {
  ...
  (dc: DataConnect, vars: CreateOrganisationVariables): MutationRef<CreateOrganisationData, CreateOrganisationVariables>;
}
export const createOrganisationRef: CreateOrganisationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createOrganisationRef:
```typescript
const name = createOrganisationRef.operationName;
console.log(name);
```

### Variables
The `CreateOrganisation` mutation requires an argument of type `CreateOrganisationVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateOrganisationVariables {
  name: string;
  organisationType: string;
  shortName?: string | null;
  slug: string;
}
```
### Return Type
Recall that executing the `CreateOrganisation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateOrganisationData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateOrganisationData {
  organisation_insert: Organisation_Key;
}
```
### Using `CreateOrganisation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createOrganisation, CreateOrganisationVariables } from '@scrbrd/dataconnect';

// The `CreateOrganisation` mutation requires an argument of type `CreateOrganisationVariables`:
const createOrganisationVars: CreateOrganisationVariables = {
  name: ..., 
  organisationType: ..., 
  shortName: ..., // optional
  slug: ..., 
};

// Call the `createOrganisation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createOrganisation(createOrganisationVars);
// Variables can be defined inline as well.
const { data } = await createOrganisation({ name: ..., organisationType: ..., shortName: ..., slug: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createOrganisation(dataConnect, createOrganisationVars);

console.log(data.organisation_insert);

// Or, you can use the `Promise` API.
createOrganisation(createOrganisationVars).then((response) => {
  const data = response.data;
  console.log(data.organisation_insert);
});
```

### Using `CreateOrganisation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createOrganisationRef, CreateOrganisationVariables } from '@scrbrd/dataconnect';

// The `CreateOrganisation` mutation requires an argument of type `CreateOrganisationVariables`:
const createOrganisationVars: CreateOrganisationVariables = {
  name: ..., 
  organisationType: ..., 
  shortName: ..., // optional
  slug: ..., 
};

// Call the `createOrganisationRef()` function to get a reference to the mutation.
const ref = createOrganisationRef(createOrganisationVars);
// Variables can be defined inline as well.
const ref = createOrganisationRef({ name: ..., organisationType: ..., shortName: ..., slug: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createOrganisationRef(dataConnect, createOrganisationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.organisation_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.organisation_insert);
});
```

## CreateVenue
You can execute the `CreateVenue` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createVenue(vars: CreateVenueVariables): MutationPromise<CreateVenueData, CreateVenueVariables>;

interface CreateVenueRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateVenueVariables): MutationRef<CreateVenueData, CreateVenueVariables>;
}
export const createVenueRef: CreateVenueRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createVenue(dc: DataConnect, vars: CreateVenueVariables): MutationPromise<CreateVenueData, CreateVenueVariables>;

interface CreateVenueRef {
  ...
  (dc: DataConnect, vars: CreateVenueVariables): MutationRef<CreateVenueData, CreateVenueVariables>;
}
export const createVenueRef: CreateVenueRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createVenueRef:
```typescript
const name = createVenueRef.operationName;
console.log(name);
```

### Variables
The `CreateVenue` mutation requires an argument of type `CreateVenueVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateVenueVariables {
  organisationId: UUIDString;
  name: string;
  venueType?: string | null;
}
```
### Return Type
Recall that executing the `CreateVenue` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateVenueData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateVenueData {
  venue_insert: Venue_Key;
}
```
### Using `CreateVenue`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createVenue, CreateVenueVariables } from '@scrbrd/dataconnect';

// The `CreateVenue` mutation requires an argument of type `CreateVenueVariables`:
const createVenueVars: CreateVenueVariables = {
  organisationId: ..., 
  name: ..., 
  venueType: ..., // optional
};

// Call the `createVenue()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createVenue(createVenueVars);
// Variables can be defined inline as well.
const { data } = await createVenue({ organisationId: ..., name: ..., venueType: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createVenue(dataConnect, createVenueVars);

console.log(data.venue_insert);

// Or, you can use the `Promise` API.
createVenue(createVenueVars).then((response) => {
  const data = response.data;
  console.log(data.venue_insert);
});
```

### Using `CreateVenue`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createVenueRef, CreateVenueVariables } from '@scrbrd/dataconnect';

// The `CreateVenue` mutation requires an argument of type `CreateVenueVariables`:
const createVenueVars: CreateVenueVariables = {
  organisationId: ..., 
  name: ..., 
  venueType: ..., // optional
};

// Call the `createVenueRef()` function to get a reference to the mutation.
const ref = createVenueRef(createVenueVars);
// Variables can be defined inline as well.
const ref = createVenueRef({ organisationId: ..., name: ..., venueType: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createVenueRef(dataConnect, createVenueVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.venue_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.venue_insert);
});
```

## CreateSeason
You can execute the `CreateSeason` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createSeason(vars: CreateSeasonVariables): MutationPromise<CreateSeasonData, CreateSeasonVariables>;

interface CreateSeasonRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSeasonVariables): MutationRef<CreateSeasonData, CreateSeasonVariables>;
}
export const createSeasonRef: CreateSeasonRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createSeason(dc: DataConnect, vars: CreateSeasonVariables): MutationPromise<CreateSeasonData, CreateSeasonVariables>;

interface CreateSeasonRef {
  ...
  (dc: DataConnect, vars: CreateSeasonVariables): MutationRef<CreateSeasonData, CreateSeasonVariables>;
}
export const createSeasonRef: CreateSeasonRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createSeasonRef:
```typescript
const name = createSeasonRef.operationName;
console.log(name);
```

### Variables
The `CreateSeason` mutation requires an argument of type `CreateSeasonVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateSeasonVariables {
  name: string;
  startDate: DateString;
  endDate: DateString;
  isActive?: boolean | null;
}
```
### Return Type
Recall that executing the `CreateSeason` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateSeasonData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateSeasonData {
  season_insert: Season_Key;
}
```
### Using `CreateSeason`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createSeason, CreateSeasonVariables } from '@scrbrd/dataconnect';

// The `CreateSeason` mutation requires an argument of type `CreateSeasonVariables`:
const createSeasonVars: CreateSeasonVariables = {
  name: ..., 
  startDate: ..., 
  endDate: ..., 
  isActive: ..., // optional
};

// Call the `createSeason()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createSeason(createSeasonVars);
// Variables can be defined inline as well.
const { data } = await createSeason({ name: ..., startDate: ..., endDate: ..., isActive: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createSeason(dataConnect, createSeasonVars);

console.log(data.season_insert);

// Or, you can use the `Promise` API.
createSeason(createSeasonVars).then((response) => {
  const data = response.data;
  console.log(data.season_insert);
});
```

### Using `CreateSeason`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createSeasonRef, CreateSeasonVariables } from '@scrbrd/dataconnect';

// The `CreateSeason` mutation requires an argument of type `CreateSeasonVariables`:
const createSeasonVars: CreateSeasonVariables = {
  name: ..., 
  startDate: ..., 
  endDate: ..., 
  isActive: ..., // optional
};

// Call the `createSeasonRef()` function to get a reference to the mutation.
const ref = createSeasonRef(createSeasonVars);
// Variables can be defined inline as well.
const ref = createSeasonRef({ name: ..., startDate: ..., endDate: ..., isActive: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createSeasonRef(dataConnect, createSeasonVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.season_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.season_insert);
});
```

## CreateAgeDivision
You can execute the `CreateAgeDivision` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createAgeDivision(vars: CreateAgeDivisionVariables): MutationPromise<CreateAgeDivisionData, CreateAgeDivisionVariables>;

interface CreateAgeDivisionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAgeDivisionVariables): MutationRef<CreateAgeDivisionData, CreateAgeDivisionVariables>;
}
export const createAgeDivisionRef: CreateAgeDivisionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAgeDivision(dc: DataConnect, vars: CreateAgeDivisionVariables): MutationPromise<CreateAgeDivisionData, CreateAgeDivisionVariables>;

interface CreateAgeDivisionRef {
  ...
  (dc: DataConnect, vars: CreateAgeDivisionVariables): MutationRef<CreateAgeDivisionData, CreateAgeDivisionVariables>;
}
export const createAgeDivisionRef: CreateAgeDivisionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAgeDivisionRef:
```typescript
const name = createAgeDivisionRef.operationName;
console.log(name);
```

### Variables
The `CreateAgeDivision` mutation requires an argument of type `CreateAgeDivisionVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateAgeDivisionVariables {
  name: string;
  minAge?: number | null;
  maxAge?: number | null;
}
```
### Return Type
Recall that executing the `CreateAgeDivision` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAgeDivisionData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAgeDivisionData {
  ageDivision_insert: AgeDivision_Key;
}
```
### Using `CreateAgeDivision`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAgeDivision, CreateAgeDivisionVariables } from '@scrbrd/dataconnect';

// The `CreateAgeDivision` mutation requires an argument of type `CreateAgeDivisionVariables`:
const createAgeDivisionVars: CreateAgeDivisionVariables = {
  name: ..., 
  minAge: ..., // optional
  maxAge: ..., // optional
};

// Call the `createAgeDivision()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAgeDivision(createAgeDivisionVars);
// Variables can be defined inline as well.
const { data } = await createAgeDivision({ name: ..., minAge: ..., maxAge: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAgeDivision(dataConnect, createAgeDivisionVars);

console.log(data.ageDivision_insert);

// Or, you can use the `Promise` API.
createAgeDivision(createAgeDivisionVars).then((response) => {
  const data = response.data;
  console.log(data.ageDivision_insert);
});
```

### Using `CreateAgeDivision`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAgeDivisionRef, CreateAgeDivisionVariables } from '@scrbrd/dataconnect';

// The `CreateAgeDivision` mutation requires an argument of type `CreateAgeDivisionVariables`:
const createAgeDivisionVars: CreateAgeDivisionVariables = {
  name: ..., 
  minAge: ..., // optional
  maxAge: ..., // optional
};

// Call the `createAgeDivisionRef()` function to get a reference to the mutation.
const ref = createAgeDivisionRef(createAgeDivisionVars);
// Variables can be defined inline as well.
const ref = createAgeDivisionRef({ name: ..., minAge: ..., maxAge: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAgeDivisionRef(dataConnect, createAgeDivisionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.ageDivision_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.ageDivision_insert);
});
```

## CreateTeamClass
You can execute the `CreateTeamClass` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createTeamClass(vars: CreateTeamClassVariables): MutationPromise<CreateTeamClassData, CreateTeamClassVariables>;

interface CreateTeamClassRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTeamClassVariables): MutationRef<CreateTeamClassData, CreateTeamClassVariables>;
}
export const createTeamClassRef: CreateTeamClassRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTeamClass(dc: DataConnect, vars: CreateTeamClassVariables): MutationPromise<CreateTeamClassData, CreateTeamClassVariables>;

interface CreateTeamClassRef {
  ...
  (dc: DataConnect, vars: CreateTeamClassVariables): MutationRef<CreateTeamClassData, CreateTeamClassVariables>;
}
export const createTeamClassRef: CreateTeamClassRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTeamClassRef:
```typescript
const name = createTeamClassRef.operationName;
console.log(name);
```

### Variables
The `CreateTeamClass` mutation requires an argument of type `CreateTeamClassVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTeamClassVariables {
  code: string;
  label: string;
}
```
### Return Type
Recall that executing the `CreateTeamClass` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTeamClassData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTeamClassData {
  teamClass_insert: TeamClass_Key;
}
```
### Using `CreateTeamClass`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTeamClass, CreateTeamClassVariables } from '@scrbrd/dataconnect';

// The `CreateTeamClass` mutation requires an argument of type `CreateTeamClassVariables`:
const createTeamClassVars: CreateTeamClassVariables = {
  code: ..., 
  label: ..., 
};

// Call the `createTeamClass()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTeamClass(createTeamClassVars);
// Variables can be defined inline as well.
const { data } = await createTeamClass({ code: ..., label: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTeamClass(dataConnect, createTeamClassVars);

console.log(data.teamClass_insert);

// Or, you can use the `Promise` API.
createTeamClass(createTeamClassVars).then((response) => {
  const data = response.data;
  console.log(data.teamClass_insert);
});
```

### Using `CreateTeamClass`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTeamClassRef, CreateTeamClassVariables } from '@scrbrd/dataconnect';

// The `CreateTeamClass` mutation requires an argument of type `CreateTeamClassVariables`:
const createTeamClassVars: CreateTeamClassVariables = {
  code: ..., 
  label: ..., 
};

// Call the `createTeamClassRef()` function to get a reference to the mutation.
const ref = createTeamClassRef(createTeamClassVars);
// Variables can be defined inline as well.
const ref = createTeamClassRef({ code: ..., label: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTeamClassRef(dataConnect, createTeamClassVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.teamClass_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.teamClass_insert);
});
```

## CreateTeam
You can execute the `CreateTeam` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createTeam(vars: CreateTeamVariables): MutationPromise<CreateTeamData, CreateTeamVariables>;

interface CreateTeamRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTeamVariables): MutationRef<CreateTeamData, CreateTeamVariables>;
}
export const createTeamRef: CreateTeamRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTeam(dc: DataConnect, vars: CreateTeamVariables): MutationPromise<CreateTeamData, CreateTeamVariables>;

interface CreateTeamRef {
  ...
  (dc: DataConnect, vars: CreateTeamVariables): MutationRef<CreateTeamData, CreateTeamVariables>;
}
export const createTeamRef: CreateTeamRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTeamRef:
```typescript
const name = createTeamRef.operationName;
console.log(name);
```

### Variables
The `CreateTeam` mutation requires an argument of type `CreateTeamVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTeamVariables {
  organisationId: UUIDString;
  seasonId: UUIDString;
  ageDivisionId: UUIDString;
  teamClassId: UUIDString;
  name: string;
  displayName?: string | null;
  shortName?: string | null;
}
```
### Return Type
Recall that executing the `CreateTeam` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTeamData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTeamData {
  team_insert: Team_Key;
}
```
### Using `CreateTeam`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTeam, CreateTeamVariables } from '@scrbrd/dataconnect';

// The `CreateTeam` mutation requires an argument of type `CreateTeamVariables`:
const createTeamVars: CreateTeamVariables = {
  organisationId: ..., 
  seasonId: ..., 
  ageDivisionId: ..., 
  teamClassId: ..., 
  name: ..., 
  displayName: ..., // optional
  shortName: ..., // optional
};

// Call the `createTeam()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTeam(createTeamVars);
// Variables can be defined inline as well.
const { data } = await createTeam({ organisationId: ..., seasonId: ..., ageDivisionId: ..., teamClassId: ..., name: ..., displayName: ..., shortName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTeam(dataConnect, createTeamVars);

console.log(data.team_insert);

// Or, you can use the `Promise` API.
createTeam(createTeamVars).then((response) => {
  const data = response.data;
  console.log(data.team_insert);
});
```

### Using `CreateTeam`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTeamRef, CreateTeamVariables } from '@scrbrd/dataconnect';

// The `CreateTeam` mutation requires an argument of type `CreateTeamVariables`:
const createTeamVars: CreateTeamVariables = {
  organisationId: ..., 
  seasonId: ..., 
  ageDivisionId: ..., 
  teamClassId: ..., 
  name: ..., 
  displayName: ..., // optional
  shortName: ..., // optional
};

// Call the `createTeamRef()` function to get a reference to the mutation.
const ref = createTeamRef(createTeamVars);
// Variables can be defined inline as well.
const ref = createTeamRef({ organisationId: ..., seasonId: ..., ageDivisionId: ..., teamClassId: ..., name: ..., displayName: ..., shortName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTeamRef(dataConnect, createTeamVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.team_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.team_insert);
});
```

## UpdateTeam
You can execute the `UpdateTeam` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateTeam(vars: UpdateTeamVariables): MutationPromise<UpdateTeamData, UpdateTeamVariables>;

interface UpdateTeamRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTeamVariables): MutationRef<UpdateTeamData, UpdateTeamVariables>;
}
export const updateTeamRef: UpdateTeamRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTeam(dc: DataConnect, vars: UpdateTeamVariables): MutationPromise<UpdateTeamData, UpdateTeamVariables>;

interface UpdateTeamRef {
  ...
  (dc: DataConnect, vars: UpdateTeamVariables): MutationRef<UpdateTeamData, UpdateTeamVariables>;
}
export const updateTeamRef: UpdateTeamRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTeamRef:
```typescript
const name = updateTeamRef.operationName;
console.log(name);
```

### Variables
The `UpdateTeam` mutation requires an argument of type `UpdateTeamVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTeamVariables {
  id: UUIDString;
  name?: string | null;
  displayName?: string | null;
  shortName?: string | null;
}
```
### Return Type
Recall that executing the `UpdateTeam` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTeamData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTeamData {
  team_update?: Team_Key | null;
}
```
### Using `UpdateTeam`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTeam, UpdateTeamVariables } from '@scrbrd/dataconnect';

// The `UpdateTeam` mutation requires an argument of type `UpdateTeamVariables`:
const updateTeamVars: UpdateTeamVariables = {
  id: ..., 
  name: ..., // optional
  displayName: ..., // optional
  shortName: ..., // optional
};

// Call the `updateTeam()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTeam(updateTeamVars);
// Variables can be defined inline as well.
const { data } = await updateTeam({ id: ..., name: ..., displayName: ..., shortName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTeam(dataConnect, updateTeamVars);

console.log(data.team_update);

// Or, you can use the `Promise` API.
updateTeam(updateTeamVars).then((response) => {
  const data = response.data;
  console.log(data.team_update);
});
```

### Using `UpdateTeam`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTeamRef, UpdateTeamVariables } from '@scrbrd/dataconnect';

// The `UpdateTeam` mutation requires an argument of type `UpdateTeamVariables`:
const updateTeamVars: UpdateTeamVariables = {
  id: ..., 
  name: ..., // optional
  displayName: ..., // optional
  shortName: ..., // optional
};

// Call the `updateTeamRef()` function to get a reference to the mutation.
const ref = updateTeamRef(updateTeamVars);
// Variables can be defined inline as well.
const ref = updateTeamRef({ id: ..., name: ..., displayName: ..., shortName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTeamRef(dataConnect, updateTeamVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.team_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.team_update);
});
```

## DeleteTeam
You can execute the `DeleteTeam` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteTeam(vars: DeleteTeamVariables): MutationPromise<DeleteTeamData, DeleteTeamVariables>;

interface DeleteTeamRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTeamVariables): MutationRef<DeleteTeamData, DeleteTeamVariables>;
}
export const deleteTeamRef: DeleteTeamRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteTeam(dc: DataConnect, vars: DeleteTeamVariables): MutationPromise<DeleteTeamData, DeleteTeamVariables>;

interface DeleteTeamRef {
  ...
  (dc: DataConnect, vars: DeleteTeamVariables): MutationRef<DeleteTeamData, DeleteTeamVariables>;
}
export const deleteTeamRef: DeleteTeamRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteTeamRef:
```typescript
const name = deleteTeamRef.operationName;
console.log(name);
```

### Variables
The `DeleteTeam` mutation requires an argument of type `DeleteTeamVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteTeamVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteTeam` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteTeamData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteTeamData {
  team_delete?: Team_Key | null;
}
```
### Using `DeleteTeam`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteTeam, DeleteTeamVariables } from '@scrbrd/dataconnect';

// The `DeleteTeam` mutation requires an argument of type `DeleteTeamVariables`:
const deleteTeamVars: DeleteTeamVariables = {
  id: ..., 
};

// Call the `deleteTeam()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteTeam(deleteTeamVars);
// Variables can be defined inline as well.
const { data } = await deleteTeam({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteTeam(dataConnect, deleteTeamVars);

console.log(data.team_delete);

// Or, you can use the `Promise` API.
deleteTeam(deleteTeamVars).then((response) => {
  const data = response.data;
  console.log(data.team_delete);
});
```

### Using `DeleteTeam`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteTeamRef, DeleteTeamVariables } from '@scrbrd/dataconnect';

// The `DeleteTeam` mutation requires an argument of type `DeleteTeamVariables`:
const deleteTeamVars: DeleteTeamVariables = {
  id: ..., 
};

// Call the `deleteTeamRef()` function to get a reference to the mutation.
const ref = deleteTeamRef(deleteTeamVars);
// Variables can be defined inline as well.
const ref = deleteTeamRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteTeamRef(dataConnect, deleteTeamVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.team_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.team_delete);
});
```

