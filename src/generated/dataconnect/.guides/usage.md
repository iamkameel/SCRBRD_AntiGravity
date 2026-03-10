# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createPerson, deletePerson, upsertFixture, createMatch, createOrganisation, createVenue, createSeason, createAgeDivision, createTeamClass, createTeam } from '@scrbrd/dataconnect';


// Operation CreatePerson:  For variables, look at type CreatePersonVars in ../index.d.ts
const { data } = await CreatePerson(dataConnect, createPersonVars);

// Operation DeletePerson:  For variables, look at type DeletePersonVars in ../index.d.ts
const { data } = await DeletePerson(dataConnect, deletePersonVars);

// Operation UpsertFixture:  For variables, look at type UpsertFixtureVars in ../index.d.ts
const { data } = await UpsertFixture(dataConnect, upsertFixtureVars);

// Operation CreateMatch:  For variables, look at type CreateMatchVars in ../index.d.ts
const { data } = await CreateMatch(dataConnect, createMatchVars);

// Operation CreateOrganisation:  For variables, look at type CreateOrganisationVars in ../index.d.ts
const { data } = await CreateOrganisation(dataConnect, createOrganisationVars);

// Operation CreateVenue:  For variables, look at type CreateVenueVars in ../index.d.ts
const { data } = await CreateVenue(dataConnect, createVenueVars);

// Operation CreateSeason:  For variables, look at type CreateSeasonVars in ../index.d.ts
const { data } = await CreateSeason(dataConnect, createSeasonVars);

// Operation CreateAgeDivision:  For variables, look at type CreateAgeDivisionVars in ../index.d.ts
const { data } = await CreateAgeDivision(dataConnect, createAgeDivisionVars);

// Operation CreateTeamClass:  For variables, look at type CreateTeamClassVars in ../index.d.ts
const { data } = await CreateTeamClass(dataConnect, createTeamClassVars);

// Operation CreateTeam:  For variables, look at type CreateTeamVars in ../index.d.ts
const { data } = await CreateTeam(dataConnect, createTeamVars);


```