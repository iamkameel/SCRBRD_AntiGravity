import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'scrbrd-data',
  location: 'us-central1'
};

export const createPersonRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePerson', inputVars);
}
createPersonRef.operationName = 'CreatePerson';

export function createPerson(dcOrVars, vars) {
  return executeMutation(createPersonRef(dcOrVars, vars));
}

export const deletePersonRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeletePerson', inputVars);
}
deletePersonRef.operationName = 'DeletePerson';

export function deletePerson(dcOrVars, vars) {
  return executeMutation(deletePersonRef(dcOrVars, vars));
}

export const upsertFixtureRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertFixture', inputVars);
}
upsertFixtureRef.operationName = 'UpsertFixture';

export function upsertFixture(dcOrVars, vars) {
  return executeMutation(upsertFixtureRef(dcOrVars, vars));
}

export const createMatchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMatch', inputVars);
}
createMatchRef.operationName = 'CreateMatch';

export function createMatch(dcOrVars, vars) {
  return executeMutation(createMatchRef(dcOrVars, vars));
}

export const createOrganisationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateOrganisation', inputVars);
}
createOrganisationRef.operationName = 'CreateOrganisation';

export function createOrganisation(dcOrVars, vars) {
  return executeMutation(createOrganisationRef(dcOrVars, vars));
}

export const createVenueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateVenue', inputVars);
}
createVenueRef.operationName = 'CreateVenue';

export function createVenue(dcOrVars, vars) {
  return executeMutation(createVenueRef(dcOrVars, vars));
}

export const createSeasonRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSeason', inputVars);
}
createSeasonRef.operationName = 'CreateSeason';

export function createSeason(dcOrVars, vars) {
  return executeMutation(createSeasonRef(dcOrVars, vars));
}

export const createAgeDivisionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAgeDivision', inputVars);
}
createAgeDivisionRef.operationName = 'CreateAgeDivision';

export function createAgeDivision(dcOrVars, vars) {
  return executeMutation(createAgeDivisionRef(dcOrVars, vars));
}

export const createTeamClassRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTeamClass', inputVars);
}
createTeamClassRef.operationName = 'CreateTeamClass';

export function createTeamClass(dcOrVars, vars) {
  return executeMutation(createTeamClassRef(dcOrVars, vars));
}

export const createTeamRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTeam', inputVars);
}
createTeamRef.operationName = 'CreateTeam';

export function createTeam(dcOrVars, vars) {
  return executeMutation(createTeamRef(dcOrVars, vars));
}

export const updateTeamRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTeam', inputVars);
}
updateTeamRef.operationName = 'UpdateTeam';

export function updateTeam(dcOrVars, vars) {
  return executeMutation(updateTeamRef(dcOrVars, vars));
}

export const deleteTeamRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteTeam', inputVars);
}
deleteTeamRef.operationName = 'DeleteTeam';

export function deleteTeam(dcOrVars, vars) {
  return executeMutation(deleteTeamRef(dcOrVars, vars));
}

export const listPeopleRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPeople');
}
listPeopleRef.operationName = 'ListPeople';

export function listPeople(dc) {
  return executeQuery(listPeopleRef(dc));
}

export const getPersonRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPerson', inputVars);
}
getPersonRef.operationName = 'GetPerson';

export function getPerson(dcOrVars, vars) {
  return executeQuery(getPersonRef(dcOrVars, vars));
}

export const listFixturesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListFixtures');
}
listFixturesRef.operationName = 'ListFixtures';

export function listFixtures(dc) {
  return executeQuery(listFixturesRef(dc));
}

export const listOrganisationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListOrganisations');
}
listOrganisationsRef.operationName = 'ListOrganisations';

export function listOrganisations(dc) {
  return executeQuery(listOrganisationsRef(dc));
}

export const listVenuesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVenues');
}
listVenuesRef.operationName = 'ListVenues';

export function listVenues(dc) {
  return executeQuery(listVenuesRef(dc));
}

export const listSeasonsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSeasons');
}
listSeasonsRef.operationName = 'ListSeasons';

export function listSeasons(dc) {
  return executeQuery(listSeasonsRef(dc));
}

export const listAgeDivisionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAgeDivisions');
}
listAgeDivisionsRef.operationName = 'ListAgeDivisions';

export function listAgeDivisions(dc) {
  return executeQuery(listAgeDivisionsRef(dc));
}

export const listTeamClassesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTeamClasses');
}
listTeamClassesRef.operationName = 'ListTeamClasses';

export function listTeamClasses(dc) {
  return executeQuery(listTeamClassesRef(dc));
}

export const listTeamsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTeams');
}
listTeamsRef.operationName = 'ListTeams';

export function listTeams(dc) {
  return executeQuery(listTeamsRef(dc));
}

